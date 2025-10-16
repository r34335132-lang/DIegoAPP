import { RegisterForm } from "@/components/auth/register-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dumbbell } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Dumbbell className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl">FitCoach</CardTitle>
          </div>
          <CardDescription className="text-center">Crea tu cuenta como coach para empezar</CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
          <p className="text-center text-sm text-muted-foreground mt-4">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Inicia sesión aquí
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
