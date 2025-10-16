"use server"

import { createClient } from "@supabase/supabase-js"

export async function createUserProfile(userId: string, email: string, username: string, fullName: string) {
  try {
    console.log("[v0] Creating profile for user:", userId)

    if (!userId || userId.trim() === "") {
      throw new Error("userId es requerido y no puede estar vacío")
    }

    // Usar service role para bypasear RLS
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Crear el perfil directamente con permisos de admin
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: userId,
        email: email,
        username: username,
        full_name: fullName,
        role: "coach",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating profile:", error)
      throw error
    }

    console.log("[v0] Profile created:", data)

    return { success: true, data }
  } catch (error: any) {
    console.error("[v0] Server action error:", error)
    return { success: false, error: error.message }
  }
}

export async function getUserProfile(userId: string) {
  try {
    console.log("[v0] Getting profile for user:", userId)

    // Usar service role para bypasear RLS y asegurar que podemos leer el perfil
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { data, error } = await supabaseAdmin.from("profiles").select("*").eq("id", userId).single()

    if (error) {
      console.error("[v0] Error fetching profile:", error)
      return { success: false, error: error.message }
    }

    console.log("[v0] Profile fetched:", data)
    return { success: true, data }
  } catch (error: any) {
    console.error("[v0] Server action error:", error)
    return { success: false, error: error.message }
  }
}
