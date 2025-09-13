"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Check,
  Star,
  Heart,
  ArrowRight,
  Search,
  MapPin,
  Calendar,
  Video,
  Stethoscope,
  Baby,
  Apple,
  User,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"
import { useEffect, useState } from "react"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export default function MedexaLanding() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user ?? null)

      if (session?.user) {
        // Get user profile
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .single()

        setUserProfile(profile)
      }
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)

      if (session?.user) {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .single()

        setUserProfile(profile)
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <img src="/logo.svg" alt="MEDEXA" className="w-auto flex-row tracking-normal text-center h-72" />
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <a href="#inicio" className="text-gray-600 hover:text-[#3771c1] font-medium transition-colors">
                Inicio
              </a>
              <a href="#especialidades" className="text-gray-600 hover:text-[#3771c1] font-medium transition-colors">
                Especialidades
              </a>
              <a href="#doctores" className="text-gray-600 hover:text-[#3771c1] font-medium transition-colors">
                Doctores
              </a>
              <a href="#como-funciona" className="text-gray-600 hover:text-[#3771c1] font-medium transition-colors">
                Cómo Funciona
              </a>
            </nav>

            <div className="flex items-center space-x-3">
              {loading ? (
                <div className="w-8 h-8 animate-spin rounded-full border-2 border-[#3771c1] border-t-transparent"></div>
              ) : user ? (
                // Authenticated user navbar
                <>
                  <Link href="/mi-perfil">
                    <Button
                      variant="outline"
                      size="sm"
                      className="hidden sm:flex border-gray-300 text-gray-600 hover:bg-gray-50 bg-transparent text-sm px-4 py-2"
                    >
                      <User className="w-4 h-4 mr-2" />
                      {userProfile?.role === "doctor" ? "Mi Dashboard" : "Mi Perfil"}
                    </Button>
                  </Link>
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    size="sm"
                    className="hidden sm:flex border-red-300 text-red-600 hover:bg-red-50 bg-transparent text-sm px-4 py-2"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                  </Button>
                  <div className="flex items-center space-x-2 bg-[#629DEB]/10 px-3 py-2 rounded-lg">
                    <div className="w-8 h-8 bg-[#3771c1] rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {userProfile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-sm font-medium text-gray-900">{userProfile?.full_name || "Usuario"}</p>
                      <p className="text-xs text-gray-500 capitalize">{userProfile?.role || "Paciente"}</p>
                    </div>
                  </div>
                </>
              ) : (
                // Non-authenticated user navbar
                <>
                  <Link href="/auth/register-doctor">
                    <Button
                      variant="outline"
                      size="sm"
                      className="hidden sm:flex border-[#3771c1] text-[#3771c1] hover:bg-[#629DEB]/10 bg-transparent text-sm px-4 py-2"
                    >
                      Soy Doctor
                    </Button>
                  </Link>
                  <Link href="/auth/login">
                    <Button
                      size="sm"
                      className="bg-[#3771c1] hover:bg-[#072472] text-white font-semibold px-4 py-2 text-sm rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-[#3771c1]/25"
                    >
                      Iniciar Sesión
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <section className="relative py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-white via-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 lg:space-y-6 mb-8 lg:mb-12">
            <div className="space-y-3">
              <h1 className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl xl:text-5xl text-gray-900 leading-tight max-w-4xl mx-auto">
                Consulta médica en línea, <span className="text-[#3771c1]">cuando y donde la necesitas</span>
              </h1>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto">
                Conéctate con médicos certificados en minutos. Atención médica de calidad desde la comodidad de tu
                hogar.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">
              <div className="relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group bg-gradient-to-br from-white via-blue-50 to-[#629DEB]/10">
                <div className="absolute inset-0 opacity-30">
                  <img
                    src="/nurse-visiting-elderly-woman-at-home.jpg"
                    alt="Enfermera visitando a señora de la tercera edad"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="relative z-10 p-6 sm:p-8 lg:p-10 text-gray-900 min-h-[280px] sm:min-h-[320px] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-[#3771c1]/20 rounded-full flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-[#3771c1]" />
                      </div>
                      <h3 className="font-heading font-bold text-xl sm:text-2xl text-gray-900">Exámenes a domicilio</h3>
                    </div>
                    <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-6">
                      Elige el día y hora, nosotros vamos a donde estés. Servicio profesional en la comodidad de tu
                      hogar.
                    </p>
                  </div>
                  {user ? (
                    <Link href="/agendar-domicilio">
                      <Button
                        size="lg"
                        className="w-full bg-[#3771c1] text-white hover:bg-[#072472] font-bold py-4 sm:py-5 text-lg rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-105 transform group-hover:animate-pulse"
                      >
                        <Calendar className="mr-3 w-5 h-5" />
                        Agendar Ahora
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/auth/login?redirect=/agendar-domicilio">
                      <Button
                        size="lg"
                        className="w-full bg-[#3771c1] text-white hover:bg-[#072472] font-bold py-4 sm:py-5 text-lg rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-105 transform group-hover:animate-pulse"
                      >
                        <Calendar className="mr-3 w-5 h-5" />
                        Iniciar Sesión para Agendar
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              <div className="relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group bg-gradient-to-br from-white via-blue-50 to-[#629DEB]/10">
                <div className="absolute inset-0 opacity-30">
                  <img
                    src="/mother-telemedicine-consultation-with-doctor.jpg"
                    alt="Madre en consulta de telemedicina"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="relative z-10 p-6 sm:p-8 lg:p-10 text-gray-900 min-h-[280px] sm:min-h-[320px] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-[#3771c1]/20 rounded-full flex items-center justify-center">
                        <Video className="w-6 h-6 text-[#3771c1]" />
                      </div>
                      <h3 className="font-heading font-bold text-xl sm:text-2xl text-gray-900">Telemedicina</h3>
                    </div>
                    <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-6">
                      Atiéndete al instante o agenda con un especialista. Consultas médicas desde cualquier lugar.
                    </p>
                  </div>
                  {user ? (
                    <Link href="/agendar-telemedicina">
                      <Button
                        size="lg"
                        className="w-full bg-[#3771c1] text-white hover:bg-[#072472] font-bold py-4 sm:py-5 text-lg rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-105 transform group-hover:animate-pulse"
                      >
                        <Calendar className="mr-3 w-5 h-5" />
                        Agendar Ahora
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/auth/login?redirect=/agendar-telemedicina">
                      <Button
                        size="lg"
                        className="w-full bg-[#3771c1] text-white hover:bg-[#072472] font-bold py-4 sm:py-5 text-lg rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-105 transform group-hover:animate-pulse"
                      >
                        <Calendar className="mr-3 w-5 h-5" />
                        Iniciar Sesión para Agendar
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12 bg-gradient-to-br from-[#629DEB]/10 via-white via-white via-[#629DEB]/10 to-[#629DEB]/10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-r from-[#3771c1]/30 via-[#629DEB]/20 to-transparent"></div>
          <div className="absolute bottom-0 right-0 w-full h-1/3 bg-gradient-to-l from-[#3771c1]/30 via-[#629DEB]/20 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-4 mb-8 lg:mb-12">
            <h2 className="font-heading font-black text-xl sm:text-2xl lg:text-3xl text-gray-900">
              Atención médica para toda Honduras
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
              Desde Tegucigalpa hasta San Pedro Sula, llevamos servicios médicos de calidad a cada rincón del país.
              Conectamos a hondureños con los mejores especialistas, sin importar dónde te encuentres.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
            <div className="flex items-center space-x-3 text-gray-600">
              <div className="w-10 h-10 bg-[#629DEB]/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-[#3771c1]" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Agenda tus exámenes</h4>
                <p className="text-xs sm:text-sm">con o sin orden médica</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-gray-600">
              <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Cobertura nacional</h4>
                <p className="text-xs sm:text-sm">en todas las ciudades de Honduras</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-gray-600">
              <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center flex-shrink-0">
                <Heart className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Médicos hondureños</h4>
                <p className="text-xs sm:text-sm">certificados y especializados</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-gray-500 mt-6">
            <div className="flex items-center space-x-1">
              <Check className="w-4 h-4 text-green-500" />
              <span>Disponible 24/7</span>
            </div>
            <div className="flex items-center space-x-1">
              <Check className="w-4 h-4 text-green-500" />
              <span>Médicos certificados</span>
            </div>
            <div className="flex items-center space-x-1">
              <Check className="w-4 h-4 text-green-500" />
              <span>Consulta inmediata</span>
            </div>
          </div>
        </div>
      </section>

      <section id="especialidades" className="py-8 sm:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-8 sm:mb-10">
            <h2 className="font-heading font-black text-xl sm:text-2xl lg:text-3xl text-gray-900">
              Especialidades Destacadas
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Encuentra al especialista que necesitas para tu consulta médica
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <CardHeader className="text-center pb-2 pt-3 px-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#629DEB]/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 text-[#3771c1]" />
                </div>
                <CardTitle className="font-heading font-bold text-xs sm:text-sm lg:text-base">
                  Medicina General
                </CardTitle>
                <CardDescription className="text-gray-600 text-xs">Consultas generales</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <CardHeader className="text-center pb-2 pt-3 px-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Baby className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" />
                </div>
                <CardTitle className="font-heading font-bold text-xs sm:text-sm lg:text-base">Pediatría</CardTitle>
                <CardDescription className="text-gray-600 text-xs">Atención para niños</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <CardHeader className="text-center pb-2 pt-3 px-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
                <CardTitle className="font-heading font-bold text-xs sm:text-sm lg:text-base">Ginecología</CardTitle>
                <CardDescription className="text-gray-600 text-xs">Salud femenina</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <CardHeader className="text-center pb-2 pt-3 px-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Apple className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <CardTitle className="font-heading font-bold text-xs sm:text-sm lg:text-base">Nutrición</CardTitle>
                <CardDescription className="text-gray-600 text-xs">Planes alimentarios</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="text-center mt-6 sm:mt-8">
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-[#3771c1] text-[#3771c1] hover:bg-[#629DEB]/10 bg-transparent"
            >
              Ver todas las especialidades
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      <section id="doctores" className="py-12 sm:py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="font-heading font-black text-3xl sm:text-4xl text-gray-900">Doctores Recomendados</h2>
            <p className="text-xl text-gray-600">Médicos certificados con las mejores calificaciones</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="font-bold text-blue-600 text-lg">MG</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading font-bold text-lg">Dr. María González</h3>
                    <p className="text-gray-600">Medicina General</p>
                    <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                      <span className="text-sm text-gray-500 ml-1">4.9 (127 reseñas)</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Especialista en medicina preventiva con 15 años de experiencia. Enfoque en atención integral del
                  paciente.
                </p>
                {user ? (
                  <Link href="/agendar-telemedicina">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      <Calendar className="mr-2 w-4 h-4" />
                      Agendar Consulta
                    </Button>
                  </Link>
                ) : (
                  <Link href="/auth/login?redirect=/agendar-telemedicina">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      <Calendar className="mr-2 w-4 h-4" />
                      Iniciar Sesión para Agendar
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
                    <span className="font-bold text-pink-600 text-lg">AR</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading font-bold text-lg">Dr. Ana Rodríguez</h3>
                    <p className="text-gray-600">Pediatría</p>
                    <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                      <span className="text-sm text-gray-500 ml-1">4.8 (89 reseñas)</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Pediatra certificada especializada en desarrollo infantil y medicina preventiva pediátrica.
                </p>
                {user ? (
                  <Link href="/agendar-telemedicina">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      <Calendar className="mr-2 w-4 h-4" />
                      Agendar Consulta
                    </Button>
                  </Link>
                ) : (
                  <Link href="/auth/login?redirect=/agendar-telemedicina">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      <Calendar className="mr-2 w-4 h-4" />
                      Iniciar Sesión para Agendar
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="font-bold text-green-600 text-lg">LM</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading font-bold text-lg">Dr. Luis Martínez</h3>
                    <p className="text-gray-600">Cardiología</p>
                    <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                      <span className="text-sm text-gray-500 ml-1">4.9 (156 reseñas)</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Cardiólogo intervencionista con amplia experiencia en prevención y tratamiento cardiovascular.
                </p>
                {user ? (
                  <Link href="/agendar-telemedicina">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      <Calendar className="mr-2 w-4 h-4" />
                      Agendar Consulta
                    </Button>
                  </Link>
                ) : (
                  <Link href="/auth/login?redirect=/agendar-telemedicina">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      <Calendar className="mr-2 w-4 h-4" />
                      Iniciar Sesión para Agendar
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="font-heading font-black text-3xl sm:text-4xl text-gray-900">Cómo Funciona</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tres simples pasos para recibir atención médica de calidad
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-blue-600" />
              </div>
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 font-bold">
                1
              </div>
              <h3 className="font-heading font-bold text-xl">Escoge Especialidad</h3>
              <p className="text-gray-600">
                Selecciona la especialidad médica que necesitas o busca un doctor específico en nuestra plataforma.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-green-600" />
              </div>
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 font-bold">
                2
              </div>
              <h3 className="font-heading font-bold text-xl">Agenda tu Cita</h3>
              <p className="text-gray-600">
                Elige el horario que mejor te convenga y agenda tu consulta médica en línea de forma rápida y sencilla.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Video className="w-10 h-10 text-purple-600" />
              </div>
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 font-bold">
                3
              </div>
              <h3 className="font-heading font-bold text-xl">Conéctate en Videollamada</h3>
              <p className="text-gray-600">
                Realiza tu consulta médica desde casa a través de videollamada segura con tu doctor certificado.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="testimonios" className="py-12 sm:py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="font-heading font-black text-3xl sm:text-4xl text-gray-900">
              Lo que dicen nuestros pacientes
            </h2>
            <p className="text-xl text-gray-600">Testimonios reales de personas que confían en Medexa</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-gray-700 mb-6">
                  "Excelente servicio. Pude consultar con un pediatra para mi hijo en minutos. La doctora fue muy
                  profesional y me dio tranquilidad."
                </blockquote>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mr-4">
                    <span className="font-semibold text-pink-600">MR</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">María Rodríguez</div>
                    <div className="text-sm text-gray-600">San pedro Sula</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-gray-700 mb-6">
                  "La plataforma es muy fácil de usar. Agendé mi consulta de nutrición y recibí un plan personalizado.
                  Muy recomendado."
                </blockquote>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <span className="font-semibold text-green-600">CL</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Carlos Paredes</div>
                    <div className="text-sm text-gray-600">Tegucigalpa</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-gray-700 mb-6">
                  "Increíble poder tener una consulta médica desde casa. El doctor fue muy atento y me ayudó mucho con
                  mis dudas."
                </blockquote>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="font-semibold text-blue-600">AS</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Ana S. Sánchez</div>
                    <div className="text-sm text-gray-600">La Ceiba</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-[#3771c1]">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading font-black text-3xl sm:text-4xl text-white mb-6">
            ¿Listo para tu consulta médica en línea?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Únete a miles de pacientes que ya confían en Medexa para su atención médica. Agenda tu primera consulta hoy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-[#3771c1] hover:bg-[#629DEB]/10 font-semibold px-8 py-4 rounded-lg transition-all duration-200"
            >
              <Calendar className="mr-2 w-5 h-5" />
              Comenzar ahora
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-[#3771c1] font-semibold px-8 py-4 rounded-lg transition-all duration-200 bg-transparent"
            >
              Conocer más
            </Button>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="font-heading font-black text-xl">Medexa</span>
              </div>
              <p className="text-gray-400 max-w-sm">
                Conectamos pacientes con médicos certificados para brindar atención médica de calidad desde casa.
              </p>
            </div>

            <div>
              <h3 className="font-heading font-bold text-lg mb-4">Servicios</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Consulta General
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Especialidades
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pediatría
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Nutrición
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-heading font-bold text-lg mb-4">Empresa</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Nosotros
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Doctores
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Carreras
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contacto
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-heading font-bold text-lg mb-4">Soporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Centro de Ayuda
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Términos de Uso
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacidad
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2024 Medexa. Todos los derechos reservados.</p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
