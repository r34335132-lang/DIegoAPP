"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Send } from "lucide-react"
import Link from "next/link"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface StudentChatProps {
  studentId: string
  coach: any
}

export function StudentChat({ studentId, coach }: StudentChatProps) {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = getSupabaseBrowserClient()
  const { toast } = useToast()

  // Subscribe to new messages
  useEffect(() => {
    loadMessages()

    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMsg = payload.new
          if (
            (newMsg.sender_id === studentId && newMsg.receiver_id === coach.id) ||
            (newMsg.sender_id === coach.id && newMsg.receiver_id === studentId)
          ) {
            setMessages((prev) => [...prev, newMsg])
            scrollToBottom()
            if (newMsg.sender_id === coach.id) {
              markAsRead()
            }
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Auto scroll to bottom
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${studentId},receiver_id.eq.${coach.id}),and(sender_id.eq.${coach.id},receiver_id.eq.${studentId})`,
      )
      .order("created_at", { ascending: true })

    if (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los mensajes",
        variant: "destructive",
      })
      return
    }

    setMessages(data || [])
    markAsRead()
  }

  const markAsRead = async () => {
    await supabase
      .from("messages")
      .update({ read: true })
      .eq("sender_id", coach.id)
      .eq("receiver_id", studentId)
      .eq("read", false)
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || loading) return

    setLoading(true)

    try {
      const { error } = await supabase.from("messages").insert({
        sender_id: studentId,
        receiver_id: coach.id,
        content: newMessage.trim(),
      })

      if (error) throw error

      setNewMessage("")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar el mensaje",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/student">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <Avatar>
              <AvatarFallback>{getInitials(coach.full_name || coach.username)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold">{coach.full_name || coach.username}</h1>
              <p className="text-sm text-muted-foreground">Tu coach</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Card className="h-[calc(100vh-12rem)] flex flex-col">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No hay mensajes aún</p>
                  <p className="text-sm mt-1">Envía un mensaje para comenzar la conversación</p>
                </div>
              ) : (
                messages.map((message) => {
                  const isStudent = message.sender_id === studentId
                  return (
                    <div key={message.id} className={`flex ${isStudent ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          isStudent ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isStudent ? "text-primary-foreground/70" : "text-muted-foreground"
                          }`}
                        >
                          {formatDistanceToNow(new Date(message.created_at), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <CardContent className="border-t p-4">
            <form onSubmit={sendMessage} className="flex gap-2">
              <Input
                placeholder="Escribe un mensaje..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={loading}
                className="flex-1"
              />
              <Button type="submit" disabled={loading || !newMessage.trim()} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
