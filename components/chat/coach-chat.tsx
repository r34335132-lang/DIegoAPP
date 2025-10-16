"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Send, User, MessageSquare } from "lucide-react"
import Link from "next/link"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface CoachChatProps {
  coachId: string
  students: any[]
}

export function CoachChat({ coachId, students }: CoachChatProps) {
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = getSupabaseBrowserClient()
  const { toast } = useToast()

  const getStudentName = (student: any) => {
    if (!student?.profiles) return "Sin nombre"
    return student.profiles.full_name || student.profiles.username || student.profiles.email || "Sin nombre"
  }

  // Load unread counts for all students
  useEffect(() => {
    loadUnreadCounts()
  }, [])

  // Subscribe to new messages
  useEffect(() => {
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
            (newMsg.sender_id === coachId && newMsg.receiver_id === selectedStudent?.id) ||
            (newMsg.sender_id === selectedStudent?.id && newMsg.receiver_id === coachId)
          ) {
            setMessages((prev) => [...prev, newMsg])
            scrollToBottom()
          }
          loadUnreadCounts()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedStudent])

  // Load messages when student is selected
  useEffect(() => {
    if (selectedStudent) {
      loadMessages()
      markAsRead()
    }
  }, [selectedStudent])

  // Auto scroll to bottom
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadUnreadCounts = async () => {
    const counts: Record<string, number> = {}
    for (const student of students) {
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("sender_id", student.id)
        .eq("receiver_id", coachId)
        .eq("read", false)

      counts[student.id] = count || 0
    }
    setUnreadCounts(counts)
  }

  const loadMessages = async () => {
    if (!selectedStudent) return

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${coachId},receiver_id.eq.${selectedStudent.id}),and(sender_id.eq.${selectedStudent.id},receiver_id.eq.${coachId})`,
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
  }

  const markAsRead = async () => {
    if (!selectedStudent) return

    await supabase
      .from("messages")
      .update({ read: true })
      .eq("sender_id", selectedStudent.id)
      .eq("receiver_id", coachId)
      .eq("read", false)

    loadUnreadCounts()
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedStudent || loading) return

    setLoading(true)

    try {
      const { error } = await supabase.from("messages").insert({
        sender_id: coachId,
        receiver_id: selectedStudent.id,
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
              <Link href="/coach">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Mensajes</h1>
              <p className="text-sm text-muted-foreground">Chatea con tus alumnos</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
          {/* Students List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Alumnos</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-16rem)]">
                {students.length === 0 ? (
                  <div className="text-center py-8 px-4 text-muted-foreground">
                    <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No tienes alumnos</p>
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {students.map((student) => (
                      <button
                        key={student.id}
                        onClick={() => setSelectedStudent(student)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                          selectedStudent?.id === student.id ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                        }`}
                      >
                        <Avatar>
                          <AvatarFallback>{getInitials(getStudentName(student))}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-left min-w-0">
                          <p className="font-medium truncate">{getStudentName(student)}</p>
                          <p
                            className={`text-xs truncate ${
                              selectedStudent?.id === student.id
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            }`}
                          >
                            {student.profiles?.email || "Sin email"}
                          </p>
                        </div>
                        {unreadCounts[student.id] > 0 && (
                          <Badge variant="destructive" className="ml-auto">
                            {unreadCounts[student.id]}
                          </Badge>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2 flex flex-col">
            {selectedStudent ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{getInitials(getStudentName(selectedStudent))}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{getStudentName(selectedStudent)}</CardTitle>
                      <p className="text-xs text-muted-foreground">{selectedStudent.profiles?.email || "Sin email"}</p>
                    </div>
                  </div>
                </CardHeader>

                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isCoach = message.sender_id === coachId
                      return (
                        <div key={message.id} className={`flex ${isCoach ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              isCoach ? "bg-primary text-primary-foreground" : "bg-muted"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                isCoach ? "text-primary-foreground/70" : "text-muted-foreground"
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
                    })}
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
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Selecciona un alumno</p>
                  <p className="text-sm mt-1">Elige un alumno de la lista para comenzar a chatear</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
