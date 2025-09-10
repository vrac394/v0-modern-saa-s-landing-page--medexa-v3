"use client"

import { useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Calendar, Clock, MapPin, User, Phone, Home, ArrowLeft, CheckCircle, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import Link from "next/link"

const nursingServices = [
  {
    category: "Signos Vitales",
    services: [
      "Presión arterial",
      "Frecuencia cardíaca",
      "Frecuencia respiratoria",
      "Temperatura corporal",
      "Saturación de oxígeno (SpO₂)",
    ],
  },
  {
    category: "Glucemia y Test Rápidos",
    services: [
      "Glucemia capilar (azúcar en sangre)",
      "Test rápido de embarazo",
      "Test rápido COVID-19",
      "Test rápido de influenza",
      "Test de orina (infección urinaria)",
    ],
  },
  {
    category: "Muestreo para Laboratorio",
    services: [
      "Extracción de sangre venosa",
      "Recolección de orina",
      "Recolección de heces",
      "Hisopados (faríngeo, nasal, vaginal)",
    ],
  },
  {
    category: "Evaluaciones Básicas",
    services: [
      "Control de peso, talla e IMC",
      "Valoración nutricional",
      "Detección de edemas y lesiones",
      "Revisión general de salud",
    ],
  },
  {
    category: "Monitoreo de Condiciones Crónicas",
    services: [
      "Control de hipertensión",
      "Control de diabetes",
      "Evaluación de adherencia a tratamiento",
      "Revisión de síntomas crónicos",
    ],
  },
  {
    category: "Procedimientos de Enfermería",
    services: [
      "Curaciones y toma de muestras",
      "Revisión de catéteres y sondas",
      "Cuidado de heridas",
      "Evaluación de dispositivos médicos",
    ],
  },
]

const timeSlots = [
  "08:00 AM",
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
  "07:00 PM",
]

const cities = [
  "Tegucigalpa",
  "San Pedro Sula",
  "Choloma",
  "La Ceiba",
  "El Progreso",
  "Choluteca",
  "Comayagua",
  "Puerto Cortés",
  "La Lima",
  "Danlí",
  "Siguatepeque",
  "Juticalpa",
  "Tocoa",
  "Catacamas",
  "Tela",
]

export default function AgendarDomicilio() {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    services: [] as string[],
    date: "",
    time: "",
    patientName: "",
    patientAge: "",
    phone: "",
    email: "",
    city: "",
    address: "",
    symptoms: "",
    urgency: "normal",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleServiceToggle = (service: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }))
  }

  const nextStep = () => {
    if (step < 3) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )

      // Get current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        console.error("User not authenticated:", authError)
        // Redirect to login if not authenticated
        window.location.href = "/auth/login?redirect=/agendar-domicilio"
        return
      }

      // Save appointment to database
      const appointmentData = {
        user_id: user.id,
        type: "domicilio",
        specialty: "Enfermería a Domicilio",
        date: formData.date,
        time: formData.time,
        status: "confirmed",
        patient_name: formData.patientName,
        patient_age: Number.parseInt(formData.patientAge),
        phone: formData.phone,
        email: formData.email,
        city: formData.city,
        address: formData.address,
        reason: formData.symptoms,
        services: formData.services.join(", "),
        urgency: formData.urgency,
        cost: formData.urgency === "emergency" ? 800.0 : formData.urgency === "urgent" ? 600.0 : 400.0,
      }

      const { error: insertError } = await supabase.from("appointments").insert([appointmentData])

      if (insertError) {
        console.error("Error saving appointment:", insertError)
        alert("Error al guardar la cita. Por favor intenta de nuevo.")
        return
      }

      setStep(4)
    } catch (error) {
      console.error("Error submitting appointment:", error)
      alert("Error al procesar la cita. Por favor intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white via-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading font-black text-xl text-gray-900">Medexa</span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Home className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Exámenes a Domicilio</span>
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
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= stepNumber ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-16 h-1 mx-2 ${step > stepNumber ? "bg-blue-600" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4">
            <p className="text-sm text-gray-600">
              {step === 1 && "Selecciona servicios y fecha"}
              {step === 2 && "Información del paciente"}
              {step === 3 && "Confirma tu cita"}
              {step === 4 && "¡Cita agendada!"}
            </p>
          </div>
        </div>

        {/* Step 1: Service Selection */}
        {step === 1 && (
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="font-heading text-2xl text-gray-900">
                Agendar Exámenes de Enfermería a Domicilio
              </CardTitle>
              <CardDescription>Selecciona los servicios que necesitas y programa tu cita en casa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">
                <Label className="text-lg font-semibold">Servicios Disponibles</Label>
                <div className="grid gap-6">
                  {nursingServices.map((category) => (
                    <div key={category.category} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">{category.category}</h3>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {category.services.map((service) => (
                          <label
                            key={service}
                            className="flex items-center space-x-2 p-2 rounded hover:bg-blue-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={formData.services.includes(service)}
                              onChange={() => handleServiceToggle(service)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{service}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label htmlFor="urgency">Urgencia</Label>
                  <Select value={formData.urgency} onValueChange={(value) => handleInputChange("urgency", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal (24-48 horas)</SelectItem>
                      <SelectItem value="urgent">Urgente (mismo día)</SelectItem>
                      <SelectItem value="emergency">Emergencia (2-4 horas)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="date">Fecha Preferida</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label htmlFor="time">Hora Preferida</Label>
                <Select value={formData.time} onValueChange={(value) => handleInputChange("time", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una hora" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={nextStep}
                  disabled={formData.services.length === 0 || !formData.date || !formData.time}
                  className="bg-blue-600 hover:bg-blue-700 px-8"
                >
                  Continuar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Patient Information */}
        {step === 2 && (
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="font-heading text-2xl text-gray-900">Información del Paciente</CardTitle>
              <CardDescription>Completa los datos para confirmar tu cita médica</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label htmlFor="patientName">Nombre Completo del Paciente</Label>
                  <Input
                    placeholder="Ej: María González"
                    value={formData.patientName}
                    onChange={(e) => handleInputChange("patientName", e.target.value)}
                  />
                </div>

                <div className="space-y-4">
                  <Label htmlFor="patientAge">Edad</Label>
                  <Input
                    type="number"
                    placeholder="Ej: 35"
                    value={formData.patientAge}
                    onChange={(e) => handleInputChange("patientAge", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    placeholder="Ej: +504 9999-9999"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>

                <div className="space-y-4">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    type="email"
                    placeholder="Ej: maria@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label htmlFor="city">Ciudad</Label>
                  <Select value={formData.city} onValueChange={(value) => handleInputChange("city", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu ciudad" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="address">Dirección Completa</Label>
                  <Input
                    placeholder="Ej: Col. Palmira, Calle Principal #123"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label htmlFor="symptoms">Síntomas o Motivo de Consulta</Label>
                <Textarea
                  placeholder="Describe brevemente los síntomas o el motivo de la consulta..."
                  value={formData.symptoms}
                  onChange={(e) => handleInputChange("symptoms", e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  Anterior
                </Button>
                <Button
                  onClick={nextStep}
                  disabled={!formData.patientName || !formData.phone || !formData.city || !formData.address}
                  className="bg-blue-600 hover:bg-blue-700 px-8"
                >
                  Continuar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="font-heading text-2xl text-gray-900">Confirmar Cita de Enfermería</CardTitle>
              <CardDescription>Revisa los datos antes de confirmar tu cita a domicilio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3 md:col-span-2">
                    <User className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">Servicios Seleccionados</p>
                      <div className="text-gray-600 text-sm">
                        {formData.services.map((service, index) => (
                          <span key={service}>
                            {service}
                            {index < formData.services.length - 1 && ", "}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Fecha y Hora</p>
                      <p className="text-gray-600">
                        {formData.date} - {formData.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Paciente</p>
                      <p className="text-gray-600">
                        {formData.patientName}, {formData.patientAge} años
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Contacto</p>
                      <p className="text-gray-600">{formData.phone}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Dirección</p>
                    <p className="text-gray-600">
                      {formData.address}, {formData.city}
                    </p>
                  </div>
                </div>
                {formData.symptoms && (
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">Motivo de Consulta</p>
                      <p className="text-gray-600">{formData.symptoms}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">Información Importante:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• La enfermera llegará en el horario acordado</li>
                  <li>• Costo base: L. 400 - L. 800 (según servicios seleccionados)</li>
                  <li>• Incluye todos los exámenes seleccionados</li>
                  <li>• Resultados de laboratorio en 24-48 horas</li>
                  <li>• Puedes cancelar hasta 2 horas antes</li>
                </ul>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  Anterior
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 px-8">
                  {isSubmitting ? "Guardando..." : "Confirmar Cita"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <Card className="shadow-lg">
            <CardContent className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />
              <h2 className="font-heading text-3xl font-bold text-gray-900 mb-4">¡Cita de Enfermería Agendada!</h2>
              <p className="text-lg text-gray-600 mb-8">
                Hemos recibido tu solicitud de exámenes de enfermería a domicilio. Te contactaremos pronto para
                confirmar los detalles.
              </p>
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Recibirás un mensaje de confirmación en tu teléfono y correo electrónico
                </p>
                <div className="flex justify-center space-x-4">
                  <Link href="/">
                    <Button variant="outline">Volver al Inicio</Button>
                  </Link>
                  <Button
                    onClick={() => {
                      setStep(1)
                      setFormData({
                        services: [],
                        date: "",
                        time: "",
                        patientName: "",
                        patientAge: "",
                        phone: "",
                        email: "",
                        city: "",
                        address: "",
                        symptoms: "",
                        urgency: "normal",
                      })
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Agendar Otra Cita
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
