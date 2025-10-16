import { LoginForm } from "@/components/auth/login-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Image src="/logo.png" alt="L.N Coach Diego Ibarra Logo" width={60} height={60} className="rounded-full" />
            <CardTitle className="text-2xl">L.N Coach Diego Ibarra</CardTitle>
          </div>
          <CardDescription className="text-center">Ingresa tus credenciales para acceder</CardDescription>

          {params.error === "unauthorized" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No tienes permisos para acceder a esa sección. Por favor, inicia sesión con la cuenta correcta.
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>
        <CardContent>
          <LoginForm />
          <p className="text-center text-sm text-muted-foreground mt-4">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Regístrate aquí
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
