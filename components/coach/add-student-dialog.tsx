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
import { Loader2 } from "lucide-react"
import { createStudent } from "@/app/actions/create-student"

interface AddStudentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coachId: string
}

export function AddStudentDialog({ open, onOpenChange, coachId }: AddStudentDialogProps) {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    fullName: "",
    password: "",
    age: "",
    weight: "",
    sport: "",
    medicalCondition: "",
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await createStudent({
        email: formData.email,
        username: formData.username,
        fullName: formData.fullName,
        password: formData.password,
        age: formData.age ? Number.parseInt(formData.age) : undefined,
        weight: formData.weight ? Number.parseFloat(formData.weight) : undefined,
        sport: formData.sport || undefined,
        medicalCondition: formData.medicalCondition || undefined,
        coachId,
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      toast({
        title: "Alumno agregado",
        description: `${formData.fullName} ha sido registrado exitosamente`,
      })

      // Reset form
      setFormData({
        email: "",
        username: "",
        fullName: "",
        password: "",
        age: "",
        weight: "",
        sport: "",
        medicalCondition: "",
      })

      onOpenChange(false)
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo agregar el alumno",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Alumno</DialogTitle>
          <DialogDescription>Completa el formulario para registrar un nuevo alumno</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                Correo electrónico <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="alumno@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">
                Nombre de usuario <span className="text-destructive">*</span>
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="alumno123"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">
              Nombre completo <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Juan Pérez"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Contraseña <span className="text-destructive">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              disabled={loading}
              minLength={6}
            />
            <p className="text-xs text-muted-foreground">Mínimo 6 caracteres</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Edad</Label>
              <Input
                id="age"
                type="number"
                placeholder="25"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                disabled={loading}
                min="1"
                max="120"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="70.5"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                disabled={loading}
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sport">Deporte</Label>
              <Input
                id="sport"
                type="text"
                placeholder="Fútbol"
                value={formData.sport}
                onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="medicalCondition">Condición médica (opcional)</Label>
            <Textarea
              id="medicalCondition"
              placeholder="Describe cualquier condición médica relevante..."
              value={formData.medicalCondition}
              onChange={(e) => setFormData({ ...formData, medicalCondition: e.target.value })}
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Agregando...
                </>
              ) : (
                "Agregar Alumno"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
