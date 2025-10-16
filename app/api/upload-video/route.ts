import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó archivo" }, { status: 400 })
    }

    // Upload to Vercel Blob
    const blob = await put(`exercises/${user.id}/${Date.now()}-${file.name}`, file, {
      access: "public",
    })

    return NextResponse.json({ url: blob.url })
  } catch (error: any) {
    console.error("[v0] Error uploading video:", error)
    return NextResponse.json({ error: error.message || "Error al subir el video" }, { status: 500 })
  }
}
