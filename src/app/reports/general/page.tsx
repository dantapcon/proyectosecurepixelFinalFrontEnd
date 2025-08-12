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
import { useClientOnly } from "@/hooks/useClientOnly"

export default function ReporteEstadisticasPage() {
  const [reporteGeneral, setReporteGeneral] = useState<ReporteEstadisticasGenerales | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const mounted = useClientOnly()
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!mounted) return
    
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
  }, [user, router, mounted])

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

  // Prevenir problemas de hidratación
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Inicializando...</p>
        </div>
      </div>
    )
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
                      <p className="text-sm text-gray-600">Total de Estudiantes</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {(reporteGeneral?.estadisticas_globale?.n_estudiantes ?? 0).toLocaleString()}
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
                      <p className="text-sm text-gray-600">Total de Lecciones</p>
                      <p className="text-3xl font-bold text-green-600">
                        {reporteGeneral?.estadisticas_globale?.n_lecciones ?? 0}
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
                      <p className="text-sm text-gray-600">Promedio General</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {(reporteGeneral?.estadisticas_globale?.promedio_general ?? 0).toFixed(1)}
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
                      <p className="text-sm text-gray-600">Tiempo Promedio de Estudio</p>
                      <p className="text-3xl font-bold text-orange-600">
                        {(reporteGeneral?.estadisticas_globale?.tiempo_promedio_estudio ?? 0).toFixed(1)} min
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
                      <p className="text-sm text-gray-600">Profesores Activos</p>
                      <p className="text-3xl font-bold text-indigo-600">
                        {reporteGeneral?.estadisticas_por_profesor ? Object.keys(reporteGeneral.estadisticas_por_profesor).length : 0}
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
                      <p className="text-sm text-gray-600">Cursos Disponibles</p>
                      <p className="text-3xl font-bold text-teal-600">
                        {reporteGeneral?.estadisticas_por_curso ? Object.keys(reporteGeneral.estadisticas_por_curso).length : 0}
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
                        <span className="text-sm text-gray-600">Promedio General del Sistema</span>
                        <span className="text-sm font-medium">
                          {(reporteGeneral?.estadisticas_globale?.promedio_general ?? 0).toFixed(1)}/20
                        </span>
                      </div>
                      <Progress 
                        value={((reporteGeneral?.estadisticas_globale?.promedio_general ?? 0) / 20) * 100} 
                        className="h-2" 
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Tiempo Promedio de Estudio</span>
                        <span className="text-sm font-medium">{(reporteGeneral?.estadisticas_globale?.tiempo_promedio_estudio ?? 0).toFixed(1)} min</span>
                      </div>
                      <Progress 
                        value={Math.min(((reporteGeneral?.estadisticas_globale?.tiempo_promedio_estudio ?? 0) / 60) * 100, 100)} 
                        className="h-2" 
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Estudiantes por Profesor</span>
                        <span className="text-sm font-medium">
                          {reporteGeneral?.estadisticas_por_profesor 
                            ? (
                                (reporteGeneral?.estadisticas_globale?.n_estudiantes ?? 0) / 
                                Math.max(Object.keys(reporteGeneral.estadisticas_por_profesor).length, 1)
                              ).toFixed(1)
                            : '0'}
                        </span>
                      </div>
                      <Progress 
                        value={reporteGeneral?.estadisticas_por_profesor 
                          ? Math.min(
                              ((reporteGeneral?.estadisticas_globale?.n_estudiantes ?? 0) / 
                               Math.max(Object.keys(reporteGeneral.estadisticas_por_profesor).length, 1)) * 5, 
                              100
                            )
                          : 0} 
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
                        <p className="text-sm font-medium text-blue-800">Total de Estudiantes</p>
                        <p className="text-xs text-blue-600">Estudiantes registrados en el sistema</p>
                      </div>
                      <p className="text-lg font-bold text-blue-600">
                        {(reporteGeneral?.estadisticas_globale?.n_estudiantes ?? 0).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-green-800">Lecciones Disponibles</p>
                        <p className="text-xs text-green-600">Total de lecciones en el sistema</p>
                      </div>
                      <p className="text-lg font-bold text-green-600">
                        {reporteGeneral?.estadisticas_globale?.n_lecciones ?? 0}
                      </p>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-purple-800">Cursos Activos</p>
                        <p className="text-xs text-purple-600">Cursos con estudiantes inscritos</p>
                      </div>
                      <p className="text-lg font-bold text-purple-600">
                        {reporteGeneral?.estadisticas_por_curso ? Object.keys(reporteGeneral.estadisticas_por_curso).length : 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Estadísticas por Curso */}
            {reporteGeneral?.estadisticas_por_curso && Object.keys(reporteGeneral.estadisticas_por_curso).length > 0 && (
              <div className="mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Estadísticas por Curso</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Curso</th>
                            <th className="text-center p-2">Estudiantes</th>
                            <th className="text-center p-2">Promedio</th>
                            <th className="text-center p-2">Lecciones</th>
                            <th className="text-center p-2">Tiempo Promedio</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(reporteGeneral.estadisticas_por_curso).map(([nombreCurso, stats]) => (
                            <tr key={nombreCurso} className="border-b hover:bg-gray-50">
                              <td className="p-2 font-medium">{nombreCurso}</td>
                              <td className="p-2 text-center">{stats.n_estudiantes}</td>
                              <td className="p-2 text-center">
                                <Badge variant={stats.promedio_general >= 10 ? "default" : "destructive"}>
                                  {stats.promedio_general.toFixed(1)}/20
                                </Badge>
                              </td>
                              <td className="p-2 text-center">{stats.n_lecciones}</td>
                              <td className="p-2 text-center">{stats.tiempo_promedio_estudio.toFixed(1)} min</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Estadísticas por Profesor */}
            {reporteGeneral?.estadisticas_por_profesor && Object.keys(reporteGeneral.estadisticas_por_profesor).length > 0 && (
              <div className="mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Estadísticas por Profesor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Profesor</th>
                            <th className="text-center p-2">Estudiantes</th>
                            <th className="text-center p-2">Promedio</th>
                            <th className="text-center p-2">Lecciones</th>
                            <th className="text-center p-2">Tiempo Promedio</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(reporteGeneral.estadisticas_por_profesor).map(([nombreProfesor, stats]) => (
                            <tr key={nombreProfesor} className="border-b hover:bg-gray-50">
                              <td className="p-2 font-medium">{nombreProfesor}</td>
                              <td className="p-2 text-center">{stats.n_estudiantes}</td>
                              <td className="p-2 text-center">
                                <Badge variant={stats.promedio_general >= 10 ? "default" : "destructive"}>
                                  {stats.promedio_general.toFixed(1)}/20
                                </Badge>
                              </td>
                              <td className="p-2 text-center">{stats.n_lecciones}</td>
                              <td className="p-2 text-center">{stats.tiempo_promedio_estudio.toFixed(1)} min</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
