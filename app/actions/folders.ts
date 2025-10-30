"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createFolder(formData: FormData) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "No autenticado" }
  }

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const color = formData.get("color") as string

  const { data, error } = await supabase
    .from("exercise_folders")
    .insert({
      coach_id: user.id,
      name,
      description: description || null,
      color: color || "#ff6b35",
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/coach/exercises")
  return { data }
}

export async function updateFolder(folderId: string, formData: FormData) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "No autenticado" }
  }

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const color = formData.get("color") as string

  const { data, error } = await supabase
    .from("exercise_folders")
    .update({
      name,
      description: description || null,
      color: color || "#ff6b35",
      updated_at: new Date().toISOString(),
    })
    .eq("id", folderId)
    .eq("coach_id", user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/coach/exercises")
  return { data }
}

export async function deleteFolder(folderId: string) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "No autenticado" }
  }

  const { error } = await supabase.from("exercise_folders").delete().eq("id", folderId).eq("coach_id", user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/coach/exercises")
  return { success: true }
}

export async function moveExerciseToFolder(exerciseId: string, folderId: string | null) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "No autenticado" }
  }

  const { error } = await supabase
    .from("exercises")
    .update({
      folder_id: folderId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", exerciseId)
    .eq("coach_id", user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/coach/exercises")
  return { success: true }
}
