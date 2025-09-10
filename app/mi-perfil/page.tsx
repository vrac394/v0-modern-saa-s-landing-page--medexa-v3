"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Video,
  User,
  Phone,
  Mail,
  Edit3,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"

interface UserProfile {
  id: string
  email: string
  full_name: string
  phone: string
  address: string
  role: "patient" | "doctor"
}

interface Appointment {
  id: string
  type: "telemedicina" | "domicilio"
  specialty: string
  date: string
  time: string
  status: "confirmed" | "pending" | "completed" | "cancelled"
  cost: number
  patient_name: string
  patient_age: number
  phone: string
  email: string
  city: string
  address?: string
  reason: string
  services?: string
  urgency?: string
  daily_room_url?: string
}

export default function MiPerfil() {
  const [activeTab, setActiveTab] = useState("citas")
  const [user, setUser] = useState<UserProfile | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError || !authUser) {
          router.push("/auth/login")
          return
        }

        const { data: userRecord, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .maybeSingle()

        if (userError) {
          console.error("Error fetching user:", userError)
          return
        }

        if (!userRecord) {
          console.error("User record not found. This should be created automatically.")
          router.push("/auth/login")
          return
        }

        let profileData = null
        if (userRecord.role === "patient") {
          const { data: patientData, error: patientError } = await supabase
            .from("patients")
            .select("*")
            .eq("id", authUser.id)
            .maybeSingle()

          if (patientError) {
            console.error("Error fetching patient profile:", patientError)
          } else if (!patientData) {
            const { data: newPatient, error: createPatientError } = await supabase
              .from("patients")
              .insert({
                id: authUser.id,
                first_name: authUser.user_metadata?.first_name || "Usuario",
                last_name: authUser.user_metadata?.last_name || "",
                phone: authUser.user_metadata?.phone || "",
                address: "",
              })
              .select()
              .single()

            if (createPatientError) {
              console.error("Error creating patient profile:", createPatientError)
            } else {
              profileData = newPatient
            }
          } else {
            profileData = patientData
          }
        } else if (userRecord.role === "doctor") {
          const { data: doctorData, error: doctorError } = await supabase
            .from("doctors")
            .select("*")
            .eq("id", authUser.id)
            .maybeSingle()

          if (doctorError) {
            console.error("Error fetching doctor profile:", doctorError)
          } else {
            profileData = doctorData
          }
        }

        setUser({
          id: userRecord.id,
          email: userRecord.email,
          full_name: profileData
            ? `${profileData.first_name || ""} ${profileData.last_name || ""}`.trim() || "Usuario"
            : "Usuario",
          phone: profileData?.phone || "No especificado",
          address: profileData?.address || "No especificado",
          role: userRecord.role,
        })

        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from("appointments")
          .select("*")
          .eq("user_id", authUser.id)
          .order("date", { ascending: true })

        if (appointmentsError) {
          console.error("Error fetching appointments:", appointmentsError)
        } else {
          setAppointments(appointmentsData || [])
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [supabase, router])

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "confirmed":
        return "text-green-600 bg-green-50"
      case "pending":
        return "text-yellow-600 bg-yellow-50"
      case "completed":
        return "text-blue-600 bg-blue-50"
      case "cancelled":
        return "text-red-600 bg-red-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />
      case "pending":
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getEstadoText = (estado: string) => {
    switch (estado) {
      case "confirmed":
        return "Confirmada"
      case "pending":
        return "Pendiente"
      case "completed":
        return "Completada"
      case "cancelled":
        return "Cancelada"
      default:
        return estado
    }
  }

  const handleJoinConsultation = async (appointmentId: string) => {
    try {
      const response = await fetch("/api/create-room", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointmentId: appointmentId,
          properties: {
            start_video_off: false,
            start_audio_off: false,
            enable_chat: true,
            enable_screenshare: true,
            max_participants: 2,
          },
        }),
      })

      if (response.ok) {
        const { roomUrl } = await response.json()
        window.open(roomUrl, "_blank", "width=1200,height=800")
      } else {
        console.error("Error creating room:", response.statusText)
        alert("Error al unirse a la consulta. Por favor, intenta de nuevo.")
      }
    } catch (error) {
      console.error("Error joining consultation:", error)
      alert("Error al unirse a la consulta. Por favor, intenta de nuevo.")
    }
  }

  const canJoinConsultation = (fecha: string, hora: string, estado: string) => {
    if (estado !== "confirmed") return false

    const now = new Date()
    const consultationDateTime = new Date(`${fecha} ${hora}`)
    const timeDiff = consultationDateTime.getTime() - now.getTime()
    const minutesDiff = timeDiff / (1000 * 60)

    return minutesDiff <= 60 && minutesDiff >= -30
  }

  const telemedicineAppointments = appointments.filter((apt) => apt.type === "telemedicina")
  const homeVisitAppointments = appointments.filter((apt) => apt.type === "domicilio")

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Cargando perfil...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Volver al inicio
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium text-gray-900">Mi Perfil</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-heading font-black text-2xl text-gray-900">Bienvenido, {user?.full_name}</h1>
            <Link
              href="/editar-perfil"
              className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Editar perfil
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Teléfono</p>
                <p className="font-medium">{user?.phone}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Dirección</p>
                <p className="font-medium">{user?.address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("citas")}
                className={`px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === "citas"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Mis Citas
              </button>
              <button
                onClick={() => setActiveTab("historial")}
                className={`px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === "historial"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Historial
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "citas" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-heading font-bold text-xl text-gray-900 mb-4 flex items-center">
                    <Video className="w-5 h-5 mr-2 text-blue-600" />
                    Citas de Telemedicina
                  </h2>

                  {telemedicineAppointments.length > 0 ? (
                    <div className="space-y-4">
                      {telemedicineAppointments.map((cita) => (
                        <div
                          key={cita.id}
                          className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <Video className="w-6 h-6 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{cita.specialty}</h3>
                                <p className="text-sm text-gray-600">Paciente: {cita.patient_name}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div
                                className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(cita.status)}`}
                              >
                                {getEstadoIcon(cita.status)}
                                <span>{getEstadoText(cita.status)}</span>
                              </div>
                              {canJoinConsultation(cita.date, cita.time, cita.status) && (
                                <button
                                  onClick={() => handleJoinConsultation(cita.id)}
                                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-2"
                                >
                                  <Video className="w-4 h-4" />
                                  <span>Unirse a Consulta</span>
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="grid md:grid-cols-3 gap-4 text-sm mb-3">
                            <div className="flex items-center text-gray-600">
                              <Calendar className="w-4 h-4 mr-2" />
                              {new Date(cita.date).toLocaleDateString("es-HN")}
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Clock className="w-4 h-4 mr-2" />
                              {cita.time}
                            </div>
                            <div className="font-semibold text-blue-600">L. {cita.cost}</div>
                          </div>

                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <strong>Motivo:</strong> {cita.reason}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              <strong>Ciudad:</strong> {cita.city}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No tienes citas de telemedicina agendadas</p>
                  )}
                </div>

                <div>
                  <h2 className="font-heading font-bold text-xl text-gray-900 mb-4 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-cyan-600" />
                    Exámenes a Domicilio
                  </h2>

                  {homeVisitAppointments.length > 0 ? (
                    <div className="space-y-4">
                      {homeVisitAppointments.map((cita) => (
                        <div
                          key={cita.id}
                          className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                                <MapPin className="w-6 h-6 text-cyan-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{cita.specialty}</h3>
                                <p className="text-sm text-gray-600">
                                  Paciente: {cita.patient_name}, {cita.patient_age} años
                                </p>
                              </div>
                            </div>
                            <div
                              className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(cita.status)}`}
                            >
                              {getEstadoIcon(cita.status)}
                              <span>{getEstadoText(cita.status)}</span>
                            </div>
                          </div>

                          <div className="grid md:grid-cols-4 gap-4 text-sm mb-3">
                            <div className="flex items-center text-gray-600">
                              <Calendar className="w-4 h-4 mr-2" />
                              {new Date(cita.date).toLocaleDateString("es-HN")}
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Clock className="w-4 h-4 mr-2" />
                              {cita.time}
                            </div>
                            <div className="flex items-center text-gray-600">
                              <MapPin className="w-4 h-4 mr-2" />
                              {cita.city}
                            </div>
                            <div className="font-semibold text-cyan-600">L. {cita.cost}</div>
                          </div>

                          <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                            {cita.services && (
                              <p className="text-sm text-gray-700">
                                <strong>Servicios:</strong> {cita.services}
                              </p>
                            )}
                            <p className="text-sm text-gray-700">
                              <strong>Motivo:</strong> {cita.reason}
                            </p>
                            {cita.address && (
                              <p className="text-sm text-gray-600">
                                <strong>Dirección:</strong> {cita.address}
                              </p>
                            )}
                            {cita.urgency && (
                              <p className="text-sm text-gray-600">
                                <strong>Urgencia:</strong> {cita.urgency}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No tienes exámenes a domicilio agendados</p>
                  )}
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                  <Link
                    href="/agendar-telemedicina"
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-center"
                  >
                    Agendar Telemedicina
                  </Link>
                  <Link
                    href="/agendar-domicilio"
                    className="flex-1 bg-cyan-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-cyan-700 transition-colors text-center"
                  >
                    Agendar Examen a Domicilio
                  </Link>
                </div>
              </div>
            )}

            {activeTab === "historial" && (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Historial de Citas</h3>
                <p className="text-gray-500 mb-6">Aquí aparecerán tus citas completadas</p>
                <p className="text-sm text-gray-400">Funcionalidad próximamente disponible</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
