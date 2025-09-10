"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Calendar,
  Clock,
  Video,
  Heart,
  ArrowLeft,
  CheckCircle,
  User,
  Phone,
  Mail,
  MapPin,
  Stethoscope,
  Baby,
  Apple,
  Brain,
  Eye,
  Bone,
} from "lucide-react"
import Link from "next/link"
import { createBrowserClient } from "@supabase/ssr"

const especialidades = [
  {
    id: "medicina-general",
    name: "Medicina General",
    icon: Stethoscope,
    color: "blue",
    description: "Consultas médicas generales",
  },
  { id: "pediatria", name: "Pediatría", icon: Baby, color: "pink", description: "Atención médica para niños" },
  {
    id: "ginecologia",
    name: "Ginecología",
    icon: Heart,
    color: "purple",
    description: "Salud femenina y reproductiva",
  },
  {
    id: "nutricion",
    name: "Nutrición",
    icon: Apple,
    color: "green",
    description: "Planes alimentarios personalizados",
  },
  { id: "psicologia", name: "Psicología", icon: Brain, color: "indigo", description: "Salud mental y bienestar" },
  { id: "oftalmologia", name: "Oftalmología", icon: Eye, color: "cyan", description: "Cuidado de la vista" },
  {
    id: "traumatologia",
    name: "Traumatología",
    icon: Bone,
    color: "orange",
    description: "Lesiones y problemas óseos",
  },
]

const horarios = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
]

