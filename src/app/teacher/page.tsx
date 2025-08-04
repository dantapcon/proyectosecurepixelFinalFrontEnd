"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Shield,
  Users,
  BarChart3,
  AlertTriangle,
  TrendingUp,
  Download,
  Search,
  Eye,
  BookOpen,
  Camera,
  Clock,
  Award,
  LogOut,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export default function TeacherDashboard() {
  const [selectedClass, setSelectedClass] = useState("all")
  const [selectedModule, setSelectedModule] = useState("all")
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { logout } = useAuth()
  const router = useRouter()

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

  // Mock data for teacher dashboard
  const classStats = {
    totalStudents: 32,
    activeStudents: 28,
    completedEvaluations: 156,
    averageScore: 78,
    averageTime: "22:15",
    riskStudents: 4,
  }

  const studentPerformance = [
    {
      name: "Juan Pérez",
      email: "juan.perez@email.com",
      progress: 85,
      lastScore: 92,
      emotionalState: "Concentrado",
      riskLevel: "Bajo",
      lastActive: "Hace 2 horas",
    },
    {
      name: "María García",
      email: "maria.garcia@email.com",
      progress: 72,
      lastScore: 88,
      emotionalState: "Confiado",
      riskLevel: "Bajo",
      lastActive: "Hace 1 día",
    },
    {
      name: "Carlos López",
      email: "carlos.lopez@email.com",
      progress: 45,
      lastScore: 65,
      emotionalState: "Ansioso",
      riskLevel: "Alto",
      lastActive: "Hace 3 días",
    },
    {
      name: "Ana Martínez",
      email: "ana.martinez@email.com",
      progress: 91,
      lastScore: 95,
      emotionalState: "Confiado",
      riskLevel: "Bajo",
      lastActive: "Hace 1 hora",
    },
  ]

  const moduleProgress = [
    { module: "Fundamentos de Ciberseguridad", completed: 28, total: 32, avgScore: 85 },
    { module: "Gestión de Contraseñas", completed: 25, total: 32, avgScore: 82 },
    { module: "Phishing y Ingeniería Social", completed: 18, total: 32, avgScore: 78 },
    { module: "Seguridad en Redes", completed: 8, total: 32, avgScore: 75 },
  ]

  const alerts = [
    {
      student: "Carlos López",
      type: "Rendimiento Bajo",
      message: "Puntuación consistentemente por debajo del 70%",
      severity: "high",
      time: "Hace 1 hora",
    },
    {
      student: "Sofia Ruiz",
      type: "Ansiedad Detectada",
      message: "Niveles altos de ansiedad durante evaluaciones",
      severity: "medium",
      time: "Hace 3 horas",
    },
    {
      student: "Diego Torres",
      type: "Inactividad",
      message: "Sin actividad en los últimos 5 días",
      severity: "medium",
      time: "Hace 1 día",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">SecurePixel Docente</span>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Seleccionar clase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las clases</SelectItem>
                <SelectItem value="cs101">Ciberseguridad 101</SelectItem>
                <SelectItem value="cs201">Ciberseguridad Avanzada</SelectItem>
              </SelectContent>
            </Select>
            <Badge className="bg-blue-100 text-blue-800">Prof. Ana Rodríguez</Badge>
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
        {/* Overview */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel del Docente</h1>
          <p className="text-gray-600">Monitoreo del progreso y rendimiento de tus estudiantes</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="border-blue-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Estudiantes</p>
                  <p className="text-2xl font-bold text-blue-600">{classStats.totalStudents}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Activos</p>
                  <p className="text-2xl font-bold text-green-600">{classStats.activeStudents}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Evaluaciones</p>
                  <p className="text-2xl font-bold text-purple-600">{classStats.completedEvaluations}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Promedio</p>
                  <p className="text-2xl font-bold text-orange-600">{classStats.averageScore}%</p>
                </div>
                <Award className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-indigo-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tiempo Prom.</p>
                  <p className="text-2xl font-bold text-indigo-600">{classStats.averageTime}</p>
                </div>
                <Clock className="h-8 w-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">En Riesgo</p>
                  <p className="text-2xl font-bold text-red-600">{classStats.riskStudents}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="students" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="students">Estudiantes</TabsTrigger>
            <TabsTrigger value="modules">Módulos</TabsTrigger>
            <TabsTrigger value="alerts">Alertas</TabsTrigger>
            <TabsTrigger value="reports">Reportes</TabsTrigger>
          </TabsList>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Rendimiento de Estudiantes</CardTitle>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input placeholder="Buscar estudiante..." className="pl-10" />
                  </div>
                  <Select value={selectedModule} onValueChange={setSelectedModule}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filtrar por módulo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los módulos</SelectItem>
                      <SelectItem value="phishing">Phishing</SelectItem>
                      <SelectItem value="passwords">Contraseñas</SelectItem>
                      <SelectItem value="networks">Redes</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {studentPerformance.map((student, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {student.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{student.name}</p>
                          <p className="text-sm text-gray-600">{student.email}</p>
                          <p className="text-xs text-gray-500">{student.lastActive}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Progreso</p>
                          <p className="font-semibold text-gray-900">{student.progress}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Última Nota</p>
                          <p className="font-semibold text-gray-900">{student.lastScore}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Estado Emocional</p>
                          <Badge className="bg-green-100 text-green-800 text-xs">{student.emotionalState}</Badge>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Riesgo</p>
                          <Badge
                            className={`text-xs ${
                              student.riskLevel === "Alto"
                                ? "bg-red-100 text-red-800"
                                : student.riskLevel === "Medio"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                            }`}
                          >
                            {student.riskLevel}
                          </Badge>
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Detalle
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Modules Tab */}
          <TabsContent value="modules" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                  Progreso por Módulo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {moduleProgress.map((module, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">{module.module}</h3>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-600">
                            {module.completed}/{module.total} estudiantes
                          </span>
                          <Badge className="bg-blue-100 text-blue-800">Promedio: {module.avgScore}%</Badge>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${(module.completed / module.total) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{Math.round((module.completed / module.total) * 100)}% completado</span>
                        <span>{module.total - module.completed} pendientes</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="h-5 w-5 mr-2 text-purple-600" />
                  Análisis Emocional por Módulo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Gráfico de análisis emocional por módulo</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                  Alertas y Recomendaciones
                </CardTitle>
                <p className="text-gray-600">Estudiantes que requieren atención especial</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alerts.map((alert, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-l-4 ${
                        alert.severity === "high"
                          ? "border-red-500 bg-red-50"
                          : alert.severity === "medium"
                            ? "border-yellow-500 bg-yellow-50"
                            : "border-blue-500 bg-blue-50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{alert.student}</h3>
                            <Badge
                              className={`text-xs ${
                                alert.severity === "high"
                                  ? "bg-red-100 text-red-800"
                                  : alert.severity === "medium"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {alert.type}
                            </Badge>
                          </div>
                          <p className="text-gray-700 mb-2">{alert.message}</p>
                          <p className="text-sm text-gray-500">{alert.time}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            Ver Detalle
                          </Button>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            Contactar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recomendaciones del Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Sugerencia de Intervención</h3>
                    <p className="text-blue-800 text-sm">
                      3 estudiantes muestran patrones de ansiedad durante evaluaciones. Considera programar sesiones de
                      apoyo o ajustar el ritmo de evaluación.
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2">Oportunidad de Refuerzo</h3>
                    <p className="text-green-800 text-sm">
                      El módulo de Phishing muestra menor comprensión. Considera material adicional o ejercicios
                      prácticos para este tema.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reportes de Clase</CardTitle>
                <p className="text-gray-600">Genera reportes detallados del rendimiento de tu clase</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="border-blue-100 hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                      <h3 className="font-semibold text-gray-900 mb-2">Reporte de Rendimiento</h3>
                      <p className="text-sm text-gray-600 mb-4">Análisis detallado del progreso de cada estudiante</p>
                      <Button size="sm" className="w-full">
                        Generar
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-green-100 hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <Camera className="h-12 w-12 text-green-600 mx-auto mb-3" />
                      <h3 className="font-semibold text-gray-900 mb-2">Análisis Emocional</h3>
                      <p className="text-sm text-gray-600 mb-4">Patrones emocionales y su impacto en el aprendizaje</p>
                      <Button size="sm" className="w-full">
                        Generar
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-100 hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <AlertTriangle className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                      <h3 className="font-semibold text-gray-900 mb-2">Estudiantes en Riesgo</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Identificación temprana de estudiantes que necesitan apoyo
                      </p>
                      <Button size="sm" className="w-full">
                        Generar
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reportes Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "Reporte Semanal - Semana 48", type: "Rendimiento", date: "2023-12-01", students: 32 },
                    { name: "Análisis Emocional - Noviembre", type: "Emocional", date: "2023-11-30", students: 28 },
                    { name: "Estudiantes en Riesgo - Q4", type: "Riesgo", date: "2023-11-28", students: 4 },
                  ].map((report, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <BarChart3 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{report.name}</p>
                          <p className="text-sm text-gray-600">
                            {report.type} • {report.date} • {report.students} estudiantes
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Descargar
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
