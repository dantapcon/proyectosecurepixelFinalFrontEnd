"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Shield, BookOpen, Brain, Camera, TrendingUp, Clock, Award, Target, User, Settings, LogOut } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
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
              <span className="text-gray-700">Juan Pérez</span>
            </div>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configuración
            </Button>
            <Button variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Bienvenido de vuelta, Juan!</h1>
          <p className="text-gray-600">Continúa tu aprendizaje en ciberseguridad con nuestro sistema adaptativo</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Progreso Total</p>
                  <p className="text-2xl font-bold text-blue-600">68%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Módulos Completados</p>
                  <p className="text-2xl font-bold text-green-600">4/6</p>
                </div>
                <Award className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tiempo de Estudio</p>
                  <p className="text-2xl font-bold text-orange-600">12h</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Puntuación Promedio</p>
                  <p className="text-2xl font-bold text-purple-600">85%</p>
                </div>
                <Target className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Learning Modules */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                  Módulos de Aprendizaje
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Fundamentos de Ciberseguridad</h3>
                      <p className="text-sm text-gray-600">Conceptos básicos y principios fundamentales</p>
                      <Progress value={100} className="mt-2 h-2" />
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Completado
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Gestión de Contraseñas</h3>
                      <p className="text-sm text-gray-600">Mejores prácticas para contraseñas seguras</p>
                      <Progress value={100} className="mt-2 h-2" />
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Completado
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Phishing y Ingeniería Social</h3>
                      <p className="text-sm text-gray-600">Identificación y prevención de ataques</p>
                      <Progress value={75} className="mt-2 h-2" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        En Progreso
                      </Badge>
                      <Link href="/learning/phishing">
                        <Button size="sm">Continuar</Button>
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Seguridad en Redes</h3>
                      <p className="text-sm text-gray-600">Protección de redes y comunicaciones</p>
                      <Progress value={0} className="mt-2 h-2" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">Bloqueado</Badge>
                      <Button size="sm" disabled>
                        Iniciar
                      </Button>
                    </div>
                  </div>
                </div>
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
            

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Recomendaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium">Practica más ejercicios de phishing</p>
                    <p className="text-xs text-blue-600 mt-1">Basado en tu último desempeño</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">¡Excelente progreso!</p>
                    <p className="text-xs text-green-600 mt-1">Mantén el ritmo de estudio</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">Completaste la evaluación de "Gestión de Contraseñas"</p>
                      <p className="text-xs text-gray-500">Hace 2 horas</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">Iniciaste el módulo "Phishing y Ingeniería Social"</p>
                      <p className="text-xs text-gray-500">Ayer</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">Obtuviste 92% en la evaluación adaptativa</p>
                      <p className="text-xs text-gray-500">Hace 3 días</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>







          </div>
        </div>
      </div>
    </div>
  )
}
