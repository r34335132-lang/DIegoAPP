"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Play, Pause, SkipForward, CheckCircle2, Timer, Eye, Dumbbell } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface WorkoutTrackerProps {
  studentId: string
  coachId: string
  assignedRoutines: any[]
  initialRoutine?: any
}

type WorkoutPhase = "idle" | "exercise" | "rest" | "video" | "completed"

export function WorkoutTracker({ studentId, coachId, assignedRoutines, initialRoutine }: WorkoutTrackerProps) {
  const [selectedRoutine, setSelectedRoutine] = useState(initialRoutine || assignedRoutines[0]?.routines)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [phase, setPhase] = useState<WorkoutPhase>("idle")
  const [timer, setTimer] = useState(0)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessionStats, setSessionStats] = useState({
    exerciseTime: 0,
    restTime: 0,
    videoTime: 0,
  })

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const { toast } = useToast()

  const exercises = selectedRoutine?.routine_exercises || []
  const currentExercise = exercises[currentExerciseIndex]

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  useEffect(() => {
    if (phase === "idle" || phase === "completed") {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    timerRef.current = setInterval(() => {
      setTimer((prev) => prev + 1)
      setSessionStats((prev) => ({
        ...prev,
        exerciseTime: phase === "exercise" ? prev.exerciseTime + 1 : prev.exerciseTime,
        restTime: phase === "rest" ? prev.restTime + 1 : prev.restTime,
        videoTime: phase === "video" ? prev.videoTime + 1 : prev.videoTime,
      }))
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [phase])

  const startWorkout = async () => {
    try {
      // Create workout session
      const { data, error } = await supabase
        .from("workout_sessions")
        .insert({
          student_id: studentId,
          routine_id: selectedRoutine.id,
          status: "in_progress",
        })
        .select()
        .single()

      if (error) throw error

      setSessionId(data.id)
      setPhase("exercise")
      setTimer(0)

      // Notify coach
      await supabase.from("messages").insert({
        sender_id: studentId,
        receiver_id: coachId,
        content: `He iniciado la rutina: ${selectedRoutine.name}`,
      })

      toast({
        title: "Entrenamiento iniciado",
        description: "Tu coach ha sido notificado",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const pauseWorkout = () => {
    setPhase("idle")
  }

  const resumeWorkout = () => {
    setPhase("exercise")
  }

  const startRest = () => {
    setPhase("rest")
    setTimer(0)
  }

  const watchVideo = () => {
    setPhase("video")
    setTimer(0)
    if (videoRef.current) {
      videoRef.current.play()
    }
  }

  const nextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1)
      setPhase("exercise")
      setTimer(0)
    } else {
      completeWorkout()
    }
  }

  const completeWorkout = async () => {
    if (!sessionId) return

    try {
      // Update session
      await supabase
        .from("workout_sessions")
        .update({
          ended_at: new Date().toISOString(),
          total_exercise_time: sessionStats.exerciseTime,
          total_rest_time: sessionStats.restTime,
          total_video_time: sessionStats.videoTime,
          status: "completed",
        })
        .eq("id", sessionId)

      // Notify coach with stats
      await supabase.from("messages").insert({
        sender_id: studentId,
        receiver_id: coachId,
        content: `He completado la rutina: ${selectedRoutine.name}\n\nEstadísticas:\n- Tiempo ejercicio: ${formatDuration(sessionStats.exerciseTime)}\n- Tiempo descanso: ${formatDuration(sessionStats.restTime)}\n- Tiempo viendo videos: ${formatDuration(sessionStats.videoTime)}`,
      })

      setPhase("completed")

      toast({
        title: "Entrenamiento completado",
        description: "Las estadísticas han sido enviadas a tu coach",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const progress = ((currentExerciseIndex + 1) / exercises.length) * 100

  if (phase === "completed") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Entrenamiento Completado</CardTitle>
            <CardDescription>Excelente trabajo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted">
                <span className="text-sm text-muted-foreground">Tiempo de ejercicio</span>
                <span className="font-bold text-primary">{formatDuration(sessionStats.exerciseTime)}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted">
                <span className="text-sm text-muted-foreground">Tiempo de descanso</span>
                <span className="font-bold text-secondary">{formatDuration(sessionStats.restTime)}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted">
                <span className="text-sm text-muted-foreground">Tiempo viendo videos</span>
                <span className="font-bold text-accent">{formatDuration(sessionStats.videoTime)}</span>
              </div>
            </div>
            <Button asChild className="w-full">
              <Link href="/student">Volver al Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/student">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">Entrenamiento</h1>
              {phase !== "idle" && (
                <p className="text-sm text-muted-foreground">
                  Ejercicio {currentExerciseIndex + 1} de {exercises.length}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6 max-w-2xl">
        {phase === "idle" ? (
          <>
            {/* Routine Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Selecciona una Rutina</CardTitle>
                <CardDescription>Elige la rutina que deseas realizar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  value={selectedRoutine?.id}
                  onValueChange={(value) => {
                    const routine = assignedRoutines.find((ar) => ar.routines.id === value)?.routines
                    setSelectedRoutine(routine)
                    setCurrentExerciseIndex(0)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {assignedRoutines.map((ar) => (
                      <SelectItem key={ar.routines.id} value={ar.routines.id}>
                        {ar.routines.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedRoutine && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">{selectedRoutine.description}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <Dumbbell className="h-4 w-4 text-muted-foreground" />
                      <span>{exercises.length} ejercicios</span>
                    </div>
                  </div>
                )}

                <Button onClick={startWorkout} className="w-full" size="lg">
                  <Play className="h-5 w-5 mr-2" />
                  Iniciar Entrenamiento
                </Button>
              </CardContent>
            </Card>

            {/* Exercise Preview */}
            {selectedRoutine && (
              <Card>
                <CardHeader>
                  <CardTitle>Ejercicios de la Rutina</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {exercises.map((ex: any, index: number) => (
                      <div key={ex.id} className="flex items-center gap-3 p-3 rounded-lg border">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{ex.exercises.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {ex.sets} series × {ex.reps} reps
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <>
            {/* Progress */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progreso</span>
                    <span className="font-medium">
                      {currentExerciseIndex + 1}/{exercises.length}
                    </span>
                  </div>
                  <Progress value={progress} />
                </div>
              </CardContent>
            </Card>

            {/* Current Exercise */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">{currentExercise?.exercises.name}</CardTitle>
                  <Badge variant={phase === "exercise" ? "default" : phase === "rest" ? "secondary" : "outline"}>
                    {phase === "exercise" ? "Ejercicio" : phase === "rest" ? "Descanso" : "Video"}
                  </Badge>
                </div>
                <CardDescription>
                  {currentExercise?.sets} series × {currentExercise?.reps} repeticiones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentExercise?.exercises.description && (
                  <p className="text-sm text-muted-foreground">{currentExercise.exercises.description}</p>
                )}

                {/* Timer */}
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center h-32 w-32 rounded-full bg-primary/10 mb-4">
                    <Timer className="h-12 w-12 text-primary" />
                  </div>
                  <div className="text-5xl font-bold">{formatDuration(timer)}</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {phase === "exercise"
                      ? "Tiempo de ejercicio"
                      : phase === "rest"
                        ? "Tiempo de descanso"
                        : "Viendo video"}
                  </p>
                </div>

                {/* Video */}
                {currentExercise?.exercises.video_url && phase === "video" && (
                  <div className="aspect-video rounded-lg overflow-hidden bg-black">
                    <video
                      ref={videoRef}
                      src={currentExercise.exercises.video_url}
                      controls
                      className="w-full h-full"
                      onEnded={() => setPhase("exercise")}
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                  {phase === "exercise" && (
                    <>
                      <Button onClick={startRest} variant="secondary" size="lg">
                        <Pause className="h-5 w-5 mr-2" />
                        Descansar
                      </Button>
                      {currentExercise?.exercises.video_url && (
                        <Button onClick={watchVideo} variant="outline" size="lg">
                          <Eye className="h-5 w-5 mr-2" />
                          Ver Video
                        </Button>
                      )}
                    </>
                  )}
                  {phase === "rest" && (
                    <Button onClick={resumeWorkout} variant="default" size="lg" className="col-span-2">
                      <Play className="h-5 w-5 mr-2" />
                      Continuar
                    </Button>
                  )}
                  <Button onClick={nextExercise} variant="outline" size="lg" className="col-span-2 bg-transparent">
                    <SkipForward className="h-5 w-5 mr-2" />
                    {currentExerciseIndex < exercises.length - 1 ? "Siguiente Ejercicio" : "Finalizar"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Session Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Estadísticas de la Sesión</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{formatDuration(sessionStats.exerciseTime)}</div>
                    <p className="text-xs text-muted-foreground">Ejercicio</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-secondary">{formatDuration(sessionStats.restTime)}</div>
                    <p className="text-xs text-muted-foreground">Descanso</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-accent">{formatDuration(sessionStats.videoTime)}</div>
                    <p className="text-xs text-muted-foreground">Videos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
