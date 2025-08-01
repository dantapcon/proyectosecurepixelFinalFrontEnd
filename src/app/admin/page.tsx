"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  BarChart3,
  Settings,
  Camera,
  Brain,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Download,
  Filter,
  Search,
  Eye,
  Activity,
} from "lucide-react"
import Link from "next/link"
import DashboardHeader from "@/components/DashboardHeader"

export default function AdminDashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d")
  const [selectedModule, setSelectedModule] = useState("all")

  // Mock data
  const systemStats = {
    totalStudents: 156,
    activeEvaluations: 12,
    completedEvaluations: 1247,
    systemUptime: "99.8%",
    emotionDetectionAccuracy: "94.2%",
    aiResponseTime: "1.2s",
  }

  const emotionCorrelationData = [
    { emotion: "Concentrado", avgScore: 87, count: 45 },
    { emotion: "Confiado", avgScore: 92, count: 38 },
    { emotion: "Ansioso", avgScore: 72, count: 28 },
    { emotion: "Frustrado", avgScore: 65, count: 15 },
    { emotion: "Neutral", avgScore: 79, count: 52 },
  ]

  const recentAlerts = [
    { type: "warning", message: "Estudiante Juan P. muestra ansiedad persistente", time: "Hace 15 min" },
    { type: "info", message: "Nuevo módulo de evaluación generado por IA", time: "Hace 1 hora" },
    { type: "error", message: "Fallo temporal en análisis facial - Resuelto", time: "Hace 2 horas" },
    { type: "success", message: "Backup de datos completado exitosamente", time: "Hace 4 horas" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <DashboardHeader title="SecurePixel Admin" userRole="admin" showSystemStatus={true} />

      <div className="container mx-auto px-4 py-8">
        {/* System Overview */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de Administración</h1>
          <p className="text-gray-600">Monitoreo y gestión del sistema de evaluación adaptativa</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="border-blue-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Estudiantes</p>
                  <p className="text-2xl font-bold text-blue-600">{systemStats.totalStudents}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Evaluaciones Activas</p>
                  <p className="text-2xl font-bold text-green-600">{systemStats.activeEvaluations}</p>
                </div>
                <Activity className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completadas</p>
                  <p className="text-2xl font-bold text-purple-600">{systemStats.completedEvaluations}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Uptime</p>
                  <p className="text-2xl font-bold text-orange-600">{systemStats.systemUptime}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-indigo-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Precisión IA</p>
                  <p className="text-2xl font-bold text-indigo-600">{systemStats.emotionDetectionAccuracy}</p>
                </div>
                <Brain className="h-8 w-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-teal-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tiempo Resp.</p>
                  <p className="text-2xl font-bold text-teal-600">{systemStats.aiResponseTime}</p>
                </div>
                <Camera className="h-8 w-8 text-teal-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analytics">Análisis</TabsTrigger>
            <TabsTrigger value="students">Estudiantes</TabsTrigger>
            <TabsTrigger value="system">Sistema</TabsTrigger>
            <TabsTrigger value="reports">Reportes</TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Emotion-Performance Correlation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                    Correlación Emoción-Rendimiento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {emotionCorrelationData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              item.emotion === "Concentrado"
                                ? "bg-green-500"
                                : item.emotion === "Confiado"
                                  ? "bg-blue-500"
                                  : item.emotion === "Ansioso"
                                    ? "bg-yellow-500"
                                    : item.emotion === "Frustrado"
                                      ? "bg-red-500"
                                      : "bg-gray-500"
                            }`}
                          ></div>
                          <span className="font-medium text-gray-900">{item.emotion}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{item.avgScore}%</p>
                          <p className="text-sm text-gray-600">{item.count} estudiantes</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* System Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                    Alertas del Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentAlerts.map((alert, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${
                            alert.type === "error"
                              ? "bg-red-500"
                              : alert.type === "warning"
                                ? "bg-yellow-500"
                                : alert.type === "success"
                                  ? "bg-green-500"
                                  : "bg-blue-500"
                          }`}
                        ></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{alert.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Tendencias de Rendimiento</CardTitle>
                <div className="flex space-x-2">
                  <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">7 días</SelectItem>
                      <SelectItem value="30d">30 días</SelectItem>
                      <SelectItem value="90d">90 días</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedModule} onValueChange={setSelectedModule}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los módulos</SelectItem>
                      <SelectItem value="phishing">Phishing</SelectItem>
                      <SelectItem value="passwords">Contraseñas</SelectItem>
                      <SelectItem value="networks">Redes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Gráfico de tendencias de rendimiento</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Estudiantes</CardTitle>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input placeholder="Buscar estudiante..." className="pl-10" />
                  </div>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros
                  </Button>
                  <Button>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      name: "Juan Pérez",
                      email: "juan.perez@email.com",
                      progress: 68,
                      lastActive: "Hace 2 horas",
                      status: "Activo",
                    },
                    {
                      name: "María García",
                      email: "maria.garcia@email.com",
                      progress: 85,
                      lastActive: "Hace 1 día",
                      status: "Activo",
                    },
                    {
                      name: "Carlos López",
                      email: "carlos.lopez@email.com",
                      progress: 42,
                      lastActive: "Hace 3 días",
                      status: "Inactivo",
                    },
                    {
                      name: "Ana Martínez",
                      email: "ana.martinez@email.com",
                      progress: 91,
                      lastActive: "Hace 1 hora",
                      status: "Activo",
                    },
                  ].map((student, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
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
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-900">Progreso: {student.progress}%</p>
                          <p className="text-xs text-gray-500">{student.lastActive}</p>
                        </div>
                        <Badge
                          className={
                            student.status === "Activo" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }
                        >
                          {student.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Camera className="h-5 w-5 mr-2 text-blue-600" />
                    Estado del Análisis Facial
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Servicio DeepFace:</span>
                      <Badge className="bg-green-100 text-green-800">Operativo</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Precisión promedio:</span>
                      <span className="font-semibold text-gray-900">94.2%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Imágenes procesadas hoy:</span>
                      <span className="font-semibold text-gray-900">1,247</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Tiempo promedio análisis:</span>
                      <span className="font-semibold text-gray-900">0.8s</span>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm text-green-800">
                        ✓ Eliminación automática de imágenes funcionando correctamente
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="h-5 w-5 mr-2 text-purple-600" />
                    Estado de IA Generativa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">API Claude:</span>
                      <Badge className="bg-green-100 text-green-800">Conectado</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Tiempo de respuesta:</span>
                      <span className="font-semibold text-gray-900">1.2s</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Preguntas generadas hoy:</span>
                      <span className="font-semibold text-gray-900">3,456</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Tasa de éxito:</span>
                      <span className="font-semibold text-gray-900">99.1%</span>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-800">ℹ Adaptación de dificultad funcionando óptimamente</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Configuración del Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Parámetros de Evaluación</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-700">Ángulo máximo de inclinación cabeza:</label>
                        <Input className="w-20" defaultValue="75" />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-700">Tiempo máximo por pregunta:</label>
                        <Input className="w-20" defaultValue="120" />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-700">Nivel de adaptación:</label>
                        <Select defaultValue="medium">
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Bajo</SelectItem>
                            <SelectItem value="medium">Medio</SelectItem>
                            <SelectItem value="high">Alto</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Configuración de Privacidad</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-700">Retención de logs (días):</label>
                        <Input className="w-20" defaultValue="30" />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-700">Eliminación automática imágenes:</label>
                        <Badge className="bg-green-100 text-green-800">Activado</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-700">Encriptación de datos:</label>
                        <Badge className="bg-green-100 text-green-800">AES-256</Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex space-x-2">
                  <Button>Guardar Configuración</Button>
                  <Button variant="outline">Restaurar Valores por Defecto</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generación de Reportes</CardTitle>
                <p className="text-gray-600">Genera reportes personalizados del sistema y rendimiento estudiantil</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="border-blue-100 hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                      <h3 className="font-semibold text-gray-900 mb-2">Reporte de Rendimiento</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Análisis completo del rendimiento estudiantil por módulo
                      </p>
                      <Button size="sm" className="w-full">
                        Generar
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-green-100 hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <Camera className="h-12 w-12 text-green-600 mx-auto mb-3" />
                      <h3 className="font-semibold text-gray-900 mb-2">Análisis Emocional</h3>
                      <p className="text-sm text-gray-600 mb-4">Correlación entre emociones y desempeño académico</p>
                      <Button size="sm" className="w-full">
                        Generar
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-100 hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <Activity className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                      <h3 className="font-semibold text-gray-900 mb-2">Uso del Sistema</h3>
                      <p className="text-sm text-gray-600 mb-4">Estadísticas de uso y actividad de la plataforma</p>
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
                    {
                      name: "Reporte Mensual - Noviembre 2023",
                      type: "Rendimiento",
                      date: "2023-12-01",
                      size: "2.4 MB",
                    },
                    { name: "Análisis Emocional - Semana 48", type: "Emocional", date: "2023-11-30", size: "1.8 MB" },
                    { name: "Uso del Sistema - Q4 2023", type: "Sistema", date: "2023-11-28", size: "3.1 MB" },
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
                            {report.type} • {report.date} • {report.size}
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
