import type React from "react"
import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log("[v0] Student Layout - User:", user?.id)

  if (!user) {
    console.log("[v0] Student Layout - No user, redirecting to login")
    redirect("/login")
  }

  const { data: profile, error } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  console.log("[v0] Student Layout - Profile:", profile, "Error:", error)

  if (!profile || profile.role !== "student") {
    console.log("[v0] Student Layout - Not a student, redirecting to login")
    redirect("/login?error=unauthorized")
  }

  console.log("[v0] Student Layout - Access granted")
  return <>{children}</>
}
