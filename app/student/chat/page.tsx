import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { StudentChat } from "@/components/chat/student-chat"

export default async function StudentChatPage() {
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

  // Get student info with coach
  const { data: student } = await supabase
    .from("students")
    .select(`
      *,
      coach:profiles!students_coach_id_fkey(
        id,
        full_name,
        username,
        email
      )
    `)
    .eq("id", user.id)
    .single()

  if (!student) {
    redirect("/student")
  }

  return <StudentChat studentId={user.id} coach={student.coach} />
}
