"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Shield, 
  Users, 
  Eye, 
  AlertTriangle,
  TrendingUp, 
  Clock, 
  ArrowLeft,
  Download,
  RefreshCw,
  Search
} from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { estadisticasAPI, isAuthenticated, userAPI } from "@/lib/api"
import type { ReporteAtencionEstudiantes } from "@/types/estadisticas"

export default function ReporteAtencionPage() {
  const [reporteAtencion, setReporteAtencion] = useState<ReporteAtencionEstudiantes | null>(null)
  const [allStudents, setAllStudents] = useState<any[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingReport, setIsLoadingReport] = useState(false)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    
    // Solo administradores pueden acceder a este reporte
    if (user.tipo_usuario !== 'administrador') {
      router.push('/dashboard')
      return
    }
    
    loadStudents()
  }, [user, router])

  const loadStudents = async () => {
    setIsLoading(true)
    setError("")
    
    // Verificar autenticación antes de hacer la llamada
    if (!isAuthenticated()) {
      setError('No estás autenticado. Por favor, inicia sesión nuevamente.')
      setIsLoading(false)
      return
    }
    
    try {
      const response = await userAPI.getAllUsers()
      
      if (response.ok) {
        // Filtrar solo estudiantes
        const students = response.data.filter((user: any) => user.tipo_usuario === 'alumno')
        setAllStudents(students)
      } else {
        if (response.status === 401) {
          setError('Sesión expirada. Por favor, inicia sesión nuevamente.')
        } else {
          setError('Error al cargar la lista de estudiantes')
        }
      }
    } catch (error) {
      console.error('Error cargando estudiantes:', error)
      setError('Error de conexión al cargar estudiantes')
    } finally {
      setIsLoading(false)
    }
  }

  const loadReporteAtencion = async (studentId: number) => {
    setIsLoadingReport(true)
    setError("")
    
    // Verificar autenticación antes de hacer la llamada
    if (!isAuthenticated()) {
      setError('No estás autenticado. Por favor, inicia sesión nuevamente.')
      setIsLoadingReport(false)
      return
    }
    
    try {
      const response = await estadisticasAPI.getReporteAtencionEstudiantes(studentId)
      
      if (response.ok) {
        setReporteAtencion(response.data)
        setSelectedStudentId(studentId)
      } else {
        if (response.status === 401) {
          setError('Sesión expirada. Por favor, inicia sesión nuevamente.')
        } else {
          setError('Error al cargar el reporte de atención del estudiante')
        }
      }
    } catch (error) {
      console.error('Error cargando reporte:', error)
      setError('Error de conexión al cargar el reporte')
    } finally {
      setIsLoadingReport(false)
    }
  }

  const filteredStudents = allStudents.filter(student =>
    student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedStudent = allStudents.find(s => s.id === selectedStudentId)

  // Funciones auxiliares para procesar datos de atención
  const calcularPromedioAtencion = (reporte: ReporteAtencionEstudiantes) => {
    if (!reporte?.atencion?.length) return 0
    const tiempoTotal = reporte.atencion.reduce((sum, sesion) => sum + sesion.tiempoLectura, 0)
    const sesionesConOjosCerrados = reporte.atencion.filter(s => s.vectorOjosCerados.length > 0).length
    const factorAtencion = sesionesConOjosCerrados > 0 ? 1 - (sesionesConOjosCerrados / reporte.atencion.length) : 1
    return Math.round(factorAtencion * 100)
  }

  const procesarEmociones = (emociones: any[]) => {
    const emocionesAgregadas: { [key: string]: number } = {}
    let totalImagenes = 0
    
    emociones.forEach(entry => {
      Object.entries(entry.emociones).forEach(([emocion, cantidad]) => {
        emocionesAgregadas[emocion] = (emocionesAgregadas[emocion] || 0) + (cantidad as number)
        totalImagenes += cantidad as number
      })
    })
    
    return { emocionesAgregadas, totalImagenes }
  }

  const obtenerColorEmocion = (emocion: string) => {
    const colores: { [key: string]: string } = {
      neutral: 'bg-gray-500',
      happy: 'bg-green-500',
      sad: 'bg-blue-500',
      angry: 'bg-red-500',
      fear: 'bg-yellow-500',
      surprise: 'bg-pink-500',
      disgust: 'bg-orange-500',
      contempt: 'bg-purple-500'
    }
    return colores[emocion] || 'bg-gray-400'
  }

  const formatearTiempo = (vectorTiempo: string[]) => {
    return vectorTiempo.map(tiempo => {
      const partes = tiempo.split(':')
      return `${partes[1]}min ${partes[2]}s`
    }).join(', ')
  }

  const getAttentionLevelColor = (level: number) => {
    if (level >= 80) return 'text-green-600 bg-green-50'
    if (level >= 60) return 'text-yellow-600 bg-yellow-50'
    if (level >= 40) return 'text-orange-600 bg-orange-50'
    return 'text-red-600 bg-red-50'
  }

  const getAttentionLevelLabel = (level: number) => {
    if (level >= 80) return 'Excelente'
    if (level >= 60) return 'Bueno'
    if (level >= 40) return 'Regular'
    return 'Necesita Atención'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando reporte de atención...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Admin
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Reporte de Atención de Estudiantes</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={loadStudents}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar Lista
            </Button>
            {selectedStudentId && (
              <Button variant="outline" size="sm" onClick={() => loadReporteAtencion(selectedStudentId)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar Reporte
              </Button>
            )}
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Descargar
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {!selectedStudentId ? (
          <>
            {/* Selección de Estudiante */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Reporte de Atención de Estudiantes
              </h1>
              <p className="text-gray-600">
                Selecciona un estudiante para ver su análisis detallado de atención
              </p>
            </div>

            {/* Buscador */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Buscar estudiante por nombre o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Lista de Estudiantes */}
            <Card>
              <CardHeader>
                <CardTitle>Seleccionar Estudiante</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => loadReporteAtencion(student.id)}
                      >
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {student.first_name} {student.last_name}
                          </h3>
                          <p className="text-sm text-gray-600">{student.email}</p>
                        </div>
                        <Button size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Reporte
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        {searchTerm ? 'No se encontraron estudiantes que coincidan con la búsqueda' : 'No hay estudiantes registrados'}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        ) : reporteAtencion ? (
          <>
            {/* Reporte del Estudiante Seleccionado */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Reporte de Atención - {selectedStudent?.first_name} {selectedStudent?.last_name}
                  </h1>
                  <p className="text-gray-600">
                    Análisis detallado del nivel de atención del estudiante
                  </p>
                </div>
                <Button variant="outline" onClick={() => {
                  setSelectedStudentId(null)
                  setReporteAtencion(null)
                }}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver a la Lista
                </Button>
              </div>
            </div>

            {/* Mostrar datos del reporte específico del estudiante */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="border-blue-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Estudiante</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {selectedStudent?.first_name} {selectedStudent?.last_name}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Nivel de Atención</p>
                      <p className="text-2xl font-bold text-green-600">
                        {calcularPromedioAtencion(reporteAtencion)}%
                      </p>
                    </div>
                    <Eye className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Estado</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {getAttentionLevelLabel(calcularPromedioAtencion(reporteAtencion))}
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sesiones de Atención */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-blue-600" />
                    Sesiones de Lectura
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reporteAtencion.atencion?.map((sesion, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-900">{sesion.tema}</h4>
                          <Badge variant="outline">{sesion.fecha}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Tiempo de lectura:</p>
                            <p className="font-medium">{sesion.tiempoLectura.toFixed(2)} min</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Ojos cerrados:</p>
                            <p className="font-medium">
                              {sesion.vectorOjosCerados.length > 0 ? `${sesion.vectorOjosCerados.length} eventos` : 'Sin eventos'}
                            </p>
                          </div>
                        </div>
                        {sesion.vectorOjosCerados.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500">Momentos de distracción:</p>
                            <p className="text-xs text-red-600">{formatearTiempo(sesion.vectorOjosCerados)}</p>
                          </div>
                        )}
                      </div>
                    )) || (
                      <div className="text-center py-4 text-gray-500">
                        No hay datos de sesiones de lectura
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Análisis de Emociones */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                    Análisis de Emociones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const { emocionesAgregadas, totalImagenes } = procesarEmociones(reporteAtencion.emociones || [])
                    return (
                      <div className="space-y-4">
                        <div className="text-center mb-4">
                          <p className="text-sm text-gray-600">Total de imágenes procesadas</p>
                          <p className="text-2xl font-bold text-blue-600">{totalImagenes}</p>
                        </div>
                        
                        {Object.entries(emocionesAgregadas).map(([emocion, cantidad]) => {
                          const porcentaje = totalImagenes > 0 ? (cantidad / totalImagenes) * 100 : 0
                          return (
                            <div key={emocion} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full ${obtenerColorEmocion(emocion)}`}></div>
                                <span className="font-medium text-gray-900 capitalize">{emocion}</span>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-gray-900">{cantidad} imágenes</p>
                                <p className="text-sm text-gray-600">{porcentaje.toFixed(1)}%</p>
                              </div>
                            </div>
                          )
                        })}
                        
                        {Object.keys(emocionesAgregadas).length === 0 && (
                          <div className="text-center py-4 text-gray-500">
                            No hay datos de emociones disponibles
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>
            </div>

            {/* Información adicional del reporte */}
            <Card>
              <CardHeader>
                <CardTitle>Resumen del Análisis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">Información del Estudiante</h3>
                    <p className="text-sm text-blue-600">Nombre: {selectedStudent?.first_name} {selectedStudent?.last_name}</p>
                    <p className="text-sm text-blue-600">Email: {selectedStudent?.email}</p>
                    <p className="text-sm text-blue-600">Usuario: {selectedStudent?.username}</p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">Métricas de Rendimiento</h3>
                    <p className="text-sm text-green-600">
                      Sesiones analizadas: {reporteAtencion.atencion?.length || 0}
                    </p>
                    <p className="text-sm text-green-600">
                      Tiempo total de lectura: {(reporteAtencion.atencion?.reduce((sum, s) => sum + s.tiempoLectura, 0) || 0).toFixed(2)} min
                    </p>
                    <p className="text-sm text-green-600">
                      Nivel de atención: {getAttentionLevelLabel(calcularPromedioAtencion(reporteAtencion))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : isLoadingReport ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando reporte del estudiante...</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
