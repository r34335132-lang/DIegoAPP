"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { createFolder, updateFolder } from "@/app/actions/folders"
import type { ExerciseFolder } from "@/lib/types"

interface CreateFolderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  folder?: ExerciseFolder | null
}

const FOLDER_COLORS = [
  { name: "Naranja", value: "#ff6b35" },
  { name: "Azul", value: "#4a90e2" },
  { name: "Verde", value: "#50c878" },
  { name: "Morado", value: "#9b59b6" },
  { name: "Rojo", value: "#e74c3c" },
  { name: "Amarillo", value: "#f39c12" },
  { name: "Rosa", value: "#ec4899" },
  { name: "Turquesa", value: "#14b8a6" },
]

export function CreateFolderDialog({ open, onOpenChange, folder }: CreateFolderDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedColor, setSelectedColor] = useState(folder?.color || "#ff6b35")
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set("color", selectedColor)

    const result = folder ? await updateFolder(folder.id, formData) : await createFolder(formData)

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: folder ? "Carpeta actualizada" : "Carpeta creada",
        description: folder ? "La carpeta se actualizó correctamente" : "La carpeta se creó correctamente",
      })
      onOpenChange(false)
    }

    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{folder ? "Editar Carpeta" : "Nueva Carpeta"}</DialogTitle>
          <DialogDescription>
            {folder ? "Modifica los detalles de la carpeta" : "Crea una carpeta para organizar tus videos"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la carpeta</Label>
            <Input id="name" name="name" placeholder="Ej: Ejercicios de piernas" defaultValue={folder?.name} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe el contenido de esta carpeta..."
              defaultValue={folder?.description || ""}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Color de la carpeta</Label>
            <div className="grid grid-cols-4 gap-2">
              {FOLDER_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`h-10 rounded-md border-2 transition-all ${
                    selectedColor === color.value ? "border-foreground scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : folder ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
