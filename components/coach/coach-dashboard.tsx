"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Dumbbell, ListChecks, Activity, LogOut, MessageSquare } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface CoachDashboardProps {
  profile: Profile
  stats: {
    students: number
    exercises: number
    routines: number
  }
  recentSessions: any[]
}

export function CoachDashboard({ profile, stats, recentSessions }: CoachDashboardProps) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Dumbbell className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">L.N Coach Diego Ibarra</h1>
                <p className="text-sm text-muted-foreground">Bienvenido, {profile.full_name || profile.username}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Cerrar sesión">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-2 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Alumnos</CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.students}</div>
              <p className="text-xs text-muted-foreground mt-1">Total de alumnos activos</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-secondary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Ejercicios</CardTitle>
              <Dumbbell className="h-5 w-5 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">{stats.exercises}</div>
              <p className="text-xs text-muted-foreground mt-1">Ejercicios creados</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-accent/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Rutinas</CardTitle>
              <ListChecks className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{stats.routines}</div>
              <p className="text-xs text-muted-foreground mt-1">Rutinas disponibles</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Gestiona tu plataforma de entrenamiento</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button asChild className="h-auto py-4 flex-col gap-2">
              <Link href="/coach/students">
                <Users className="h-6 w-6" />
                <span>Gestionar Alumnos</span>
              </Link>
            </Button>
            <Button asChild variant="secondary" className="h-auto py-4 flex-col gap-2">
              <Link href="/coach/exercises">
                <Dumbbell className="h-6 w-6" />
                <span>Mis Ejercicios</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent">
              <Link href="/coach/routines">
                <ListChecks className="h-6 w-6" />
                <span>Crear Rutinas</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent">
              <Link href="/coach/chat">
                <MessageSquare className="h-6 w-6" />
                <span>Mensajes</span>
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Actividad Reciente</CardTitle>
                <CardDescription>Últimas sesiones de entrenamiento</CardDescription>
              </div>
              <Activity className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {recentSessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No hay sesiones recientes</p>
                <p className="text-sm mt-1">Las sesiones de tus alumnos aparecerán aquí</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSessions.map((session: any) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {session.students.profiles.full_name || session.students.profiles.username}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {session.routines?.name || "Rutina sin nombre"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(session.started_at), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-sm font-medium">{formatDuration(session.total_exercise_time)}</div>
                      <div className="text-xs text-muted-foreground">ejercicio</div>
                      {session.status === "in_progress" && (
                        <div className="text-xs text-primary font-medium mt-1">En progreso</div>
                      )}
                    </div>
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
