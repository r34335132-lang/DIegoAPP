import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dumbbell, Users, TrendingUp } from "lucide-react"
import Image from "next/image"

export default async function HomePage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role === "coach") {
      redirect("/coach")
    } else if (profile?.role === "student") {
      redirect("/student")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] gap-8">
          <div className="text-center space-y-4 max-w-2xl">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Image
                src="/logo.png"
                alt="L.N Coach Diego Ibarra Logo"
                width={120}
                height={120}
                className="rounded-full"
              />
              <h1 className="text-5xl font-bold text-balance bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                L.N Coach Diego Ibarra
              </h1>
            </div>
            <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
              La plataforma definitiva para Gestionar entrenamientos, crea rutinas personalizadas y
              mantén el seguimiento en tiempo real.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 w-full max-w-4xl">
            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Promover tu bienestar fisico</CardTitle>
                <CardDescription>
                  mediante un entrenamiento, funcional, accesible y profecional y con un trato meramente humano es mi objetivo
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-secondary transition-colors">
              <CardHeader>
                <Dumbbell className="h-10 w-10 text-secondary mb-2" />
                <CardTitle>Rutinas Personalizadas</CardTitle>
                <CardDescription>Se te asigna rutinas con ejercicios en video para cada alumno</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-accent transition-colors">
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-accent mb-2" />
                <CardTitle>Seguimiento en Tiempo Real</CardTitle>
                <CardDescription>Recibe notificaciones de progreso y estadísticas de entrenamiento</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 bg-transparent">
              <Link href="/register">Registrarse</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
