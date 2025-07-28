"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Shield, ArrowLeft, ArrowRight, BookOpen, Camera, Play, CheckCircle, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function LearningModulePage() {
  const [currentLesson, setCurrentLesson] = useState(0)
  const [cameraEnabled, setCameraEnabled] = useState(true)

  const lessons = [
    {
      title: "¿Qué es el Phishing?",
      content:
        "El phishing es una técnica de ingeniería social utilizada para obtener información confidencial de forma fraudulenta...",
      type: "theory",
    },
    {
      title: "Tipos de Ataques de Phishing",
      content: "Existen varios tipos de ataques de phishing, cada uno con características específicas...",
      type: "theory",
    },
    {
      title: "Identificación de Correos Maliciosos",
      content: "Aprende a identificar las señales de alerta en correos electrónicos sospechosos...",
      type: "interactive",
    },
    {
      title: "Casos Prácticos",
      content: "Analiza estos casos reales de intentos de phishing...",
      type: "practice",
    },
  ]

  const toggleCamera = () => {
    setCameraEnabled(!cameraEnabled)
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
              <span className="text-xl font-bold text-gray-900">Phishing y Ingeniería Social</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Módulo 3
            </Badge>
            <Button
              variant={cameraEnabled ? "default" : "outline"}
              size="sm"
              onClick={toggleCamera}
              className={cameraEnabled ? "bg-green-600 hover:bg-green-700" : ""}
            >
              <Camera className="h-4 w-4 mr-2" />
              {cameraEnabled ? "Cámara Activa" : "Activar Cámara"}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Lesson Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Lecciones</CardTitle>
                <Progress value={((currentLesson + 1) / lessons.length) * 100} className="h-2" />
                <p className="text-sm text-gray-600">
                  {currentLesson + 1} de {lessons.length} lecciones
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                {lessons.map((lesson, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      index === currentLesson
                        ? "bg-blue-100 border-blue-300 border"
                        : index < currentLesson
                          ? "bg-green-50 hover:bg-green-100"
                          : "bg-gray-50 hover:bg-gray-100"
                    }`}
                    onClick={() => setCurrentLesson(index)}
                  >
                    <div className="flex items-center space-x-2">
                      {index < currentLesson ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : index === currentLesson ? (
                        <Play className="h-4 w-4 text-blue-600" />
                      ) : (
                        <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />
                      )}
                      <span
                        className={`text-sm ${
                          index === currentLesson ? "font-semibold text-blue-900" : "text-gray-700"
                        }`}
                      >
                        {lesson.title}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Camera Status */}
            {cameraEnabled && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Camera className="h-5 w-5 mr-2 text-green-600" />
                    Estado de Cámara
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Vista previa de cámara</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Estado emocional:</span>
                      <Badge className="bg-green-100 text-green-800">Concentrado</Badge>
                    </div>
                    <div className="text-xs text-gray-500">
                      La cámara analiza tu estado emocional para adaptar el contenido
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="min-h-[600px]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">{lessons[currentLesson].title}</CardTitle>
                  <Badge variant="outline">
                    {lessons[currentLesson].type === "theory" && <BookOpen className="h-4 w-4 mr-1" />}
                    {lessons[currentLesson].type === "interactive" && <Play className="h-4 w-4 mr-1" />}
                    {lessons[currentLesson].type === "practice" && <AlertTriangle className="h-4 w-4 mr-1" />}
                    {lessons[currentLesson].type.charAt(0).toUpperCase() + lessons[currentLesson].type.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">{lessons[currentLesson].content}</p>
                </div>

                {/* Interactive Content Based on Lesson Type */}
                {lessons[currentLesson].type === "theory" && (
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-3">Puntos Clave:</h3>
                    <ul className="space-y-2 text-blue-800">
                      <li>• Los atacantes se hacen pasar por entidades confiables</li>
                      <li>• Buscan obtener información personal o financiera</li>
                      <li>• Utilizan técnicas de persuasión psicológica</li>
                      <li>• Pueden llegar por email, SMS, llamadas o sitios web</li>
                    </ul>
                  </div>
                )}

                {lessons[currentLesson].type === "interactive" && (
                  <div className="bg-yellow-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-yellow-900 mb-3">Ejercicio Interactivo:</h3>
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded border">
                        <p className="text-sm text-gray-600 mb-2">Ejemplo de correo sospechoso:</p>
                        <div className="bg-gray-100 p-3 rounded text-sm">
                          <p>
                            <strong>De:</strong> seguridad@bancoxyz.com
                          </p>
                          <p>
                            <strong>Asunto:</strong> URGENTE: Verificar su cuenta
                          </p>
                          <p className="mt-2">Su cuenta será suspendida. Haga clic aquí para verificar...</p>
                        </div>
                      </div>
                      <Button className="bg-yellow-600 hover:bg-yellow-700">Analizar Correo</Button>
                    </div>
                  </div>
                )}

                {lessons[currentLesson].type === "practice" && (
                  <div className="bg-red-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-red-900 mb-3">Caso Práctico:</h3>
                    <div className="space-y-4">
                      <p className="text-red-800">Analiza este caso real y identifica las señales de alerta...</p>
                      <Button className="bg-red-600 hover:bg-red-700">Comenzar Análisis</Button>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between items-center pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentLesson(Math.max(0, currentLesson - 1))}
                    disabled={currentLesson === 0}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Anterior
                  </Button>

                  <div className="flex space-x-2">
                    {currentLesson === lessons.length - 1 ? (
                      <Link href="/evaluation/phishing">
                        <Button className="bg-green-600 hover:bg-green-700">
                          Ir a Evaluación
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    ) : (
                      <Button onClick={() => setCurrentLesson(Math.min(lessons.length - 1, currentLesson + 1))}>
                        Siguiente
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
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
