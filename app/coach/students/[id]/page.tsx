import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { StudentProfile } from "@/components/coach/student-profile"

export default async function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profile?.role !== "coach") {
    redirect("/student")
  }

  // Get student details
  const { data: student } = await supabase
    .from("students")
    .select(`
      *,
      profiles!inner(
        id,
        email,
        username,
        full_name,
        created_at
      )
    `)
    .eq("id", id)
    .eq("coach_id", user.id)
    .single()

  if (!student) {
    redirect("/coach/students")
  }

  // Get assigned routines
  const { data: assignedRoutines } = await supabase
    .from("student_routines")
    .select(`
      *,
      routines(*)
    `)
    .eq("student_id", id)

  // Get workout sessions
  const { data: workoutSessions } = await supabase
    .from("workout_sessions")
    .select(`
      *,
      routines(name)
    `)
    .eq("student_id", id)
    .order("started_at", { ascending: false })
    .limit(10)

  return (
    <StudentProfile
      student={student}
      assignedRoutines={assignedRoutines || []}
      workoutSessions={workoutSessions || []}
      coachId={user.id}
    />
  )
}
