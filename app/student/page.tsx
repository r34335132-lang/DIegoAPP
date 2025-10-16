import { getSupabaseServerClient } from "@/lib/supabase/server"
import { StudentDashboard } from "@/components/student/student-dashboard"

export default async function StudentPage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user!.id).single()

  // Get student info with coach
  const { data: student } = await supabase
    .from("students")
    .select(`
      *,
      coach:profiles!students_coach_id_fkey(
        full_name,
        username
      )
    `)
    .eq("id", user!.id)
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
    .eq("student_id", user!.id)

  // Get recent sessions
  const { data: recentSessions } = await supabase
    .from("workout_sessions")
    .select(`
      *,
      routines(name)
    `)
    .eq("student_id", user!.id)
    .order("started_at", { ascending: false })
    .limit(5)

  return (
    <StudentDashboard
      profile={profile}
      student={student}
      assignedRoutines={assignedRoutines || []}
      recentSessions={recentSessions || []}
    />
  )
}
