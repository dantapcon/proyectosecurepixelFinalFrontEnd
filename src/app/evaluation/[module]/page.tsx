"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Shield, ArrowLeft, CheckCircle, AlertTriangle, Clock, FileText, Camera, CameraOff } from "lucide-react"
import Link from "next/link"
import { pruebaAPI, emotionAPI } from "@/lib/api"

interface Respuesta {
  id: number
  texto: string
  corecta: boolean
  ia: boolean
}

interface Pregunta {
  id: number
  texto: string
  respuestas: Respuesta[]
}

interface Prueba {
  id: number
  tema: number
  dificultad: number
  preguntas: Pregunta[]
}

export default function EvaluationPage() {
  const params = useParams()
  const router = useRouter()
  const [prueba, setPrueba] = useState<Prueba | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [respuestasSeleccionadas, setRespuestasSeleccionadas] = useState<{ [preguntaId: number]: number }>({})
  const [tiempoInicio] = useState(Date.now())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [resultados, setResultados] = useState<any>(null)
  
  // Estados para la cámara
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [cameraError, setCameraError] = useState("")
  const [emotionalState, setEmotionalState] = useState("Analizando...")
  const [realEmotions, setRealEmotions] = useState<any>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const emotionIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Cargar la prueba cuando se monta el componente
  useEffect(() => {
    const loadPrueba = async () => {
      if (!params.module) return
      
      setIsLoading(true)
      setError("")
      
      try {
        const temaId = parseInt(params.module as string)
        console.log('Cargando prueba para tema ID:', temaId)
        
        const response = await pruebaAPI.getPruebaByTema(temaId)
        console.log('Respuesta de la prueba:', response)
        
        if (response.ok) {
          setPrueba(response.data)
          console.log('Prueba cargada:', response.data)
          // Activar automáticamente la cámara cuando se carga la prueba
          setTimeout(() => {
            startCamera()
          }, 1000) // Pequeño delay para asegurar que el componente esté montado
        } else {
          setError('Error al cargar la evaluación')
          console.error('Error al cargar prueba:', response)
        }
      } catch (error) {
        console.error('Error de conexión:', error)
        setError('Error de conexión al servidor')
      } finally {
        setIsLoading(false)
      }
    }

    loadPrueba()
  }, [params.module])

  // Limpiar recursos cuando el componente se desmonta
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop())
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (emotionIntervalRef.current) {
        clearInterval(emotionIntervalRef.current)
      }
    }
  }, [cameraStream])

  // Función para capturar frame del video y convertirlo a base64
  const captureFrame = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) return null

    // Configurar canvas a 240x240
    canvas.width = 240
    canvas.height = 240

    // Calcular dimensiones para mantener aspect ratio y centrar
    const videoAspect = video.videoWidth / video.videoHeight
    let sourceWidth = video.videoWidth
    let sourceHeight = video.videoHeight
    let sourceX = 0
    let sourceY = 0

    if (videoAspect > 1) {
      // Video es más ancho que alto
      sourceWidth = video.videoHeight
      sourceX = (video.videoWidth - sourceWidth) / 2
    } else {
      // Video es más alto que ancho
      sourceHeight = video.videoWidth
      sourceY = (video.videoHeight - sourceHeight) / 2
    }

    // Dibujar el frame en el canvas
    ctx.drawImage(
      video,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, 240, 240
    )

    // Convertir a base64
    return canvas.toDataURL('image/jpeg', 0.8)
  }

  // Función para procesar imagen con el backend
  const processEmotionAnalysis = async () => {
    const base64Image = captureFrame()
    if (!base64Image) return

    try {
      console.log('Enviando imagen para análisis de emociones...')
      const response = await emotionAPI.processImage(base64Image)
      
      if (response.ok) {
        console.log('Análisis de emociones recibido:', response.data)
        setRealEmotions(response.data)
        setEmotionalState(response.data.emocion_predicha || "Analizando...")
      } else {
        console.error('Error en análisis de emociones:', response)
      }
    } catch (error) {
      console.error('Error al procesar análisis de emociones:', error)
    }
  }

  // Función para iniciar la cámara
  const startCamera = async () => {
    try {
      setCameraError("")
      console.log('Solicitando acceso a la cámara...')
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: false 
      })
      
      console.log('Cámara activada exitosamente')
      setCameraStream(stream)
      setCameraEnabled(true)
      
      // Asignar el stream al elemento video
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      
      // Esperar un momento para que el video esté listo
      setTimeout(() => {
        // Iniciar análisis de emociones cada 3 segundos
        emotionIntervalRef.current = setInterval(() => {
          processEmotionAnalysis()
        }, 3000)
        
        // Primera captura después de 2 segundos
        setTimeout(() => {
          processEmotionAnalysis()
        }, 2000)
      }, 1000)
      
    } catch (err) {
      console.error('Error al acceder a la cámara:', err)
      setCameraError('No se pudo acceder a la cámara. Verifica los permisos.')
      setCameraEnabled(false)
    }
  }

  // Función para detener la cámara (solo cuando se sale del componente)
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    
    if (emotionIntervalRef.current) {
      clearInterval(emotionIntervalRef.current)
      emotionIntervalRef.current = null
    }
    
    setCameraEnabled(false)
    setEmotionalState("Sesión finalizada")
    console.log('Cámara desactivada - fin de sesión')
  }

  // Funciones para manejar las respuestas
  const handleRespuestaChange = (preguntaId: number, respuestaId: number) => {
    setRespuestasSeleccionadas(prev => ({
      ...prev,
      [preguntaId]: respuestaId
    }))
  }

  // Función para enviar las respuestas
  const handleSubmit = async () => {
    if (!prueba) return

    // Verificar que todas las preguntas tengan respuesta
    const preguntasSinResponder = prueba.preguntas.filter(p => !respuestasSeleccionadas[p.id])
    if (preguntasSinResponder.length > 0) {
      alert(`Faltan ${preguntasSinResponder.length} preguntas por responder`)
      return
    }

    setIsSubmitting(true)
    
    try {
      const tiempoTotal = Math.round((Date.now() - tiempoInicio) / 1000)
      
      const response = await pruebaAPI.responderPrueba(prueba.id, {
        respuestas: Object.entries(respuestasSeleccionadas).map(([preguntaId, respuestaId]) => ({
          pregunta_id: parseInt(preguntaId),
          respuesta_id: respuestaId
        })),
        tiempo_total: tiempoTotal
      })

      if (response.ok) {
        setResultados(response.data)
        setShowResults(true)
        // Detener la cámara al finalizar la evaluación
        stopCamera()
      } else {
        alert('Error al enviar las respuestas')
      }
    } catch (error) {
      console.error('Error al enviar respuestas:', error)
      alert('Error de conexión al enviar las respuestas')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Pantalla de carga
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando evaluación...</p>
        </div>
      </div>
    )
  }

  // Pantalla de error
  if (error || !prueba) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error || 'Evaluación no encontrada'}</p>
          <Button onClick={() => router.push('/dashboard')}>
            Volver al Dashboard
          </Button>
        </div>
      </div>
    )
  }

  // Pantalla de resultados
  if (showResults && resultados) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <header className="bg-white border-b shadow-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">Resultados de Evaluación</span>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Completada
            </Badge>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-green-600">¡Evaluación Completada!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {resultados.respuestas_correctas || 0}/{prueba?.preguntas.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Respuestas Correctas</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {resultados.calificacion || 0}
                  </div>
                  <div className="text-sm text-gray-600">Calificación</div>
                </div>
              </div>

              <div className="text-center space-y-4">
                <p className="text-gray-600">
                  {resultados.aprobado 
                    ? "¡Felicitaciones! Has aprobado la evaluación." 
                    : "No has alcanzado la calificación mínima. Te recomendamos revisar el tema nuevamente."
                  }
                </p>
                
                <div className="flex justify-center space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/dashboard')}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver al Dashboard
                  </Button>
                  
                  {!resultados.aprobado && (
                    <Button
                      onClick={() => router.push(`/learning/${params.module}`)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Revisar Tema
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Pantalla principal de evaluación
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
              <span className="text-xl font-bold text-gray-900">Evaluación en Progreso</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {cameraEnabled ? (
                <Badge className="bg-green-100 text-green-800">
                  <Camera className="h-3 w-3 mr-1" />
                  Cámara Activa
                </Badge>
              ) : (
                <Badge className="bg-yellow-100 text-yellow-800">
                  <Camera className="h-3 w-3 mr-1" />
                  Activando Cámara...
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Camera Status */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  {cameraEnabled ? (
                    <Camera className="h-5 w-5 mr-2 text-green-600" />
                  ) : (
                    <CameraOff className="h-5 w-5 mr-2 text-gray-400" />
                  )}
                  Estado de Cámara
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Canvas oculto para captura de frames */}
                  <canvas 
                    ref={canvasRef} 
                    style={{ display: 'none' }} 
                    width={240} 
                    height={240}
                  />
                  
                  {/* Video preview */}
                  <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden relative">
                    {cameraEnabled && cameraStream ? (
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <Camera className="h-12 w-12 text-blue-400 mx-auto mb-2 animate-pulse" />
                          <p className="text-sm text-gray-600 font-medium">
                            Iniciando cámara...
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Para monitorear la evaluación
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Camera error */}
                  {cameraError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-xs">
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        {cameraError}
                      </div>
                      <p className="mt-1 text-xs">
                        Actualiza la página y permite el acceso a la cámara.
                      </p>
                    </div>
                  )}
                  
                  {/* Emotional state */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Estado emocional:</span>
                    <Badge className={`${
                      cameraEnabled 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {emotionalState}
                    </Badge>
                  </div>

                  {/* Análisis detallado de emociones */}
                  {realEmotions && realEmotions.emociones && (
                    <div className="text-xs">
                      <p className="font-medium text-gray-700 mb-2">Análisis IA:</p>
                      <div className="space-y-1 max-h-24 overflow-y-auto">
                        {realEmotions.emociones.slice(0, 3).map((emocion: any, index: number) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-gray-600">{emocion[0]}</span>
                            <span className="text-gray-800 font-medium">{emocion[1].toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Status info */}
                  <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded border">
                    <div className="flex items-start space-x-2">
                      <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-blue-800 mb-1">Monitoreo de Evaluación</p>
                        <p>La cámara permanecerá activa durante toda la evaluación para garantizar la integridad del proceso.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="min-h-[600px]">
              <CardHeader>
                <CardTitle className="text-2xl">Evaluación</CardTitle>
                <p className="text-gray-600">
                  Responde todas las preguntas y haz clic en "Enviar Evaluación" al finalizar.
                </p>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Preguntas */}
                <div className="space-y-6">
                  {prueba.preguntas.map((pregunta, index) => (
                    <div key={pregunta.id} className="border rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        {index + 1}. {pregunta.texto}
                      </h3>
                      
                      <RadioGroup 
                        value={respuestasSeleccionadas[pregunta.id]?.toString() || ""} 
                        onValueChange={(value) => handleRespuestaChange(pregunta.id, parseInt(value))}
                      >
                        <div className="space-y-3">
                          {pregunta.respuestas.map((respuesta) => (
                            <div 
                              key={respuesta.id} 
                              className="flex items-center space-x-3 p-3 border rounded hover:bg-gray-50 transition-colors"
                            >
                              <RadioGroupItem value={respuesta.id.toString()} id={`respuesta-${respuesta.id}`} />
                              <Label 
                                htmlFor={`respuesta-${respuesta.id}`} 
                                className="flex-1 cursor-pointer text-gray-700"
                              >
                                {respuesta.texto}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>
                  ))}
                </div>

                {/* Botón de envío */}
                <div className="flex justify-between items-center pt-6 border-t">
                  <div className="text-sm text-gray-600">
                    Preguntas respondidas: {Object.keys(respuestasSeleccionadas).length}/{prueba.preguntas.length}
                  </div>
                  
                  <Button 
                    onClick={handleSubmit}
                    disabled={isSubmitting || Object.keys(respuestasSeleccionadas).length !== prueba.preguntas.length}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Enviar Evaluación
                      </>
                    )}
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
