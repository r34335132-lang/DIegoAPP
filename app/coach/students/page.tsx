import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { StudentsManager } from "@/components/coach/students-manager"

export default async function StudentsPage() {
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

  console.log("[v0] Coach ID:", user.id)

  const { data: studentsData, error: studentsError } = await supabase
    .from("students")
    .select("*")
    .eq("coach_id", user.id)

  console.log("[v0] Students data:", studentsData)
  console.log("[v0] Students error:", studentsError)

  // Get profiles for each student
  const students = studentsData || []
  const studentsWithProfiles = await Promise.all(
    students.map(async (student) => {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, email, username, full_name")
        .eq("id", student.id)
        .single()

      return {
        ...student,
        profiles: profileData,
      }
    }),
  )

  console.log("[v0] Students with profiles:", studentsWithProfiles)
  console.log("[v0] Number of students found:", studentsWithProfiles.length)

  return <StudentsManager students={studentsWithProfiles} coachId={user.id} />
}
