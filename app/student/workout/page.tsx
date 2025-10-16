import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { WorkoutTracker } from "@/components/student/workout-tracker"

export default async function WorkoutPage({
  searchParams,
}: {
  searchParams: Promise<{ routine?: string }>
}) {
  const { routine: routineId } = await searchParams
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profile?.role !== "student") {
    redirect("/coach")
  }

  // Get student info
  const { data: student } = await supabase
    .from("students")
    .select(`
      *,
      coach:profiles!students_coach_id_fkey(id, full_name, username)
    `)
    .eq("id", user.id)
    .single()

  // Get assigned routines
  const { data: assignedRoutines } = await supabase
    .from("student_routines")
    .select(`
      *,
      routines(
        *,
        routine_exercises(
          *,
          exercises(*)
        )
      )
    `)
    .eq("student_id", user.id)

  // If routineId is provided, find that specific routine
  let selectedRoutine = null
  if (routineId) {
    selectedRoutine = assignedRoutines?.find((ar) => ar.routines.id === routineId)?.routines
  }

  if (!assignedRoutines || assignedRoutines.length === 0) {
    redirect("/student")
  }

  return (
    <WorkoutTracker
      studentId={user.id}
      coachId={student?.coach_id}
      assignedRoutines={assignedRoutines}
      initialRoutine={selectedRoutine}
    />
  )
}
