"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export default function WelcomePage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleAuthChange = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setUser(user)
        await createUserProfile(user)
      }
      setLoading(false)
    }

    handleAuthChange()
  }, [])

  const createUserProfile = async (user: any) => {
    try {
      const role = user.user_metadata?.role || "patient"

      // Create user record
      await supabase.from("users").upsert({
        id: user.id,
        email: user.email,
        role: role,
      })

      // Create profile based on role
      if (role === "patient") {
        await supabase.from("patients").upsert({
          id: user.id,
          first_name: user.user_metadata?.first_name || "",
          last_name: user.user_metadata?.last_name || "",
          phone: user.user_metadata?.phone || "",
        })
      } else if (role === "doctor") {
        await supabase.from("doctors").upsert({
          id: user.id,
          first_name: user.user_metadata?.first_name || "",
          last_name: user.user_metadata?.last_name || "",
          phone: user.user_metadata?.phone || "",
          specialties: [],
          license_number: "",
          status: "pending",
        })
      }
    } catch (error) {
      console.error("Error creating profile:", error)
    }
  }

  const handleContinue = () => {
    if (user?.user_metadata?.role === "doctor") {
      router.push("/doctor/dashboard")
    } else {
      router.push("/mi-perfil")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-green-600 p-3 rounded-full">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">¡Bienvenido a Medexa!</CardTitle>
          <CardDescription>Tu cuenta ha sido confirmada exitosamente</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            {user?.user_metadata?.role === "doctor"
              ? "Tu perfil de doctor está siendo revisado. Te notificaremos cuando sea aprobado."
              : "Ya puedes comenzar a agendar tus citas médicas."}
          </p>
          <Button onClick={handleContinue} className="w-full">
            Continuar
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
