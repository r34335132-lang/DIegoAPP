"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft,
  Plus,
  Search,
  Dumbbell,
  Play,
  Clock,
  Folder,
  FolderPlus,
  MoreVertical,
  Trash2,
  Edit,
  FolderOpen,
} from "lucide-react"
import Link from "next/link"
import { AddExerciseDialog } from "./add-exercise-dialog"
import { CreateFolderDialog } from "./create-folder-dialog"
import type { Exercise, ExerciseFolder } from "@/lib/types"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
import { deleteFolder, moveExerciseToFolder } from "@/app/actions/folders"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ExercisesManagerProps {
  exercises: Exercise[]
  folders: ExerciseFolder[]
  coachId: string
}

export function ExercisesManager({ exercises, folders, coachId }: ExercisesManagerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showFolderDialog, setShowFolderDialog] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState<ExerciseFolder | null>(null)
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null)
  const [activeFolder, setActiveFolder] = useState<string | null>(null)
  const { toast } = useToast()

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch =
      exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.description?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFolder = activeFolder === null || exercise.folder_id === activeFolder

    return matchesSearch && matchesFolder
  })

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "N/A"
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleDeleteFolder = async () => {
    if (!folderToDelete) return

    const result = await deleteFolder(folderToDelete)
    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Carpeta eliminada",
        description: "La carpeta se eliminó correctamente. Los ejercicios se movieron a 'Sin carpeta'.",
      })
      if (activeFolder === folderToDelete) {
        setActiveFolder(null)
      }
    }
    setFolderToDelete(null)
  }

  const handleMoveExercise = async (exerciseId: string, folderId: string | null) => {
    const result = await moveExerciseToFolder(exerciseId, folderId)
    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Ejercicio movido",
        description: "El ejercicio se movió correctamente",
      })
    }
  }

  const getExerciseCountByFolder = (folderId: string | null) => {
    return exercises.filter((ex) => ex.folder_id === folderId).length
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
                <h1 className="text-2xl font-bold">Mis Videos de Ejercicios</h1>
                <p className="text-sm text-muted-foreground">
                  {exercises.length} ejercicios • {folders.length} carpetas
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setSelectedFolder(null)
                  setShowFolderDialog(true)
                }}
                variant="outline"
                className="gap-2"
              >
                <FolderPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Nueva Carpeta</span>
              </Button>
              <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Agregar Ejercicio</span>
              </Button>
            </div>
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

        {/* Folders */}
        {folders.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Carpetas
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Card
                className={`cursor-pointer transition-all hover:border-primary/50 ${
                  activeFolder === null ? "border-primary border-2" : ""
                }`}
                onClick={() => setActiveFolder(null)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-base">Todos</CardTitle>
                    </div>
                    <span className="text-sm font-bold text-muted-foreground">{exercises.length}</span>
                  </div>
                </CardHeader>
              </Card>

              {folders.map((folder) => (
                <Card
                  key={folder.id}
                  className={`cursor-pointer transition-all hover:border-primary/50 ${
                    activeFolder === folder.id ? "border-2" : ""
                  }`}
                  style={{
                    borderColor: activeFolder === folder.id ? folder.color : undefined,
                  }}
                  onClick={() => setActiveFolder(folder.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Folder className="h-5 w-5 flex-shrink-0" style={{ color: folder.color }} />
                        <CardTitle className="text-base truncate">{folder.name}</CardTitle>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold text-muted-foreground">
                          {getExerciseCountByFolder(folder.id)}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedFolder(folder)
                                setShowFolderDialog(true)
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                setFolderToDelete(folder.id)
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    {folder.description && (
                      <CardDescription className="text-xs line-clamp-1">{folder.description}</CardDescription>
                    )}
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Exercises Grid */}
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            {activeFolder
              ? `Ejercicios en ${folders.find((f) => f.id === activeFolder)?.name}`
              : "Todos los Ejercicios"}
          </h2>

          {filteredExercises.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <Dumbbell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium">
                    {searchQuery
                      ? "No se encontraron ejercicios"
                      : activeFolder
                        ? "No hay ejercicios en esta carpeta"
                        : "No tienes ejercicios creados"}
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
                    <div className="pt-2">
                      <Select
                        value={exercise.folder_id || "none"}
                        onValueChange={(value) => handleMoveExercise(exercise.id, value === "none" ? null : value)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Sin carpeta" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sin carpeta</SelectItem>
                          {folders.map((folder) => (
                            <SelectItem key={folder.id} value={folder.id}>
                              <div className="flex items-center gap-2">
                                <Folder className="h-3 w-3" style={{ color: folder.color }} />
                                {folder.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <AddExerciseDialog open={showAddDialog} onOpenChange={setShowAddDialog} coachId={coachId} />
      <CreateFolderDialog
        open={showFolderDialog}
        onOpenChange={(open) => {
          setShowFolderDialog(open)
          if (!open) setSelectedFolder(null)
        }}
        folder={selectedFolder}
      />

      <AlertDialog open={!!folderToDelete} onOpenChange={() => setFolderToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar carpeta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Los ejercicios en esta carpeta se moverán a "Sin carpeta".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFolder} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
