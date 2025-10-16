"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Loader2, Upload, X } from "lucide-react"

interface AddExerciseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coachId: string
}

export function AddExerciseDialog({ open, onOpenChange, coachId }: AddExerciseDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    durationMinutes: "",
    durationSeconds: "",
  })
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        // 100MB limit
        toast({
          title: "Archivo muy grande",
          description: "El video no debe superar los 100MB",
          variant: "destructive",
        })
        return
      }
      setVideoFile(file)
      const previewUrl = URL.createObjectURL(file)
      setVideoPreviewUrl(previewUrl)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open && videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl)
      setVideoPreviewUrl(null)
    }
    onOpenChange(open)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let videoUrl = null

      // Upload video to Blob if provided
      if (videoFile) {
        const formDataBlob = new FormData()
        formDataBlob.append("file", videoFile)

        const uploadResponse = await fetch("/api/upload-video", {
          method: "POST",
          body: formDataBlob,
        })

        if (!uploadResponse.ok) {
          throw new Error("Error al subir el video")
        }

        const { url } = await uploadResponse.json()
        videoUrl = url
      }

      // Calculate total duration in seconds
      const totalSeconds =
        (formData.durationMinutes ? Number.parseInt(formData.durationMinutes) * 60 : 0) +
        (formData.durationSeconds ? Number.parseInt(formData.durationSeconds) : 0)

      // Create exercise
      const { error } = await supabase.from("exercises").insert({
        coach_id: coachId,
        name: formData.name,
        description: formData.description || null,
        video_url: videoUrl,
        duration_seconds: totalSeconds > 0 ? totalSeconds : null,
      })

      if (error) throw error

      toast({
        title: "Ejercicio creado",
        description: `${formData.name} ha sido agregado exitosamente`,
      })

      // Reset form
      setFormData({
        name: "",
        description: "",
        durationMinutes: "",
        durationSeconds: "",
      })
      setVideoFile(null)
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl)
        setVideoPreviewUrl(null)
      }

      onOpenChange(false)
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el ejercicio",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Ejercicio</DialogTitle>
          <DialogDescription>Completa el formulario para crear un ejercicio</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Nombre del ejercicio <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Sentadillas"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Describe el ejercicio, técnica, músculos trabajados..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Duración estimada</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="durationMinutes" className="text-xs text-muted-foreground">
                  Minutos
                </Label>
                <Input
                  id="durationMinutes"
                  type="number"
                  placeholder="0"
                  value={formData.durationMinutes}
                  onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                  disabled={loading}
                  min="0"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="durationSeconds" className="text-xs text-muted-foreground">
                  Segundos
                </Label>
                <Input
                  id="durationSeconds"
                  type="number"
                  placeholder="0"
                  value={formData.durationSeconds}
                  onChange={(e) => setFormData({ ...formData, durationSeconds: e.target.value })}
                  disabled={loading}
                  min="0"
                  max="59"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="video">Video del ejercicio</Label>
            {videoFile ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{videoFile.name}</p>
                    <p className="text-xs text-muted-foreground">{(videoFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setVideoFile(null)
                      if (videoPreviewUrl) {
                        URL.revokeObjectURL(videoPreviewUrl)
                        setVideoPreviewUrl(null)
                      }
                    }}
                    disabled={loading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {videoPreviewUrl && (
                  <div className="rounded-lg overflow-hidden border bg-black">
                    <video src={videoPreviewUrl} controls className="w-full max-h-64" preload="metadata">
                      Tu navegador no soporta la reproducción de video.
                    </video>
                  </div>
                )}
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <Label htmlFor="video" className="cursor-pointer">
                  <span className="text-sm text-primary hover:underline">Selecciona un video</span>
                  <span className="text-sm text-muted-foreground"> o arrastra aquí</span>
                </Label>
                <Input
                  id="video"
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  disabled={loading}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground mt-1">Máximo 100MB</p>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear Ejercicio"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
