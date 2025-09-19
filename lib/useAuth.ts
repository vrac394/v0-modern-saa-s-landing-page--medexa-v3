// lib/useAuth.ts
'use client'

import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { useRouter, usePathname } from 'next/navigation'

export type Profile = {
  id: string
  role: 'paciente' | 'doctor' | 'admin'
  nombre: string | null
  apellido: string | null
  phone: string | null
  especialidad: string | null
  numero_colegiacion: string | null
  estado_verificacion: 'pendiente' | 'aprobado' | 'rechazado'
  url_titulo: string | null
  url_cedula: string | null
  url_colegiacion: string | null
}

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const path = usePathname()

  // Cargar sesión + perfil
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error cargando perfil:', error.message)
        } else {
          setProfile(data)
        }
      }
      setLoading(false)
    }

    checkUser()

    // Suscripción a cambios en auth
    const { data: subscription } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
      if (session) checkUser()
    })

    return () => {
      subscription?.subscription.unsubscribe()
    }
  }, [])

  // Logout
  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    router.push('/')
  }

  // Protección de rutas
  const requireAuth = (allowedRoles: string[] = []) => {
    if (loading) return 'loading'
    if (!user) {
      router.push(`/auth/login?redirect=${encodeURIComponent(path)}`)
      return 'unauthenticated'
    }
    if (allowedRoles.length > 0 && (!profile?.role || !allowedRoles.includes(profile.role))) {
      router.push('/')
      return 'unauthorized'
    }
    return 'authorized'
  }

  return { user, profile, loading, signOut, requireAuth }
}
