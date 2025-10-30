import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { ExercisesManager } from "@/components/coach/exercises-manager"

export default async function ExercisesPage() {
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

  const { data: exercises } = await supabase
    .from("exercises")
    .select("*")
    .eq("coach_id", user.id)
    .order("created_at", { ascending: false })

  const { data: folders } = await supabase
    .from("exercise_folders")
    .select("*")
    .eq("coach_id", user.id)
    .order("created_at", { ascending: false })

  return <ExercisesManager exercises={exercises || []} folders={folders || []} coachId={user.id} />
}
