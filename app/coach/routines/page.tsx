import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { RoutinesManager } from "@/components/coach/routines-manager"

export default async function RoutinesPage() {
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

  const { data: routines } = await supabase
    .from("routines")
    .select(`
      *,
      routine_exercises(
        id,
        exercises(id, name)
      )
    `)
    .eq("coach_id", user.id)
    .order("created_at", { ascending: false })

  const routinesWithAssignments = await Promise.all(
    (routines || []).map(async (routine) => {
      const { data: assignments } = await supabase
        .from("student_routines")
        .select("student_id")
        .eq("routine_id", routine.id)

      return {
        ...routine,
        assignedStudentsCount: assignments?.length || 0,
      }
    }),
  )

  const { data: exercises } = await supabase.from("exercises").select("*").eq("coach_id", user.id)

  const { data: studentsData } = await supabase.from("students").select("*").eq("coach_id", user.id)

  const students = studentsData || []
  const studentsWithProfiles = await Promise.all(
    students.map(async (student) => {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, full_name, username, email")
        .eq("id", student.id)
        .single()

      return {
        id: student.id,
        profiles: profileData,
      }
    }),
  )

  return (
    <RoutinesManager
      routines={routinesWithAssignments}
      exercises={exercises || []}
      students={studentsWithProfiles}
      coachId={user.id}
    />
  )
}
