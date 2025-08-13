"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Shield, BookOpen, Brain, Camera, TrendingUp, Clock, Award, Target, User, Settings, LogOut, PlayCircle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { apiRequest, API_ENDPOINTS, topicAPI, courseAPI, estadisticasAPI, isAuthenticated } from "@/lib/api"
import type { ReporteEmocionesEstudiante } from "@/types/estadisticas"

// Interfaces para los datos
interface Course {
  id: number
  nombreCurso: string
  profesor: number
  dificultadMinima: number
  dificultadMaxima: number
}

interface Topic {
  id: number
  titulo: string
  contenido: string
  curso: number
  orden: number
}

export default function DashboardPage() {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [userCourse, setUserCourse] = useState<Course | null>(null)
  const [courseTopics, setCourseTopics] = useState<Topic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [studentEmotionStats, setStudentEmotionStats] = useState<ReporteEmocionesEstudiante | null>(null)
  const [isLoadingEmotionStats, setIsLoadingEmotionStats] = useState(false)
  const { logout, user } = useAuth()
  const router = useRouter()

  // Cargar datos del usuario cuando se monta el componente
  useEffect(() => {
    if (user) {
      console.log('Usuario autenticado:', user)
      loadUserCourseAndTopics()
    } else {
      console.log('No hay usuario autenticado, redirigiendo...')
      router.push('/login')
    }
  }, [user, router])

  // Función para cargar el curso del usuario y sus temas
  const loadUserCourseAndTopics = async () => {
    setIsLoading(true)
    setError("")
    
    try {
      console.log('Usuario completo:', user)
      console.log('Curso del usuario:', user?.curso)
      
      // Si el usuario tiene un curso asignado, cargar los datos
      if (user?.curso) {
        console.log('Cargando curso del usuario:', user.curso)
        await Promise.all([
          loadUserCourse(user.curso),
          loadCourseTopics(user.curso)
        ])
        // Cargar estadísticas de emociones del estudiante
        loadStudentEmotionStats()
      } else {
        console.log('Usuario sin curso asignado')
        setUserCourse(null)
        setCourseTopics([])
        setError('No tienes un curso asignado. Contacta al administrador.')
      }
    } catch (error) {
      console.error('Error cargando datos del curso:', error)
      setError('Error al cargar los datos del curso')
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar información del curso del usuario
  const loadUserCourse = async (courseId: number) => {
    try {
      console.log('Obteniendo curso con ID:', courseId)
      const response = await courseAPI.getCourse(courseId)
      console.log('Respuesta del curso:', response)
      
      if (response.ok) {
        setUserCourse(response.data)
        console.log('Curso cargado exitosamente:', response.data)
      } else {
        console.error('Error al cargar curso:', response)
        setError('Error al cargar información del curso')
      }
    } catch (error) {
      console.error('Error loading course:', error)
      setError('Error al cargar el curso')
    }
  }

  // Cargar temas del curso
  const loadCourseTopics = async (courseId: number) => {
    try {
      console.log('Obteniendo todos los temas...')
      const response = await topicAPI.getAllTopics()
      console.log('Respuesta de todos los temas:', response)
      
      if (response.ok) {
        console.log('Todos los temas:', response.data)
        // Filtrar solo los temas del curso del usuario
        const userTopics = response.data.filter((topic: Topic) => {
          console.log(`Tema ${topic.id}: curso ${topic.curso}, buscando curso ${courseId}`)
          return topic.curso === courseId
        })
        console.log('Temas filtrados para el curso:', userTopics)
        
        // Ordenar por el campo orden
        userTopics.sort((a: Topic, b: Topic) => a.orden - b.orden)
        setCourseTopics(userTopics)
        console.log('Temas del curso cargados y ordenados:', userTopics)
      } else {
        console.error('Error al cargar temas:', response)
        setError('Error al cargar los temas del curso')
      }
    } catch (error) {
      console.error('Error loading topics:', error)
      setError('Error al cargar los temas')
    }
  }

  // Cargar estadísticas de emociones del estudiante
  const loadStudentEmotionStats = async () => {
    // Verificar autenticación antes de hacer la llamada
    if (!isAuthenticated()) {
      console.log('No hay token de autenticación para cargar estadísticas de emociones')
      return
    }
    
    setIsLoadingEmotionStats(true)
    try {
      // La API de emociones ahora no requiere ID en la URL, usa el token para identificar al usuario
      const response = await estadisticasAPI.getReporteEmocionesEstudiante()
      
      if (response.ok) {
        setStudentEmotionStats(response.data)
        console.log('Estadísticas de emociones cargadas:', response.data)
      } else {
        console.error('Error cargando estadísticas de emociones:', response)
        if (response.status === 401) {
          console.log('Token expirado o inválido para estadísticas de emociones')
        }
      }
    } catch (error) {
      console.error('Error cargando estadísticas de emociones:', error)
    } finally {
      setIsLoadingEmotionStats(false)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Error durante el logout:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">SecurePixel</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700">
                {user ? `${user.first_name} ${user.last_name}` : 'Usuario'}
              </span>
            </div>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configuración
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {isLoggingOut ? 'Saliendo...' : 'Salir'}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Bienvenido de vuelta, {user?.first_name || 'Estudiante'}!
          </h1>
          <p className="text-gray-600">
            {userCourse 
              ? `Continúa tu aprendizaje en: ${userCourse.nombreCurso}` 
              : 'Continúa tu aprendizaje en ciberseguridad con nuestro sistema adaptativo'
            }
          </p>
          {!userCourse && !isLoading && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-800 text-sm">
                ⚠️ No tienes un curso asignado. Contacta a tu administrador para que te asigne un curso.
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Progreso Total</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {courseTopics.length > 0 
                      ? Math.round((courseTopics.length * 20) / courseTopics.length) 
                      : 0}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Temas Disponibles</p>
                  <p className="text-2xl font-bold text-green-600">
                    {courseTopics.length}
                  </p>
                </div>
                <Award className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Curso Actual</p>
                  <p className="text-lg font-bold text-orange-600">
                    {userCourse ? userCourse.nombreCurso.substring(0, 12) + '...' : 'Sin curso'}
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Estado</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {userCourse ? 'Activo' : 'Inactivo'}
                  </p>
                </div>
                <Target className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Learning Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                  Temas de Aprendizaje
                  {userCourse && (
                    <Badge variant="outline" className="ml-2">
                      {userCourse.nombreCurso}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    <p className="font-medium">Error:</p>
                    <p>{error}</p>
                  </div>
                )}
                
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Cargando temas del curso...</p>
                  </div>
                ) : courseTopics.length > 0 ? (
                  <div className="space-y-4">
                    {courseTopics.map((topic, index) => (
                      <div key={topic.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{topic.titulo}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {topic.contenido.length > 100 
                              ? topic.contenido.substring(0, 100) + '...' 
                              : topic.contenido.replace(/<[^>]*>/g, '') // Remover tags HTML si los hay
                            }
                          </p>
                          <div className="flex items-center mt-2 space-x-2">
                            <span className="text-xs text-gray-500">Tema {topic.orden}</span>
                            <Progress value={index === 0 ? 75 : index < 2 ? 100 : 0} className="h-2 w-24" />
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {index < 2 ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Completado
                            </Badge>
                          ) : index === 2 ? (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              En Progreso
                            </Badge>
                          ) : (
                            <Badge variant="outline">Disponible</Badge>
                          )}
                          <Link href={`/learning/${topic.id}`}>
                            <Button size="sm" variant={index < 2 ? "outline" : "default"}>
                              <PlayCircle className="h-4 w-4 mr-1" />
                              {index < 2 ? 'Revisar' : index === 2 ? 'Continuar' : 'Iniciar'}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : userCourse ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No hay temas disponibles en este curso aún.</p>
                    <p className="text-sm text-gray-400 mt-2">Los temas aparecerán aquí cuando el profesor los agregue.</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Sin curso asignado</p>
                    <p className="text-sm text-gray-400 mt-2">Contacta a tu administrador para que te asigne un curso.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            
          </div>

          {/* Sidebar */}
          <div className="space-y-6">






            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/evaluation" className="block">
                  <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700">
                    <Brain className="h-4 w-4 mr-2" />
                    Evaluación Adaptativa
                  </Button>
                </Link>
                <Link href="/learning" className="block">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Continuar Aprendizaje
                  </Button>
                </Link>
                <Link href="/progress" className="block">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Ver Progreso
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Emotional Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Análisis Emocional</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {isLoadingEmotionStats ? (
                    <div className="animate-pulse flex space-x-4">
                      <div className="flex-1 py-2">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded mt-2"></div>
                        <div className="h-4 bg-gray-200 rounded mt-2"></div>
                      </div>
                    </div>
                  ) : studentEmotionStats ? (
                    <div className="space-y-4">
                      <div className="text-sm text-gray-600 mb-3">
                        Análisis de emociones disponible
                      </div>
                      {studentEmotionStats.emociones_porcentaje ? (
                        <div className="space-y-3">
                          {Object.entries(studentEmotionStats.emociones_porcentaje).slice(0, 3).map(([emotion, percentage], index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                              <div>
                                <p className="text-sm font-medium text-blue-800 capitalize">
                                  {emotion}
                                </p>
                                <p className="text-xs text-blue-600">
                                  {percentage.toFixed(1)}% del tiempo
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-blue-600">
                                  Promedio: {studentEmotionStats.promedios_calificaciones[emotion as keyof typeof studentEmotionStats.promedios_calificaciones]?.toFixed(1) || 'N/A'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">No hay datos de emociones disponibles</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No se pudo cargar el análisis emocional.</p>
                      <p className="text-sm text-gray-400 mt-2">Intenta nuevamente más tarde.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
