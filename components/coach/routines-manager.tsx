"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Plus, Search, ListChecks, Dumbbell, Users, Trash2 } from "lucide-react"
import Link from "next/link"
import { CreateRoutineDialog } from "./create-routine-dialog"
import { Badge } from "@/components/ui/badge"
import type { Exercise } from "@/lib/types"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface RoutinesManagerProps {
  routines: any[]
  exercises: Exercise[]
  students: any[]
  coachId: string
}

export function RoutinesManager({ routines, exercises, students, coachId }: RoutinesManagerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [deleteRoutineId, setDeleteRoutineId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  const filteredRoutines = routines.filter(
    (routine) =>
      routine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      routine.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleDeleteRoutine = async () => {
    if (!deleteRoutineId) return

    setDeleting(true)
    try {
      const { error } = await supabase.from("routines").delete().eq("id", deleteRoutineId)

      if (error) throw error

      toast({
        title: "Rutina eliminada",
        description: "La rutina ha sido eliminada exitosamente",
      })

      setDeleteRoutineId(null)
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la rutina",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/coach">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Mis Rutinas</h1>
                <p className="text-sm text-muted-foreground">{routines.length} rutinas creadas</p>
              </div>
            </div>
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Crear Rutina</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar rutinas por nombre o descripción..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Routines List */}
        {filteredRoutines.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <ListChecks className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">
                  {searchQuery ? "No se encontraron rutinas" : "No tienes rutinas creadas"}
                </p>
                <p className="text-sm mt-1">
                  {searchQuery ? "Intenta con otro término de búsqueda" : "Crea tu primera rutina para comenzar"}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setShowCreateDialog(true)} className="mt-4 gap-2">
                    <Plus className="h-4 w-4" />
                    Crear Rutina
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredRoutines.map((routine) => (
              <Card key={routine.id} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-xl">{routine.name}</CardTitle>
                      {routine.description && <CardDescription className="mt-1">{routine.description}</CardDescription>}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/coach/routines/${routine.id}`}>Ver Detalles</Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteRoutineId(routine.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Ejercicios:</span>
                      <Badge variant="secondary">{routine.routine_exercises?.length || 0}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Alumnos:</span>
                      <Badge variant="secondary">{routine.assignedStudentsCount || 0}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CreateRoutineDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        coachId={coachId}
        exercises={exercises}
        students={students}
      />

      <AlertDialog open={!!deleteRoutineId} onOpenChange={() => setDeleteRoutineId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar rutina?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La rutina será eliminada permanentemente y se desasignará de todos los
              alumnos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRoutine} disabled={deleting} className="bg-destructive">
              {deleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
