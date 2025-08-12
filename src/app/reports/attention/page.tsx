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
                        {reporteAtencion.promedio_general_atencion?.toFixed(1) || 'N/A'}%
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
                        {reporteAtencion.promedio_general_atencion > 60 ? 'Bueno' : 'Necesita Atención'}
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Información adicional del reporte */}
            <Card>
              <CardHeader>
                <CardTitle>Detalles del Análisis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">Información del Estudiante</h3>
                    <p className="text-sm text-blue-600">Email: {selectedStudent?.email}</p>
                    <p className="text-sm text-blue-600">Usuario: {selectedStudent?.username}</p>
                  </div>
                  
                  {reporteAtencion.estudiantes && reporteAtencion.estudiantes.length > 0 && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h3 className="font-semibold text-green-800 mb-2">Métricas de Atención</h3>
                      <p className="text-sm text-green-600">
                        Promedio general: {reporteAtencion.promedio_general_atencion?.toFixed(1)}%
                      </p>
                    </div>
                  )}
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
