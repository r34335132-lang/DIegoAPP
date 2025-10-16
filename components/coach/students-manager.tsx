"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Plus, Search, User, Mail, Calendar, Weight, Activity, AlertCircle } from "lucide-react"
import Link from "next/link"
import { AddStudentDialog } from "./add-student-dialog"
import { Badge } from "@/components/ui/badge"

interface StudentsManagerProps {
  students: any[]
  coachId: string
}

export function StudentsManager({ students, coachId }: StudentsManagerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)

  useEffect(() => {
    console.log("[v0] StudentsManager - Received students:", students)
    console.log("[v0] StudentsManager - Students count:", students?.length || 0)
    console.log("[v0] StudentsManager - First student:", students?.[0])
  }, [students])

  const getStudentName = (student: any) => {
    if (!student?.profiles) return "Sin nombre"
    return student.profiles.full_name || student.profiles.username || student.profiles.email || "Sin nombre"
  }

  const filteredStudents = students.filter((student) => {
    if (!student?.profiles) {
      console.log("[v0] Student missing profiles:", student)
      return false
    }
    const fullName = student.profiles.full_name || ""
    const username = student.profiles.username || ""
    const email = student.profiles.email || ""
    const query = searchQuery.toLowerCase()
    return (
      fullName.toLowerCase().includes(query) ||
      username.toLowerCase().includes(query) ||
      email.toLowerCase().includes(query)
    )
  })

  console.log("[v0] StudentsManager - Filtered students:", filteredStudents.length)

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
                <h1 className="text-2xl font-bold">Mis Alumnos</h1>
                <p className="text-sm text-muted-foreground">{students.length} alumnos registrados</p>
              </div>
            </div>
            <Button onClick={() => setShowAddDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Agregar Alumno</span>
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
                placeholder="Buscar por nombre, usuario o email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Students List */}
        {filteredStudents.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">
                  {searchQuery ? "No se encontraron alumnos" : "No tienes alumnos registrados"}
                </p>
                <p className="text-sm mt-1">
                  {searchQuery ? "Intenta con otro término de búsqueda" : "Agrega tu primer alumno para comenzar"}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setShowAddDialog(true)} className="mt-4 gap-2">
                    <Plus className="h-4 w-4" />
                    Agregar Alumno
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredStudents.map((student) => (
              <Card key={student.id} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{getStudentName(student)}</CardTitle>
                        <CardDescription className="flex items-center gap-1 truncate">
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          {student.profiles?.email || "Sin email"}
                        </CardDescription>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/coach/students/${student.id}`}>Ver Perfil</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {student.age && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Edad:</span>
                        <span className="font-medium">{student.age} años</span>
                      </div>
                    )}
                    {student.weight && (
                      <div className="flex items-center gap-2 text-sm">
                        <Weight className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Peso:</span>
                        <span className="font-medium">{student.weight} kg</span>
                      </div>
                    )}
                    {student.sport && (
                      <div className="flex items-center gap-2 text-sm">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Deporte:</span>
                        <span className="font-medium">{student.sport}</span>
                      </div>
                    )}
                    {student.medical_condition && (
                      <div className="flex items-center gap-2 text-sm col-span-2 sm:col-span-1">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        <Badge variant="destructive" className="text-xs">
                          Condición médica
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AddStudentDialog open={showAddDialog} onOpenChange={setShowAddDialog} coachId={coachId} />
    </div>
  )
}
