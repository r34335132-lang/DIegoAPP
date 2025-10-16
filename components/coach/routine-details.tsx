"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Dumbbell, Users, Clock, UserPlus, X } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface RoutineDetailsProps {
  routine: any
  assignments: any[]
}

export function RoutineDetails({ routine, assignments }: RoutineDetailsProps) {
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [availableStudents, setAvailableStudents] = useState<any[]>([])
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "N/A"
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const loadAvailableStudents = async () => {
    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: studentsData } = await supabase.from("students").select("*").eq("coach_id", user.id)

      const students = studentsData || []
      const studentsWithProfiles = await Promise.all(
        students.map(async (student) => {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("id, full_name, username, email")
            .eq("id", student.id)
            .single()

          return {
            id: student.id,
            profiles: profileData,
          }
        }),
      )

      // Filter out already assigned students
      const assignedIds = assignments.map((a) => a.student_id)
      const available = studentsWithProfiles.filter((s) => !assignedIds.includes(s.id))
      setAvailableStudents(available)
      setShowAssignDialog(true)
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los alumnos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAssignStudents = async () => {
    if (selectedStudents.length === 0) return

    setLoading(true)
    try {
      const assignmentsToInsert = selectedStudents.map((studentId) => ({
        student_id: studentId,
        routine_id: routine.id,
      }))

      const { error } = await supabase.from("student_routines").insert(assignmentsToInsert)

      if (error) throw error

      toast({
        title: "Alumnos asignados",
        description: `${selectedStudents.length} alumno(s) asignado(s) exitosamente`,
      })

      setSelectedStudents([])
      setShowAssignDialog(false)
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudieron asignar los alumnos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUnassignStudent = async (assignmentId: string) => {
    try {
      const { error } = await supabase.from("student_routines").delete().eq("id", assignmentId)

      if (error) throw error

      toast({
        title: "Alumno desasignado",
        description: "El alumno ha sido desasignado de esta rutina",
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo desasignar el alumno",
        variant: "destructive",
      })
    }
  }

  const getStudentName = (student: any) => {
    if (!student?.profiles) return "Sin nombre"
    return student.profiles.full_name || student.profiles.username || student.profiles.email || "Sin nombre"
  }

  const toggleStudent = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId],
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/coach/routines">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{routine.name}</h1>
              <p className="text-sm text-muted-foreground">{routine.description}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Ejercicios</CardTitle>
              <Dumbbell className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{routine.routine_exercises?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Alumnos Asignados</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">{assignments.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Exercises */}
        <Card>
          <CardHeader>
            <CardTitle>Ejercicios de la Rutina</CardTitle>
            <CardDescription>Secuencia de ejercicios en orden</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {routine.routine_exercises?.map((re: any, index: number) => (
                <div key={re.id} className="flex items-start gap-4 p-4 rounded-lg border bg-card">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg">{re.exercises.name}</h3>
                    {re.exercises.description && (
                      <p className="text-sm text-muted-foreground mt-1">{re.exercises.description}</p>
                    )}
                    <div className="flex flex-wrap gap-3 mt-3">
                      <Badge variant="secondary">
                        {re.sets} series × {re.reps} reps
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" />
                        Descanso: {re.rest_seconds}s
                      </Badge>
                      {re.exercises.duration_seconds && (
                        <Badge variant="outline">Duración: {formatDuration(re.exercises.duration_seconds)}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Alumnos con esta Rutina</CardTitle>
                <CardDescription>Estudiantes que tienen asignada esta rutina</CardDescription>
              </div>
              <Button onClick={loadAvailableStudents} disabled={loading} size="sm" className="gap-2">
                <UserPlus className="h-4 w-4" />
                Asignar Alumnos
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {assignments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No hay alumnos asignados</p>
                <Button onClick={loadAvailableStudents} disabled={loading} size="sm" className="mt-4 gap-2">
                  <UserPlus className="h-4 w-4" />
                  Asignar Alumnos
                </Button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{getStudentName(assignment.students)}</p>
                      <p className="text-xs text-muted-foreground">Alumno activo</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleUnassignStudent(assignment.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar Alumnos a la Rutina</DialogTitle>
            <DialogDescription>Selecciona los alumnos que quieres asignar a esta rutina</DialogDescription>
          </DialogHeader>

          {availableStudents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay alumnos disponibles para asignar</p>
              <p className="text-sm mt-1">Todos tus alumnos ya tienen esta rutina asignada</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border rounded-lg p-3 max-h-60 overflow-y-auto space-y-2">
                {availableStudents.map((student) => (
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

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowAssignDialog(false)}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAssignStudents}
                  disabled={loading || selectedStudents.length === 0}
                  className="flex-1"
                >
                  {loading ? "Asignando..." : `Asignar (${selectedStudents.length})`}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
