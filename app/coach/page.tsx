import { getSupabaseServerClient } from "@/lib/supabase/server"
import { CoachDashboard } from "@/components/coach/coach-dashboard"

export default async function CoachPage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user!.id).single()

  // Get coach stats
  const { count: studentsCount } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true })
    .eq("coach_id", user!.id)

  const { count: exercisesCount } = await supabase
    .from("exercises")
    .select("*", { count: "exact", head: true })
    .eq("coach_id", user!.id)

  const { count: routinesCount } = await supabase
    .from("routines")
    .select("*", { count: "exact", head: true })
    .eq("coach_id", user!.id)

  // Get recent workout sessions
  const { data: recentSessions } = await supabase
    .from("workout_sessions")
    .select(`
      *,
      students!inner(
        id,
        profiles!inner(full_name, username)
      ),
      routines(name)
    `)
    .eq("students.coach_id", user!.id)
    .order("started_at", { ascending: false })
    .limit(5)

  return (
    <CoachDashboard
      profile={profile}
      stats={{
        students: studentsCount || 0,
        exercises: exercisesCount || 0,
        routines: routinesCount || 0,
      }}
      recentSessions={recentSessions || []}
    />
  )
}
