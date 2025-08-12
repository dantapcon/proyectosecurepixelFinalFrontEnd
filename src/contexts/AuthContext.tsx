"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { userAPI } from '@/lib/api'

interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  is_staff: boolean
  is_superuser?: boolean
  tipo_usuario: string
  curso?: number
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<{ success: boolean; user?: User }>
  logout: () => void
  register: (userData: {
    first_name: string
    last_name: string
    username: string
    email: string
    password: string
    password_confirm: string
  }) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Verificar si hay un usuario autenticado al cargar la app
    const checkAuth = async () => {
      if (!mounted) return
      
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (token) {
        try {
          const response = await userAPI.getCurrentUser()
          if (response.ok) {
            setUser(response.data)
          } else {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('token')
              localStorage.removeItem('user')
            }
          }
        } catch (error) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
          }
        }
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [mounted])

  const login = async (username: string, password: string): Promise<{ success: boolean; user?: User }> => {
    try {
      const response = await userAPI.login({ username, password })
      
      if (response.ok) {
        // Primero guardamos el token
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', response.data.token)
        }
        
        // Luego obtenemos la información completa del usuario
        const userResponse = await userAPI.getCurrentUser()
        
        if (userResponse.ok) {
          setUser(userResponse.data)
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(userResponse.data))
          }
          return { success: true, user: userResponse.data }
        } else {
          // Si falla obtener el usuario, limpiamos el token
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token')
          }
          return { success: false }
        }
      }
      return { success: false }
    } catch (error) {
      return { success: false }
    }
  }

  const register = async (userData: {
    first_name: string
    last_name: string
    username: string
    email: string
    password: string
    password_confirm: string
  }): Promise<boolean> => {
    try {
      const response = await userAPI.register(userData)
      return response.ok
    } catch (error) {
      return false
    }
  }

  const logout = async () => {
    try {
      console.log('Starting logout process...')
      const response = await userAPI.logout()
      
      if (!response.ok) {
        console.error('Logout failed:', response.data)
        // Continuar con el logout local incluso si falla el logout del servidor
      } else {
        console.log('Logout successful')
      }
    } catch (error) {
      console.error('Logout error:', error)
      // Continuar con el logout local incluso si falla el logout del servidor
    } finally {
      console.log('Cleaning up local session...')
      setUser(null)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
  }

  const value = {
    user,
    isLoading,
    login,
    logout,
    register,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