export default function AgendarTelemedicina() {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedEspecialidad, setSelectedEspecialidad] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    email: "",
    edad: "",
    ciudad: "",
    motivo: "",
  })

  const handleNext = () => {
    if (step < 4) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        console.error("User not authenticated:", authError)
        window.location.href = "/auth/login?redirect=/agendar-telemedicina"
        return
      }

      const appointmentData = {
        user_id: user.id,
        type: "telemedicina",
        specialty: especialidades.find((e) => e.id === selectedEspecialidad)?.name || "",
        date: selectedDate,
        time: selectedTime,
        status: "confirmed",
        patient_name: formData.nombre,
        patient_age: Number.parseInt(formData.edad),
        phone: formData.telefono,
        email: formData.email,
        city: formData.ciudad,
        reason: formData.motivo,
        cost: 350.0,
      }

      const { error: insertError } = await supabase.from("appointments").insert([appointmentData])

      if (insertError) {
        console.error("Error saving appointment:", insertError)
        alert("Error al guardar la cita. Por favor intenta de nuevo.")
        return
      }

      setStep(5)
    } catch (error) {
      console.error("Error submitting appointment:", error)
      alert("Error al procesar la cita. Por favor intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-white">
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading font-black text-xl text-gray-900">Medexa</span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Video className="w-4 h-4" />
                <span>Consulta por Telemedicina</span>
              </div>
              <Link href="/mi-perfil">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-300 text-gray-600 hover:bg-gray-50 bg-transparent text-xs px-3 py-1"
                >
                  <User className="w-3 h-3 mr-1" />
                  Mi Perfil
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                    step >= stepNumber ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step > stepNumber ? <CheckCircle className="w-5 h-5" /> : stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div className={`w-16 sm:w-24 h-1 mx-2 ${step > stepNumber ? "bg-blue-600" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-gray-900 mb-2">
              {step === 1 && "Selecciona tu Especialidad"}
              {step === 2 && "Elige Fecha y Hora"}
              {step === 3 && "Información Personal"}
              {step === 4 && "Confirma tu Cita"}
              {step === 5 && "¡Cita Confirmada!"}
            </h1>
            <p className="text-gray-600">
              {step === 1 && "Elige la especialidad médica que necesitas"}
              {step === 2 && "Selecciona el día y horario que mejor te convenga"}
              {step === 3 && "Completa tus datos para la consulta"}
              {step === 4 && "Revisa y confirma los detalles de tu cita"}
              {step === 5 && "Tu consulta por telemedicina ha sido agendada"}
            </p>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {especialidades.map((especialidad) => {
                const IconComponent = especialidad.icon
                return (
                  <Card
                    key={especialidad.id}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                      selectedEspecialidad === especialidad.id ? "ring-2 ring-blue-600 shadow-lg" : "hover:shadow-md"
                    }`}
                    onClick={() => setSelectedEspecialidad(especialidad.id)}
                  >
                    <CardHeader className="text-center pb-2">
                      <div
                        className={`w-12 h-12 bg-${especialidad.color}-100 rounded-xl flex items-center justify-center mx-auto mb-3`}
                      >
                        <IconComponent className={`w-6 h-6 text-${especialidad.color}-600`} />
                      </div>
                      <CardTitle className="font-heading font-bold text-lg">{especialidad.name}</CardTitle>
                      <CardDescription className="text-sm">{especialidad.description}</CardDescription>
                    </CardHeader>
                  </Card>
                )
              })}
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleNext}
                disabled={!selectedEspecialidad}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
              >
                Continuar
                <Calendar className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 w-5 h-5" />
                    Selecciona la Fecha
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="mr-2 w-5 h-5" />
                    Selecciona la Hora
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {horarios.map((hora) => (
                      <Button
                        key={hora}
                        variant={selectedTime === hora ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTime(hora)}
                        className={selectedTime === hora ? "bg-blue-600 hover:bg-blue-700" : ""}
                      >
                        {hora}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="mr-2 w-4 h-4" />
                Atrás
              </Button>
              <Button
                onClick={handleNext}
                disabled={!selectedDate || !selectedTime}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Continuar
                <User className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>Completa tus datos para la consulta médica</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nombre">Nombre Completo *</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      placeholder="Tu nombre completo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edad">Edad *</Label>
                    <Input
                      id="edad"
                      type="number"
                      value={formData.edad}
                      onChange={(e) => setFormData({ ...formData, edad: e.target.value })}
                      placeholder="Tu edad"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="telefono">Teléfono *</Label>
                    <Input
                      id="telefono"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      placeholder="+504 0000-0000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Correo Electrónico *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="ciudad">Ciudad *</Label>
                  <Select
                    value={formData.ciudad}
                    onValueChange={(value) => setFormData({ ...formData, ciudad: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu ciudad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tegucigalpa">Tegucigalpa</SelectItem>
                      <SelectItem value="san-pedro-sula">San Pedro Sula</SelectItem>
                      <SelectItem value="la-ceiba">La Ceiba</SelectItem>
                      <SelectItem value="choluteca">Choluteca</SelectItem>
                      <SelectItem value="comayagua">Comayagua</SelectItem>
                      <SelectItem value="puerto-cortes">Puerto Cortés</SelectItem>
                      <SelectItem value="danli">Danlí</SelectItem>
                      <SelectItem value="siguatepeque">Siguatepeque</SelectItem>
                      <SelectItem value="otra">Otra ciudad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="motivo">Motivo de la Consulta *</Label>
                  <Textarea
                    id="motivo"
                    value={formData.motivo}
                    onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                    placeholder="Describe brevemente el motivo de tu consulta médica..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="mr-2 w-4 h-4" />
                Atrás
              </Button>
              <Button
                onClick={handleNext}
                disabled={
                  !formData.nombre ||
                  !formData.telefono ||
                  !formData.email ||
                  !formData.edad ||
                  !formData.ciudad ||
                  !formData.motivo
                }
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Continuar
                <CheckCircle className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Confirma tu Cita de Telemedicina</CardTitle>
                <CardDescription>Revisa todos los detalles antes de confirmar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Detalles de la Consulta</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Stethoscope className="w-4 h-4 mr-2 text-blue-600" />
                        <span className="font-medium">Especialidad:</span>
                        <span className="ml-2">{especialidades.find((e) => e.id === selectedEspecialidad)?.name}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                        <span className="font-medium">Fecha:</span>
                        <span className="ml-2">{selectedDate}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-blue-600" />
                        <span className="font-medium">Hora:</span>
                        <span className="ml-2">{selectedTime}</span>
                      </div>
                      <div className="flex items-center">
                        <Video className="w-4 h-4 mr-2 text-blue-600" />
                        <span className="font-medium">Modalidad:</span>
                        <span className="ml-2">Videollamada</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Información del Paciente</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-blue-600" />
                        <span className="font-medium">Nombre:</span>
                        <span className="ml-2">{formData.nombre}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-blue-600" />
                        <span className="font-medium">Teléfono:</span>
                        <span className="ml-2">{formData.telefono}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-blue-600" />
                        <span className="font-medium">Email:</span>
                        <span className="ml-2">{formData.email}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                        <span className="font-medium">Ciudad:</span>
                        <span className="ml-2 capitalize">{formData.ciudad?.replace("-", " ")}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Motivo de la Consulta:</h4>
                  <p className="text-gray-700">{formData.motivo}</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Costo de la Consulta</h4>
                  <div className="flex justify-between items-center">
                    <span>Consulta por Telemedicina</span>
                    <span className="font-bold text-green-600">L. 350.00</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="mr-2 w-4 h-4" />
                Atrás
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 text-white px-8"
              >
                {isSubmitting ? "Guardando..." : "Confirmar Cita"}
                <CheckCircle className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>

            <div>
              <h2 className="font-heading font-bold text-2xl text-gray-900 mb-2">¡Cita Confirmada!</h2>
              <p className="text-gray-600 mb-6">Tu consulta por telemedicina ha sido agendada exitosamente</p>
            </div>

            <Card className="max-w-md mx-auto">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Especialidad:</span>
                    <span>{especialidades.find((e) => e.id === selectedEspecialidad)?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Fecha:</span>
                    <span>{selectedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Hora:</span>
                    <span>{selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Modalidad:</span>
                    <span>Videollamada</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-blue-50 p-4 rounded-lg max-w-md mx-auto">
              <p className="text-sm text-blue-800">
                <strong>Importante:</strong> Recibirás un enlace de videollamada por email 15 minutos antes de tu cita.
                Asegúrate de tener una conexión estable a internet.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button variant="outline" className="w-full sm:w-auto bg-transparent">
                  Volver al Inicio
                </Button>
              </Link>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
                <Calendar className="mr-2 w-4 h-4" />
                Agendar Otra Cita
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
