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
  BookOpen, 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Award,
  ArrowLeft,
  Download,
  RefreshCw
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { estadisticasAPI, isAuthenticated } from "@/lib/api"
import type { ReporteEstadisticasGenerales } from "@/types/estadisticas"

export default function ReporteEstadisticasPage() {
  const [reporteGeneral, setReporteGeneral] = useState<ReporteEstadisticasGenerales | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
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
    
    loadReporteGeneral()
  }, [user, router])

  const loadReporteGeneral = async () => {
    setIsLoading(true)
    setError("")
    
    // Verificar autenticación antes de hacer la llamada
    if (!isAuthenticated()) {
      setError('No estás autenticado. Por favor, inicia sesión nuevamente.')
      setIsLoading(false)
      return
    }
    
    try {
      const response = await estadisticasAPI.getReporteEstadisticasGenerales()
      
      if (response.ok) {
        setReporteGeneral(response.data)
      } else {
        if (response.status === 401) {
          setError('Sesión expirada. Por favor, inicia sesión nuevamente.')
        } else {
          setError('Error al cargar el reporte de estadísticas generales')
        }
      }
    } catch (error) {
      console.error('Error cargando reporte:', error)
      setError('Error de conexión al cargar el reporte')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadReport = () => {
    // Implementar descarga del reporte en PDF/Excel
    console.log('Descargando reporte...')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando reporte de estadísticas...</p>
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
              <span className="text-2xl font-bold text-gray-900">Reporte de Estadísticas Generales</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={loadReporteGeneral}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadReport}>
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

        {reporteGeneral && (
          <>
            {/* Resumen General */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Estadísticas Generales del Sistema
              </h1>
              <p className="text-gray-600">
                Resumen completo de la actividad y el rendimiento del sistema SecurePixel
              </p>
            </div>

            {/* Métricas Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card className="border-blue-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total de Usuarios</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {reporteGeneral.total_usuarios.toLocaleString()}
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
                      <p className="text-sm text-gray-600">Total de Cursos</p>
                      <p className="text-3xl font-bold text-green-600">
                        {reporteGeneral.total_cursos}
                      </p>
                    </div>
                    <BookOpen className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total de Evaluaciones</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {reporteGeneral.total_evaluaciones.toLocaleString()}
                      </p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Promedio de Calificaciones</p>
                      <p className="text-3xl font-bold text-orange-600">
                        {reporteGeneral.promedio_calificaciones.toFixed(1)}%
                      </p>
                    </div>
                    <Award className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-indigo-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Estudiantes Activos (Último Mes)</p>
                      <p className="text-3xl font-bold text-indigo-600">
                        {reporteGeneral.estudiantes_activos_ultimo_mes}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-indigo-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-teal-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Profesores Activos</p>
                      <p className="text-3xl font-bold text-teal-600">
                        {reporteGeneral.profesores_activos}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-teal-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Análisis Detallado */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Rendimiento del Sistema</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Tasa de Participación Estudiantil</span>
                        <span className="text-sm font-medium">
                          {reporteGeneral.total_usuarios > 0 
                            ? ((reporteGeneral.estudiantes_activos_ultimo_mes / reporteGeneral.total_usuarios) * 100).toFixed(1)
                            : 0}%
                        </span>
                      </div>
                      <Progress 
                        value={reporteGeneral.total_usuarios > 0 
                          ? (reporteGeneral.estudiantes_activos_ultimo_mes / reporteGeneral.total_usuarios) * 100
                          : 0} 
                        className="h-2" 
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Rendimiento Académico Promedio</span>
                        <span className="text-sm font-medium">{reporteGeneral.promedio_calificaciones.toFixed(1)}%</span>
                      </div>
                      <Progress value={reporteGeneral.promedio_calificaciones} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Evaluaciones por Usuario</span>
                        <span className="text-sm font-medium">
                          {reporteGeneral.total_usuarios > 0 
                            ? (reporteGeneral.total_evaluaciones / reporteGeneral.total_usuarios).toFixed(1)
                            : 0}
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(
                          reporteGeneral.total_usuarios > 0 
                            ? (reporteGeneral.total_evaluaciones / reporteGeneral.total_usuarios) * 10
                            : 0, 
                          100
                        )} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resumen de Actividad</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-blue-800">Ratio Profesor/Estudiante</p>
                        <p className="text-xs text-blue-600">Distribución de usuarios en el sistema</p>
                      </div>
                      <p className="text-lg font-bold text-blue-600">
                        1:{reporteGeneral.profesores_activos > 0 
                          ? Math.round((reporteGeneral.total_usuarios - reporteGeneral.profesores_activos) / reporteGeneral.profesores_activos)
                          : 0}
                      </p>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-green-800">Cursos por Profesor</p>
                        <p className="text-xs text-green-600">Carga promedio de trabajo</p>
                      </div>
                      <p className="text-lg font-bold text-green-600">
                        {reporteGeneral.profesores_activos > 0 
                          ? (reporteGeneral.total_cursos / reporteGeneral.profesores_activos).toFixed(1)
                          : 0}
                      </p>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-purple-800">Evaluaciones Completadas</p>
                        <p className="text-xs text-purple-600">Total en el sistema</p>
                      </div>
                      <p className="text-lg font-bold text-purple-600">
                        {reporteGeneral.total_evaluaciones.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
