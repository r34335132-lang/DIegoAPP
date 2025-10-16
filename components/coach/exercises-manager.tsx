"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Plus, Search, Dumbbell, Play, Clock } from "lucide-react"
import Link from "next/link"
import { AddExerciseDialog } from "./add-exercise-dialog"
import type { Exercise } from "@/lib/types"

interface ExercisesManagerProps {
  exercises: Exercise[]
  coachId: string
}

export function ExercisesManager({ exercises, coachId }: ExercisesManagerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)

  const filteredExercises = exercises.filter(
    (exercise) =>
      exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "N/A"
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
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
                <h1 className="text-2xl font-bold">Mis Ejercicios</h1>
                <p className="text-sm text-muted-foreground">{exercises.length} ejercicios creados</p>
              </div>
            </div>
            <Button onClick={() => setShowAddDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Agregar Ejercicio</span>
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
                placeholder="Buscar ejercicios por nombre o descripción..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Exercises Grid */}
        {filteredExercises.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Dumbbell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">
                  {searchQuery ? "No se encontraron ejercicios" : "No tienes ejercicios creados"}
                </p>
                <p className="text-sm mt-1">
                  {searchQuery ? "Intenta con otro término de búsqueda" : "Agrega tu primer ejercicio para comenzar"}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setShowAddDialog(true)} className="mt-4 gap-2">
                    <Plus className="h-4 w-4" />
                    Agregar Ejercicio
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExercises.map((exercise) => (
              <Card key={exercise.id} className="hover:border-primary/50 transition-colors overflow-hidden">
                {exercise.video_url && (
                  <div className="aspect-video bg-muted relative group">
                    <video src={exercise.video_url} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="h-12 w-12 text-white" />
                    </div>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-1">{exercise.name}</CardTitle>
                    {exercise.duration_seconds && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                        <Clock className="h-3 w-3" />
                        {formatDuration(exercise.duration_seconds)}
                      </div>
                    )}
                  </div>
                  {exercise.description && (
                    <CardDescription className="line-clamp-2">{exercise.description}</CardDescription>
                  )}
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AddExerciseDialog open={showAddDialog} onOpenChange={setShowAddDialog} coachId={coachId} />
    </div>
  )
}
