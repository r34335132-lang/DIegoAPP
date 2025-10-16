import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { RoutineDetails } from "@/components/coach/routine-details"

export default async function RoutineDetailsPage({ params }: { params: Promise<{ id: string }> }) {
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

  // Get routine details
  const { data: routine } = await supabase
    .from("routines")
    .select(`
      *,
      routine_exercises(
        *,
        exercises(*)
      )
    `)
    .eq("id", id)
    .eq("coach_id", user.id)
    .single()

  if (!routine) {
    redirect("/coach/routines")
  }

  // Get assigned students
  const { data: assignments } = await supabase
    .from("student_routines")
    .select(`
      *,
      students!inner(
        id,
        profiles!inner(full_name, username)
      )
    `)
    .eq("routine_id", id)

  return <RoutineDetails routine={routine} assignments={assignments || []} />
}
