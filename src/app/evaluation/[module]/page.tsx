"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Shield, ArrowLeft, Camera, Clock, Brain, AlertCircle, CheckCircle, Play, Square } from "lucide-react"
import Link from "next/link"

export default function EvaluationPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState("")
  const [timeRemaining, setTimeRemaining] = useState(120) // 30 minutes
  const [isEvaluationStarted, setIsEvaluationStarted] = useState(false)
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [emotionalState, setEmotionalState] = useState("neutral")

  // Mock questions - in real app, these would come from AI
  const questions = [
    {
      id: 1,
      question: "¿Cuál es la principal característica de un ataque de phishing?",
      options: [
        "Utilizar malware para infectar sistemas",
        "Hacerse pasar por una entidad confiable para obtener información",
        "Atacar directamente los servidores de la empresa",
        "Utilizar fuerza bruta para romper contraseñas",
      ],
      difficulty: "básico",
      correct: 1,
    },
    {
      id: 2,
      question: "¿Qué debes hacer si recibes un correo sospechoso pidiendo información personal?",
      options: [
        "Responder inmediatamente con la información solicitada",
        "Hacer clic en el enlace para verificar si es legítimo",
        "Ignorar el correo y reportarlo como spam",
        "Reenviar el correo a tus contactos para advertirles",
      ],
      difficulty: "básico",
      correct: 2,
    },
    {
      id: 3,
      question: "En un ataque de spear phishing, ¿qué característica lo diferencia del phishing tradicional?",
      options: [
        "Utiliza información específica sobre la víctima",
        "Solo se envía por SMS",
        "No requiere interacción del usuario",
        "Solo afecta a dispositivos móviles",
      ],
      difficulty: "intermedio",
      correct: 0,
    },
  ]

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isEvaluationStarted && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((time) => time - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isEvaluationStarted, timeRemaining])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const startEvaluation = () => {
    setIsEvaluationStarted(true)
    setCameraEnabled(true)
  }

  const finishEvaluation = () => {
    // Process results and redirect
    window.location.href = "/results/phishing"
  }

  const handleAnswerSelect = (value: string) => {
    setSelectedAnswer(value)
  }

  const nextQuestion = () => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = selectedAnswer
    setAnswers(newAnswers)
    setSelectedAnswer("")

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      finishEvaluation()
    }
  }

  if (!isEvaluationStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
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
                <span className="text-xl font-bold text-gray-900">Evaluación Adaptativa</span>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="shadow-lg">
              <CardHeader className="pb-6">
                <CardTitle className="text-3xl text-gray-900">Evaluación: Phishing y Ingeniería Social</CardTitle>
                <p className="text-gray-600 mt-4">
                  Esta evaluación adaptativa ajustará las preguntas según tu desempeño y estado emocional
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="font-semibold text-blue-900">Duración</p>
                    <p className="text-blue-700">30 minutos</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Brain className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="font-semibold text-green-900">Adaptativo</p>
                    <p className="text-green-700">IA personalizada</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Camera className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="font-semibold text-purple-900">Análisis</p>
                    <p className="text-purple-700">Emocional</p>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="text-left">
                      <p className="font-semibold text-yellow-900">Importante:</p>
                      <ul className="text-yellow-800 text-sm mt-2 space-y-1">
                        <li>• Se activará tu cámara para análisis emocional</li>
                        <li>• Las imágenes se eliminan automáticamente tras el análisis</li>
                        <li>• Las preguntas se adaptan a tu nivel y estado emocional</li>
                        <li>• Puedes finalizar la evaluación en cualquier momento</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8" onClick={startEvaluation}>
                    <Play className="h-5 w-5 mr-2" />
                    Iniciar Evaluación
                  </Button>
                  <Link href="/dashboard">
                    <Button size="lg" variant="outline" className="px-8 bg-transparent">
                      Cancelar
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
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
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Evaluación en Progreso</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-gray-600" />
              <span className="font-mono text-lg">{formatTime(timeRemaining)}</span>
            </div>
            <Button variant="destructive" size="sm" onClick={finishEvaluation}>
              <Square className="h-4 w-4 mr-2" />
              Finalizar Evaluación
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Progreso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>
                        Pregunta {currentQuestion + 1} de {questions.length}
                      </span>
                      <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
                    </div>
                    <Progress value={((currentQuestion + 1) / questions.length) * 100} className="h-2" />
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Dificultad actual:</p>
                    <Badge className="mt-1 bg-blue-100 text-blue-800">{questions[currentQuestion].difficulty}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Camera Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Camera className="h-5 w-5 mr-2 text-green-600" />
                  Análisis Emocional
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2 animate-pulse"></div>
                      <p className="text-sm text-gray-600">Analizando...</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Estado actual:</span>
                    <Badge className="bg-green-100 text-green-800">
                      {emotionalState === "neutral" && "Concentrado"}
                      {emotionalState === "happy" && "Confiado"}
                      {emotionalState === "anxious" && "Ansioso"}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500">El sistema adapta las preguntas según tu estado emocional</div>
                </div>
              </CardContent>
            </Card>

            {/* Question Navigation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Navegación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {questions.map((_, index) => (
                    <div
                      key={index}
                      className={`w-8 h-8 rounded flex items-center justify-center text-sm font-medium ${
                        index === currentQuestion
                          ? "bg-blue-600 text-white"
                          : index < currentQuestion
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {index < currentQuestion ? <CheckCircle className="h-4 w-4" /> : index + 1}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Question Area */}
          <div className="lg:col-span-3">
            <Card className="min-h-[500px]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Pregunta {currentQuestion + 1}</CardTitle>
                  <Badge variant="outline">{questions[currentQuestion].difficulty}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-lg text-gray-900 leading-relaxed">{questions[currentQuestion].question}</div>

                <RadioGroup value={selectedAnswer} onValueChange={handleAnswerSelect}>
                  <div className="space-y-4">
                    {questions[currentQuestion].options.map((option, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-gray-700">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>

                <div className="flex justify-between items-center pt-6 border-t">
                  <div className="text-sm text-gray-600">
                    {selectedAnswer && (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Respuesta seleccionada
                      </div>
                    )}
                  </div>

                  <Button onClick={nextQuestion} disabled={!selectedAnswer} className="bg-blue-600 hover:bg-blue-700">
                    {currentQuestion === questions.length - 1 ? "Finalizar" : "Siguiente Pregunta"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
