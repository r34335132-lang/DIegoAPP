"use server"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

interface CreateStudentData {
  email: string
  username: string
  fullName: string
  password: string
  age?: number
  weight?: number
  sport?: string
  medicalCondition?: string
  coachId: string
}

export async function createStudent(data: CreateStudentData) {
  try {
    console.log("[v0] Creating student with data:", { ...data, password: "***" })

    const adminClient = getSupabaseAdminClient()

    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        role: "student",
        username: data.username,
        full_name: data.fullName,
      },
    })

    if (authError) {
      console.error("[v0] Auth error:", authError)
      return { success: false, error: authError.message }
    }

    if (!authData.user) {
      console.error("[v0] No user data returned")
      return { success: false, error: "No se pudo crear el usuario" }
    }

    console.log("[v0] Auth user created:", authData.user.id)

    await new Promise((resolve) => setTimeout(resolve, 1500))

    const { data: newProfile, error: profileCheckError } = await adminClient
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single()

    if (profileCheckError || !newProfile) {
      console.error("[v0] Profile not found after creation:", profileCheckError)
      const { error: manualProfileError } = await adminClient.from("profiles").insert({
        id: authData.user.id,
        email: data.email,
        username: data.username,
        full_name: data.fullName,
        role: "student",
      })

      if (manualProfileError) {
        console.error("[v0] Manual profile creation error:", manualProfileError)
        return { success: false, error: "Error al crear el perfil del estudiante" }
      }
      console.log("[v0] Profile created manually")
    } else {
      console.log("[v0] Profile found:", newProfile)
    }

    console.log("[v0] Inserting into students table - coach_id:", data.coachId, "student_id:", authData.user.id)

    const { data: studentData, error: studentError } = await adminClient
      .from("students")
      .insert({
        id: authData.user.id,
        coach_id: data.coachId,
        age: data.age || null,
        weight: data.weight || null,
        sport: data.sport || null,
        medical_condition: data.medicalCondition || null,
      })
      .select()
      .single()

    if (studentError) {
      console.error("[v0] Student insertion error:", studentError)
      const { data: existingStudent } = await adminClient
        .from("students")
        .select("*")
        .eq("id", authData.user.id)
        .single()

      if (existingStudent) {
        console.log("[v0] Student exists despite error:", existingStudent)
        revalidatePath("/coach/students")
        revalidatePath("/coach/chat")
        return { success: true, data: authData.user }
      }

      return { success: false, error: `Error al crear estudiante: ${studentError.message}` }
    }

    console.log("[v0] Student created successfully:", studentData)

    revalidatePath("/coach/students")
    revalidatePath("/coach/chat")
    return { success: true, data: authData.user }
  } catch (error: any) {
    console.error("[v0] Create student error:", error)
    return { success: false, error: error.message || "Error desconocido" }
  }
}
