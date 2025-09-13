"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Upload, FileText, CheckCircle, AlertCircle } from "lucide-react"

const specialties = [
  "Medicina General",
  "Pediatría",
  "Ginecología",
  "Cardiología",
  "Dermatología",
  "Neurología",
  "Oftalmología",
  "Odontología",
  "Psicología",
  "Nutrición",
]

export default function RegisterDoctor() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    licenseNumber: "",
    specialty: "",
  })

  const [files, setFiles] = useState({
    titulo: null as File | null,
    cedula: null as File | null,
    certificado: null as File | null,
  })

  const [acceptedDeclaration, setAcceptedDeclaration] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const router = useRouter()
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.firstName.trim()) errors.firstName = "El nombre es requerido"
    if (!formData.lastName.trim()) errors.lastName = "El apellido es requerido"
    if (!formData.email.trim()) errors.email = "El email es requerido"
    if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Email inválido"
    if (!formData.password) errors.password = "La contraseña es requerida"
    if (formData.password.length < 6) errors.password = "La contraseña debe tener al menos 6 caracteres"
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = "Las contraseñas no coinciden"
    if (!formData.phone.trim()) errors.phone = "El teléfono es requerido"
    if (!formData.licenseNumber.trim()) errors.licenseNumber = "El número de colegiación es requerido"
    if (!formData.specialty) errors.specialty = "La especialidad es requerida"
    if (!files.titulo) errors.titulo = "El título universitario es requerido"
    if (!files.cedula) errors.cedula = "La cédula de identidad es requerida"
    if (!files.certificado) errors.certificado = "El certificado de colegiación es requerido"
    if (!acceptedDeclaration) errors.declaration = "Debe aceptar la declaración jurada"

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateFileSize = (file: File) => {
    const maxSize = 5 * 1024 * 1024 // 5MB
    return file.size <= maxSize
  }

  const handleFileChange = (fileType: keyof typeof files, file: File | null) => {
    if (file && !validateFileSize(file)) {
      setFieldErrors((prev) => ({
        ...prev,
        [fileType]: "El archivo debe ser menor a 5MB",
      }))
      return
    }

    setFiles((prev) => ({ ...prev, [fileType]: file }))
    setFieldErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[fileType]
      return newErrors
    })
  }

  const uploadFile = async (file: File, path: string) => {
    const { data, error } = await supabase.storage.from("doctor-documents").upload(path, file)

    if (error) throw error
    return data.path
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      setError("Por favor, complete todos los campos requeridos")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/welcome`,
        },
      })

      if (authError) throw authError

      if (authData.user) {
        // Upload documents
        const timestamp = Date.now()
        const userId = authData.user.id

        const tituloPath = await uploadFile(
          files.titulo!,
          `${userId}/titulo_${timestamp}.${files.titulo!.name.split(".").pop()}`,
        )
        const cedulaPath = await uploadFile(
          files.cedula!,
          `${userId}/cedula_${timestamp}.${files.cedula!.name.split(".").pop()}`,
        )
        const certificadoPath = await uploadFile(
          files.certificado!,
          `${userId}/certificado_${timestamp}.${files.certificado!.name.split(".").pop()}`,
        )

        // Create doctor profile
        const { error: profileError } = await supabase.from("profiles").insert({
          id: userId,
          nombre: formData.firstName,
          apellido: formData.lastName,
          email: formData.email,
          role: "doctor",
          especialidad: formData.specialty,
          numero_colegiacion: formData.licenseNumber,
          url_titulo: tituloPath,
          url_cedula: cedulaPath,
          url_colegiacion: certificadoPath,
          estado_verificacion: "pending",
        })

        if (profileError) throw profileError

        setSuccess(true)
        setTimeout(() => {
          router.push("/auth/login?message=Registro exitoso. Revisa tu email para confirmar tu cuenta.")
        }, 2000)
      }
    } catch (err: any) {
      console.error("Registration error:", err)
      setError(err.message || "Error al registrar. Intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Registro Exitoso!</h2>
            <p className="text-gray-600 mb-4">
              Hemos enviado un email de confirmación a tu correo. Una vez confirmado, tu cuenta será revisada por
              nuestro equipo.
            </p>
            <p className="text-sm text-gray-500">Redirigiendo al login...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50 py-8">
      <div className="max-w-2xl mx-auto p-4">
        <div className="mb-6">
          <Link
            href="/auth/login"
            className="inline-flex items-center text-[#3771c1] hover:text-[#072472] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al login
          </Link>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <img src="/logo.svg" alt="MEDEXA" className="h-12" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Registro de Doctor</CardTitle>
            <CardDescription className="text-gray-600">
              Complete el formulario para registrarse como médico en la plataforma
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Información Personal</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Nombre *</Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                      className={fieldErrors.firstName ? "border-red-500" : ""}
                    />
                    {fieldErrors.firstName && <p className="text-sm text-red-600 mt-1">{fieldErrors.firstName}</p>}
                  </div>

                  <div>
                    <Label htmlFor="lastName">Apellido *</Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                      className={fieldErrors.lastName ? "border-red-500" : ""}
                    />
                    {fieldErrors.lastName && <p className="text-sm text-red-600 mt-1">{fieldErrors.lastName}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    className={fieldErrors.email ? "border-red-500" : ""}
                  />
                  {fieldErrors.email && <p className="text-sm text-red-600 mt-1">{fieldErrors.email}</p>}
                </div>

                <div>
                  <Label htmlFor="phone">Teléfono *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+504 9999-9999"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    className={fieldErrors.phone ? "border-red-500" : ""}
                  />
                  {fieldErrors.phone && <p className="text-sm text-red-600 mt-1">{fieldErrors.phone}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password">Contraseña *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                      className={fieldErrors.password ? "border-red-500" : ""}
                    />
                    {fieldErrors.password && <p className="text-sm text-red-600 mt-1">{fieldErrors.password}</p>}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      className={fieldErrors.confirmPassword ? "border-red-500" : ""}
                    />
                    {fieldErrors.confirmPassword && (
                      <p className="text-sm text-red-600 mt-1">{fieldErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Información Profesional</h3>

                <div>
                  <Label htmlFor="licenseNumber">Número de Colegiación (Colegio Médico de Honduras) *</Label>
                  <Input
                    id="licenseNumber"
                    type="text"
                    placeholder="Ej: 12345"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData((prev) => ({ ...prev, licenseNumber: e.target.value }))}
                    className={fieldErrors.licenseNumber ? "border-red-500" : ""}
                  />
                  {fieldErrors.licenseNumber && (
                    <p className="text-sm text-red-600 mt-1">{fieldErrors.licenseNumber}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="specialty">Especialidad *</Label>
                  <Select
                    value={formData.specialty}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, specialty: value }))}
                  >
                    <SelectTrigger className={fieldErrors.specialty ? "border-red-500" : ""}>
                      <SelectValue placeholder="Seleccione su especialidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.map((specialty) => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldErrors.specialty && <p className="text-sm text-red-600 mt-1">{fieldErrors.specialty}</p>}
                </div>
              </div>

              {/* Document Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Documentos Requeridos</h3>
                <p className="text-sm text-gray-600">
                  Suba los siguientes documentos (PDF o imágenes, máximo 5MB cada uno)
                </p>

                <div className="space-y-4">
                  {[
                    { key: "titulo" as const, label: "Título Universitario", icon: FileText },
                    { key: "cedula" as const, label: "Cédula de Identidad", icon: FileText },
                    { key: "certificado" as const, label: "Certificado de Colegiación", icon: FileText },
                  ].map(({ key, label, icon: Icon }) => (
                    <div key={key}>
                      <Label htmlFor={key}>{label} *</Label>
                      <div className="mt-1">
                        <input
                          id={key}
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileChange(key, e.target.files?.[0] || null)}
                          className="hidden"
                        />
                        <label
                          htmlFor={key}
                          className={`flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                            fieldErrors[key] ? "border-red-500" : "border-gray-300"
                          }`}
                        >
                          <div className="text-center">
                            {files[key] ? (
                              <>
                                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">{files[key]!.name}</p>
                                <p className="text-xs text-gray-500">Archivo seleccionado</p>
                              </>
                            ) : (
                              <>
                                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">Subir {label}</p>
                                <p className="text-xs text-gray-500">PDF, JPG, PNG (máx. 5MB)</p>
                              </>
                            )}
                          </div>
                        </label>
                      </div>
                      {fieldErrors[key] && <p className="text-sm text-red-600 mt-1">{fieldErrors[key]}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Legal Declaration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Declaración Jurada</h3>
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="declaration"
                    checked={acceptedDeclaration}
                    onCheckedChange={(checked) => setAcceptedDeclaration(checked as boolean)}
                    className={fieldErrors.declaration ? "border-red-500" : ""}
                  />
                  <div className="flex-1">
                    <Label htmlFor="declaration" className="text-sm leading-relaxed cursor-pointer">
                      Declaro bajo fe de juramento que soy médico colegiado en el Colegio Médico de Honduras, con número
                      de colegiación válido, y que toda la información proporcionada es verídica. Asumo responsabilidad
                      civil y penal por falsedad. *
                    </Label>
                    {fieldErrors.declaration && <p className="text-sm text-red-600 mt-1">{fieldErrors.declaration}</p>}
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#3771c1] hover:bg-[#072472] text-white font-semibold py-3 text-lg"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Registrando...
                  </>
                ) : (
                  "Registrar como Doctor"
                )}
              </Button>
            </form>

            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-600">
                ¿Ya tienes cuenta?{" "}
                <Link href="/auth/login" className="text-[#3771c1] hover:text-[#072472] font-medium">
                  Iniciar sesión
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
