"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface UseProtectedRouteOptions {
  redirectTo?: string
  requiredRole?: 'student' | 'teacher' | 'admin'
}

export function useProtectedRoute(options: UseProtectedRouteOptions = {}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { redirectTo = '/login', requiredRole } = options

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(redirectTo)
      return
    }

    if (user && requiredRole) {
      // Aquí puedes agregar lógica para verificar roles específicos
      // Por ejemplo, si tienes un campo 'role' en el usuario
      // if (user.role !== requiredRole) {
      //   router.push('/unauthorized')
      //   return
      // }
    }
  }, [user, isLoading, router, redirectTo, requiredRole])

  return { user, isLoading }
}
