"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Weight,
  Activity,
  AlertCircle,
  Clock,
  TrendingUp,
  ListChecks,
} from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface StudentProfileProps {
  student: any
  assignedRoutines: any[]
  workoutSessions: any[]
  coachId: string
}

export function StudentProfile({ student, assignedRoutines, workoutSessions }: StudentProfileProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const totalWorkouts = workoutSessions.filter((s) => s.status === "completed").length
  const totalExerciseTime = workoutSessions.reduce((acc, s) => acc + (s.total_exercise_time || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/coach/students">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Perfil del Alumno</h1>
              <p className="text-sm text-muted-foreground">{student.profiles.full_name || student.profiles.username}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Student Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl">{student.profiles.full_name || student.profiles.username}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4" />
                  {student.profiles.email}
                </CardDescription>
                <p className="text-xs text-muted-foreground mt-2">
                  Miembro desde{" "}
                  {formatDistanceToNow(new Date(student.profiles.created_at), {
                    addSuffix: true,
                    locale: es,
                  })}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {student.age && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Edad</span>
                  </div>
                  <p className="text-lg font-semibold">{student.age} años</p>
                </div>
              )}
              {student.weight && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Weight className="h-4 w-4" />
                    <span className="text-sm">Peso</span>
                  </div>
                  <p className="text-lg font-semibold">{student.weight} kg</p>
                </div>
              )}
              {student.sport && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Activity className="h-4 w-4" />
                    <span className="text-sm">Deporte</span>
                  </div>
                  <p className="text-lg font-semibold">{student.sport}</p>
                </div>
              )}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">Entrenamientos</span>
                </div>
                <p className="text-lg font-semibold">{totalWorkouts}</p>
              </div>
            </div>

            {student.medical_condition && (
              <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-destructive">Condición médica</p>
                    <p className="text-sm text-muted-foreground mt-1">{student.medical_condition}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Entrenamientos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{totalWorkouts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Tiempo Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">{formatDuration(totalExerciseTime)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Rutinas Asignadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{assignedRoutines.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Assigned Routines */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Rutinas Asignadas</CardTitle>
                <CardDescription>Rutinas activas para este alumno</CardDescription>
              </div>
              <ListChecks className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {assignedRoutines.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ListChecks className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No hay rutinas asignadas</p>
                <p className="text-sm mt-1">Asigna una rutina desde la sección de rutinas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignedRoutines.map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div>
                      <p className="font-medium">{assignment.routines.name}</p>
                      <p className="text-sm text-muted-foreground">{assignment.routines.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Asignada{" "}
                        {formatDistanceToNow(new Date(assignment.assigned_at), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </p>
                    </div>
                    <Badge>Activa</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Workouts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Historial de Entrenamientos</CardTitle>
                <CardDescription>Últimas sesiones completadas</CardDescription>
              </div>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {workoutSessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No hay entrenamientos registrados</p>
                <p className="text-sm mt-1">El historial aparecerá cuando el alumno complete sesiones</p>
              </div>
            ) : (
              <div className="space-y-3">
                {workoutSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{session.routines?.name || "Rutina sin nombre"}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(session.started_at), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </p>
                      <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                        <span>Ejercicio: {formatDuration(session.total_exercise_time)}</span>
                        <span>Descanso: {formatDuration(session.total_rest_time)}</span>
                        <span>Videos: {formatDuration(session.total_video_time)}</span>
                      </div>
                    </div>
                    <Badge variant={session.status === "completed" ? "default" : "secondary"}>
                      {session.status === "completed"
                        ? "Completado"
                        : session.status === "in_progress"
                          ? "En progreso"
                          : "Cancelado"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
