"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  ArrowLeft,
  Clock,
  Brain,
  Camera,
  CheckCircle,
  XCircle,
  Award,
  Target,
  Smile,
  Frown,
  Meh,
} from "lucide-react"
import Link from "next/link"

export default function ResultsPage() {
  // Mock results data
  const results = {
    score: 85,
    totalQuestions: 15,
    correctAnswers: 13,
    timeSpent: "18:45",
    difficulty: "Intermedio",
    emotionalAnalysis: {
      predominant: "Concentrado",
      distribution: {
        happy: 45,
        neutral: 35,
        anxious: 15,
        frustrated: 5,
      },
    },
    recommendations: [
      "Excelente comprensión de conceptos básicos de phishing",
      "Practica más con casos de spear phishing avanzados",
      "Mantén la calma durante evaluaciones para mejor rendimiento",
    ],
    nextSteps: [
      "Continuar con el módulo de Seguridad en Redes",
      "Revisar ejercicios adicionales de phishing",
      "Programar próxima evaluación adaptativa",
    ],
  }

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
              <span className="text-xl font-bold text-gray-900">Resultados de Evaluación</span>
            </div>
          </div>
          <Badge className="bg-green-100 text-green-800">Evaluación Completada</Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Score Overview */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-4">
            <span className="text-4xl font-bold text-white">{results.score}%</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Excelente Trabajo!</h1>
          <p className="text-gray-600">Has completado la evaluación de Phishing y Ingeniería Social</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Performance Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-blue-600" />
                  Rendimiento Académico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-900">{results.correctAnswers}</p>
                    <p className="text-sm text-green-700">Correctas</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-red-900">{results.totalQuestions - results.correctAnswers}</p>
                    <p className="text-sm text-red-700">Incorrectas</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-900">{results.timeSpent}</p>
                    <p className="text-sm text-blue-700">Tiempo</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Brain className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-900">{results.difficulty}</p>
                    <p className="text-sm text-purple-700">Nivel</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            

            {/* Detailed Feedback */}
            <Card>
              <CardHeader>
                <CardTitle>Retroalimentación Detallada</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2">Fortalezas Identificadas:</h3>
                    <ul className="space-y-1 text-green-800">
                      <li>• Excelente identificación de correos de phishing básicos</li>
                      <li>• Buena comprensión de técnicas de ingeniería social</li>
                      <li>• Respuestas rápidas y precisas en conceptos fundamentales</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-yellow-900 mb-2">Áreas de Mejora:</h3>
                    <ul className="space-y-1 text-yellow-800">
                      <li>• Casos avanzados de spear phishing requieren más práctica</li>
                      <li>• Identificación de URLs maliciosas complejas</li>
                      <li>• Manejo de situaciones de presión temporal</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Achievement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2 text-yellow-600" />
                  Logro Desbloqueado
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Award className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Detector de Phishing</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Completaste tu primera evaluación adaptativa con más del 80% de aciertos
                </p>
              </CardContent>
            </Card>

            

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle>Próximos Pasos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {results.nextSteps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <p className="text-sm text-gray-700">{step}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Link href="/learning/network-security" className="block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Continuar Aprendizaje</Button>
              </Link>
              <Link href="/evaluation" className="block">
                <Button variant="outline" className="w-full bg-transparent">
                  Nueva Evaluación
                </Button>
              </Link>
              <Link href="/progress" className="block">
                <Button variant="outline" className="w-full bg-transparent">
                  Ver Progreso Completo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
