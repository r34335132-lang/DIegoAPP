import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { CoachChat } from "@/components/chat/coach-chat"

export default async function CoachChatPage() {
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

  console.log("[v0] Coach Chat - Coach ID:", user.id)

  const { data: studentsData, error: studentsError } = await supabase
    .from("students")
    .select("*")
    .eq("coach_id", user.id)

  console.log("[v0] Coach Chat - Students data:", studentsData)
  console.log("[v0] Coach Chat - Students error:", studentsError)

  // Get profiles for each student
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

  console.log("[v0] Coach Chat - Students with profiles:", studentsWithProfiles)
  console.log("[v0] Coach Chat - Number of students found:", studentsWithProfiles.length)

  return <CoachChat coachId={user.id} students={studentsWithProfiles} />
}
