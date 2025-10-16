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
import { Loader2, Plus, X, GripVertical } from "lucide-react"
import type { Exercise } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface CreateRoutineDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coachId: string
  exercises: Exercise[]
  students: any[]
}

interface RoutineExercise {
  exerciseId: string
  sets: number
  reps: number
  restSeconds: number
}

export function CreateRoutineDialog({ open, onOpenChange, coachId, exercises, students }: CreateRoutineDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })
  const [routineExercises, setRoutineExercises] = useState<RoutineExercise[]>([])
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  console.log("[v0] CreateRoutineDialog - Students received:", students)
  console.log("[v0] CreateRoutineDialog - Students count:", students.length)

  const getStudentName = (student: any) => {
    if (!student?.profiles) return "Sin nombre"
    return student.profiles.full_name || student.profiles.username || student.profiles.email || "Sin nombre"
  }

  const addExercise = () => {
    if (exercises.length === 0) {
      toast({
        title: "No hay ejercicios",
        description: "Primero debes crear ejercicios antes de crear una rutina",
        variant: "destructive",
      })
      return
    }
    setRoutineExercises([...routineExercises, { exerciseId: exercises[0].id, sets: 3, reps: 10, restSeconds: 60 }])
  }

  const removeExercise = (index: number) => {
    setRoutineExercises(routineExercises.filter((_, i) => i !== index))
  }

  const updateExercise = (index: number, field: keyof RoutineExercise, value: string | number) => {
    const updated = [...routineExercises]
    updated[index] = { ...updated[index], [field]: value }
    setRoutineExercises(updated)
  }

  const toggleStudent = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId],
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (routineExercises.length === 0) {
      toast({
        title: "Error",
        description: "Debes agregar al menos un ejercicio a la rutina",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Create routine
      const { data: routine, error: routineError } = await supabase
        .from("routines")
        .insert({
          coach_id: coachId,
          name: formData.name,
          description: formData.description || null,
        })
        .select()
        .single()

      if (routineError) throw routineError

      // Add exercises to routine
      const exercisesToInsert = routineExercises.map((ex, index) => ({
        routine_id: routine.id,
        exercise_id: ex.exerciseId,
        order_index: index,
        sets: ex.sets,
        reps: ex.reps,
        rest_seconds: ex.restSeconds,
      }))

      const { error: exercisesError } = await supabase.from("routine_exercises").insert(exercisesToInsert)

      if (exercisesError) throw exercisesError

      // Assign to students if selected
      if (selectedStudents.length > 0) {
        const assignments = selectedStudents.map((studentId) => ({
          student_id: studentId,
          routine_id: routine.id,
        }))

        const { error: assignError } = await supabase.from("student_routines").insert(assignments)

        if (assignError) throw assignError
      }

      toast({
        title: "Rutina creada",
        description: `${formData.name} ha sido creada exitosamente`,
      })

      // Reset form
      setFormData({ name: "", description: "" })
      setRoutineExercises([])
      setSelectedStudents([])

      onOpenChange(false)
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la rutina",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nueva Rutina</DialogTitle>
          <DialogDescription>Diseña una rutina personalizada para tus alumnos</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nombre de la rutina <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Rutina de fuerza nivel 1"
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
                placeholder="Describe el objetivo y características de la rutina..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={loading}
                rows={2}
              />
            </div>
          </div>

          {/* Exercises */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Ejercicios de la rutina</Label>
              <Button type="button" variant="outline" size="sm" onClick={addExercise} disabled={loading}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Ejercicio
              </Button>
            </div>

            {routineExercises.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
                <p className="text-sm">No hay ejercicios agregados</p>
                <p className="text-xs mt-1">Haz clic en "Agregar Ejercicio" para comenzar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {routineExercises.map((routineEx, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg bg-card">
                    <GripVertical className="h-5 w-5 text-muted-foreground mt-2 flex-shrink-0" />
                    <div className="flex-1 grid sm:grid-cols-5 gap-3">
                      <div className="sm:col-span-2 space-y-1">
                        <Label className="text-xs">Ejercicio</Label>
                        <Select
                          value={routineEx.exerciseId}
                          onValueChange={(value) => updateExercise(index, "exerciseId", value)}
                          disabled={loading}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {exercises.map((ex) => (
                              <SelectItem key={ex.id} value={ex.id}>
                                {ex.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Series</Label>
                        <Input
                          type="number"
                          value={routineEx.sets}
                          onChange={(e) => updateExercise(index, "sets", Number.parseInt(e.target.value))}
                          min="1"
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Reps</Label>
                        <Input
                          type="number"
                          value={routineEx.reps}
                          onChange={(e) => updateExercise(index, "reps", Number.parseInt(e.target.value))}
                          min="1"
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Descanso (s)</Label>
                        <Input
                          type="number"
                          value={routineEx.restSeconds}
                          onChange={(e) => updateExercise(index, "restSeconds", Number.parseInt(e.target.value))}
                          min="0"
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeExercise(index)}
                      disabled={loading}
                      className="flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assign to students */}
          {students.length === 0 ? (
            <div className="space-y-3">
              <Label>Asignar a alumnos (opcional)</Label>
              <div className="border rounded-lg p-4 text-center text-muted-foreground">
                <p className="text-sm">No hay alumnos registrados</p>
                <p className="text-xs mt-1">Primero debes agregar alumnos para poder asignarles rutinas</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Label>Asignar a alumnos (opcional)</Label>
              <div className="border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`student-${student.id}`}
                      checked={selectedStudents.includes(student.id)}
                      onCheckedChange={() => toggleStudent(student.id)}
                      disabled={loading}
                    />
                    <Label htmlFor={`student-${student.id}`} className="cursor-pointer flex-1">
                      {getStudentName(student)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                  Creando...
                </>
              ) : (
                "Crear Rutina"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
