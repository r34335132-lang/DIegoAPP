"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dumbbell, LogOut, MessageSquare, Activity, Clock, TrendingUp, Play } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Stopwatch } from "./stopwatch"

interface StudentDashboardProps {
  profile: Profile
  student: any
  assignedRoutines: any[]
  recentSessions: any[]
}

export function StudentDashboard({ profile, student, assignedRoutines, recentSessions }: StudentDashboardProps) {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const totalWorkouts = recentSessions.filter((s) => s.status === "completed").length
  const totalTime = recentSessions.reduce((acc, s) => acc + (s.total_exercise_time || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Dumbbell className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Mi Entrenamiento</h1>
                <p className="text-sm text-muted-foreground">
                  Coach: {student?.coach?.full_name || student?.coach?.username}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Card className="border-2 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Entrenamientos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{totalWorkouts}</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-secondary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Tiempo Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">{formatDuration(totalTime)}</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-accent/20 col-span-2 sm:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Rutinas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{assignedRoutines.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button asChild className="h-auto py-4 flex-col gap-2" disabled={assignedRoutines.length === 0}>
              <Link href="/student/workout">
                <Play className="h-6 w-6" />
                <span>Iniciar Entrenamiento</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent">
              <Link href="/student/chat">
                <MessageSquare className="h-6 w-6" />
                <span>Chat con Coach</span>
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Stopwatch */}
        <Stopwatch />

        {/* Assigned Routines */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Mis Rutinas</CardTitle>
                <CardDescription>Rutinas asignadas por tu coach</CardDescription>
              </div>
              <Activity className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {assignedRoutines.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No tienes rutinas asignadas</p>
                <p className="text-sm mt-1">Tu coach te asignará rutinas pronto</p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignedRoutines.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-lg">{assignment.routines.name}</p>
                      <p className="text-sm text-muted-foreground">{assignment.routines.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span>{assignment.routines.routine_exercises?.length || 0} ejercicios</span>
                        <span>
                          Asignada{" "}
                          {formatDistanceToNow(new Date(assignment.assigned_at), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </span>
                      </div>
                    </div>
                    <Button asChild>
                      <Link href={`/student/workout?routine=${assignment.routines.id}`}>
                        <Play className="h-4 w-4 mr-2" />
                        Iniciar
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Historial Reciente</CardTitle>
                <CardDescription>Tus últimos entrenamientos</CardDescription>
              </div>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {recentSessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No hay entrenamientos registrados</p>
                <p className="text-sm mt-1">Comienza tu primer entrenamiento ahora</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{session.routines?.name || "Rutina"}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(session.started_at), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </p>
                      <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                        <span>Ejercicio: {formatDuration(session.total_exercise_time)}</span>
                        <span>Descanso: {formatDuration(session.total_rest_time)}</span>
                      </div>
                    </div>
                    <Badge variant={session.status === "completed" ? "default" : "secondary"}>
                      {session.status === "completed" ? "Completado" : "En progreso"}
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
