"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Shield,
  ArrowLeft,
  TrendingUp,
  Clock,
  Award,
  Target,
  Calendar,
  BarChart3,
  Camera,
  Brain,
  CheckCircle,
  XCircle,
} from "lucide-react"
import Link from "next/link"

export default function ProgressPage() {
  // Mock progress data
  const overallProgress = {
    totalProgress: 68,
    completedModules: 4,
    totalModules: 6,
    totalHours: 24,
    averageScore: 85,
    streak: 7,
    achievements: 12,
  }

  const moduleProgress = [
    {
      name: "Fundamentos de Ciberseguridad",
      progress: 100,
      score: 92,
      timeSpent: "4h 30m",
      status: "completed",
      lastActivity: "Hace 1 semana",
    },
    {
      name: "Gestión de Contraseñas",
      progress: 100,
      score: 88,
      timeSpent: "3h 45m",
      status: "completed",
      lastActivity: "Hace 5 días",
    },
    {
      name: "Phishing y Ingeniería Social",
      progress: 75,
      score: 85,
      timeSpent: "5h 20m",
      status: "in-progress",
      lastActivity: "Hace 2 horas",
    },
    {
      name: "Seguridad en Redes",
      progress: 25,
      score: 78,
      timeSpent: "2h 15m",
      status: "in-progress",
      lastActivity: "Hace 1 día",
    },
    {
      name: "Criptografía Básica",
      progress: 0,
      score: 0,
      timeSpent: "0h",
      status: "locked",
      lastActivity: "No iniciado",
    },
    {
      name: "Respuesta a Incidentes",
      progress: 0,
      score: 0,
      timeSpent: "0h",
      status: "locked",
      lastActivity: "No iniciado",
    },
  ]

  const emotionalHistory = [
    { date: "2023-12-01", predominant: "Concentrado", score: 92 },
    { date: "2023-11-30", predominant: "Confiado", score: 88 },
    { date: "2023-11-29", predominant: "Ansioso", score: 75 },
    { date: "2023-11-28", predominant: "Concentrado", score: 85 },
    { date: "2023-11-27", predominant: "Confiado", score: 90 },
  ]

  const achievements = [
    { name: "Primer Paso", description: "Completaste tu primera lección", icon: "🎯", earned: true },
    { name: "Detector de Phishing", description: "85% de aciertos en evaluación de phishing", icon: "🕵️", earned: true },
    { name: "Racha de 7 días", description: "Estudiaste 7 días consecutivos", icon: "🔥", earned: true },
    {
      name: "Experto en Contraseñas",
      description: "Puntuación perfecta en gestión de contraseñas",
      icon: "🔐",
      earned: true,
    },
    { name: "Estudiante Constante", description: "20 horas de estudio completadas", icon: "⏰", earned: true },
    { name: "Maestro de la Seguridad", description: "Completa todos los módulos", icon: "🏆", earned: false },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Mi Progreso</span>
            </div>
          </div>
          <Badge className="bg-blue-100 text-blue-800">{overallProgress.totalProgress}% Completado</Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Progreso Total</p>
                  <p className="text-3xl font-bold text-blue-600">{overallProgress.totalProgress}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <Progress value={overallProgress.totalProgress} className="mt-3 h-2" />
            </CardContent>
          </Card>

          <Card className="border-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Módulos</p>
                  <p className="text-3xl font-bold text-green-600">
                    {overallProgress.completedModules}/{overallProgress.totalModules}
                  </p>
                </div>
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {overallProgress.totalModules - overallProgress.completedModules} restantes
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tiempo Total</p>
                  <p className="text-3xl font-bold text-orange-600">{overallProgress.totalHours}h</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Promedio: {Math.round(overallProgress.totalHours / 7)} h/semana
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Puntuación</p>
                  <p className="text-3xl font-bold text-purple-600">{overallProgress.averageScore}%</p>
                </div>
                <Award className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-sm text-gray-600 mt-2">Racha: {overallProgress.streak} días</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="modules" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="modules">Módulos</TabsTrigger>
            <TabsTrigger value="emotions">Análisis Emocional</TabsTrigger>
            <TabsTrigger value="achievements">Logros</TabsTrigger>
            <TabsTrigger value="statistics">Estadísticas</TabsTrigger>
          </TabsList>

          {/* Modules Tab */}
          <TabsContent value="modules" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Progreso por Módulo</CardTitle>
                <p className="text-gray-600">Tu avance en cada módulo de ciberseguridad</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {moduleProgress.map((module, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-gray-900">{module.name}</h3>
                          <Badge
                            className={
                              module.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : module.status === "in-progress"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                            }
                          >
                            {module.status === "completed"
                              ? "Completado"
                              : module.status === "in-progress"
                                ? "En Progreso"
                                : "Bloqueado"}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Tiempo: {module.timeSpent}</span>
                          {module.score > 0 && <span>Puntuación: {module.score}%</span>}
                        </div>
                      </div>

                      <Progress value={module.progress} className="h-3" />

                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>{module.progress}% completado</span>
                        <span>{module.lastActivity}</span>
                      </div>

                      {module.status === "in-progress" && (
                        <div className="flex space-x-2">
                          <Link href={`/learning/${module.name.toLowerCase().replace(/\s+/g, "-")}`}>
                            <Button size="sm">Continuar Aprendizaje</Button>
                          </Link>
                          <Link href={`/evaluation/${module.name.toLowerCase().replace(/\s+/g, "-")}`}>
                            <Button size="sm" variant="outline">
                              Evaluación
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Emotions Tab */}
          <TabsContent value="emotions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Camera className="h-5 w-5 mr-2 text-blue-600" />
                    Historial Emocional
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {emotionalHistory.map((entry, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-4 w-4 text-gray-600" />
                          <div>
                            <p className="font-medium text-gray-900">{entry.date}</p>
                            <p className="text-sm text-gray-600">Estado: {entry.predominant}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{entry.score}%</p>
                          <p className="text-sm text-gray-600">Puntuación</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                    Correlación Emoción-Rendimiento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-medium text-green-900">Concentrado</span>
                      </div>
                      <span className="font-semibold text-green-900">88% promedio</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="font-medium text-blue-900">Confiado</span>
                      </div>
                      <span className="font-semibold text-blue-900">91% promedio</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="font-medium text-yellow-900">Ansioso</span>
                      </div>
                      <span className="font-semibold text-yellow-900">72% promedio</span>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg mt-4">
                      <p className="text-sm text-blue-800">
                        <Brain className="h-4 w-4 inline mr-1" />
                        <strong>Recomendación IA:</strong> Tu rendimiento es mejor cuando te sientes concentrado o
                        confiado. Intenta técnicas de relajación antes de las evaluaciones.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2 text-yellow-600" />
                  Logros Desbloqueados
                </CardTitle>
                <p className="text-gray-600">
                  Has desbloqueado {achievements.filter((a) => a.earned).length} de {achievements.length} logros
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((achievement, index) => (
                    <Card
                      key={index}
                      className={`${
                        achievement.earned ? "border-yellow-200 bg-yellow-50" : "border-gray-200 bg-gray-50 opacity-60"
                      }`}
                    >
                      <CardContent className="p-6 text-center">
                        <div className="text-4xl mb-3">{achievement.icon}</div>
                        <h3
                          className={`font-semibold mb-2 ${achievement.earned ? "text-yellow-900" : "text-gray-600"}`}
                        >
                          {achievement.name}
                        </h3>
                        <p className={`text-sm ${achievement.earned ? "text-yellow-800" : "text-gray-500"}`}>
                          {achievement.description}
                        </p>
                        {achievement.earned && (
                          <Badge className="mt-3 bg-yellow-100 text-yellow-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Desbloqueado
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="statistics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Estadísticas de Evaluación</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-green-900">Respuestas Correctas</span>
                      </div>
                      <span className="font-semibold text-green-900">127</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <XCircle className="h-5 w-5 text-red-600" />
                        <span className="text-red-900">Respuestas Incorrectas</span>
                      </div>
                      <span className="font-semibold text-red-900">23</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <span className="text-blue-900">Tiempo Promedio/Pregunta</span>
                      </div>
                      <span className="font-semibold text-blue-900">45s</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Target className="h-5 w-5 text-purple-600" />
                        <span className="text-purple-900">Precisión General</span>
                      </div>
                      <span className="font-semibold text-purple-900">84.7%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Actividad Semanal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Gráfico de actividad semanal</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Tendencias de Mejora</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Gráfico de tendencias de puntuación a lo largo del tiempo</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
