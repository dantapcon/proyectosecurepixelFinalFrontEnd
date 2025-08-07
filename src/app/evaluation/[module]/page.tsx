"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Shield, ArrowLeft, CheckCircle, AlertTriangle, Clock, FileText } from "lucide-react"
import Link from "next/link"
import { pruebaAPI } from "@/lib/api"

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

  // Manejar selección de respuesta
  const handleRespuestaChange = (preguntaId: number, respuestaId: number) => {
    setRespuestasSeleccionadas(prev => ({
      ...prev,
      [preguntaId]: respuestaId
    }))
  }

  // Enviar evaluación
  const handleSubmitEvaluacion = async () => {
    if (!prueba) return

    // Verificar que todas las preguntas estén respondidas
    const preguntasSinResponder = prueba.preguntas.filter(p => !respuestasSeleccionadas[p.id])
    if (preguntasSinResponder.length > 0) {
      setError(`Por favor responde todas las preguntas. Faltan ${preguntasSinResponder.length} pregunta(s).`)
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const tiempoTotal = Math.round((Date.now() - tiempoInicio) / 1000) // en segundos
      
      const respuestasEnvio = {
        respuestas: Object.entries(respuestasSeleccionadas).map(([preguntaId, respuestaId]) => ({
          pregunta_id: parseInt(preguntaId),
          respuesta_id: respuestaId
        })),
        tiempo_total: tiempoTotal
      }

      console.log('Enviando respuestas:', respuestasEnvio)
      
      const response = await pruebaAPI.responderPrueba(prueba.id, respuestasEnvio)
      console.log('Respuesta del servidor:', response)
      
      if (response.ok) {
        setResultados(response.data)
        setShowResults(true)
      } else {
        setError('Error al enviar la evaluación')
        console.error('Error al enviar evaluación:', response)
      }
    } catch (error) {
      console.error('Error al enviar evaluación:', error)
      setError('Error de conexión al enviar la evaluación')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calcular tiempo transcurrido
  const getTiempoTranscurrido = () => {
    const tiempoTranscurrido = Math.round((Date.now() - tiempoInicio) / 1000)
    const minutos = Math.floor(tiempoTranscurrido / 60)
    const segundos = tiempoTranscurrido % 60
    return `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`
  }

  // Actualizar el tiempo cada segundo
  useEffect(() => {
    if (showResults) return
    
    const interval = setInterval(() => {
      // Force re-render to update time display
      setError(prev => prev) // Trigger re-render for time update
    }, 1000)

    return () => clearInterval(interval)
  }, [showResults])

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

  if (error && !prueba) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/dashboard')}>
            Volver al Dashboard
          </Button>
        </div>
      </div>
    )
  }

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

  if (!prueba) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No se encontró evaluación para este tema</p>
          <Button onClick={() => router.push('/dashboard')}>
            Volver al Dashboard
          </Button>
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
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Evaluación</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <FileText className="h-3 w-3 mr-1" />
              {prueba?.preguntas.length || 0} Preguntas
            </Badge>
            <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
              <Clock className="h-3 w-3 mr-1" />
              {getTiempoTranscurrido()}
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Evaluación del Tema</CardTitle>
            <p className="text-gray-600">
              Responde todas las preguntas y presiona "Enviar Evaluación" cuando termines.
            </p>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  {error}
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-8">
            {prueba?.preguntas.map((pregunta: Pregunta, index: number) => (
              <div key={pregunta.id} className="border-b pb-6 last:border-b-0">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {index + 1}. {pregunta.texto}
                  </h3>
                </div>

                <RadioGroup
                  value={respuestasSeleccionadas[pregunta.id]?.toString() || ""}
                  onValueChange={(value) => handleRespuestaChange(pregunta.id, parseInt(value))}
                >
                  <div className="space-y-3">
                    {pregunta.respuestas.map((respuesta: Respuesta) => (
                      <div key={respuesta.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <RadioGroupItem value={respuesta.id.toString()} id={`respuesta-${respuesta.id}`} />
                        <Label 
                          htmlFor={`respuesta-${respuesta.id}`} 
                          className="flex-1 cursor-pointer text-gray-700 leading-relaxed"
                        >
                          {respuesta.texto}
                          {respuesta.ia && (
                            <Badge variant="outline" className="ml-2 text-xs bg-purple-50 text-purple-600 border-purple-200">
                              IA
                            </Badge>
                          )}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            )) || []}

            {/* Botones de navegación */}
            <div className="flex justify-between items-center pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => router.push(`/learning/${params.module}`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Tema
              </Button>

              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  {Object.keys(respuestasSeleccionadas).length} de {prueba?.preguntas.length || 0} respondidas
                </div>
                <Button
                  onClick={handleSubmitEvaluacion}
                  disabled={isSubmitting || Object.keys(respuestasSeleccionadas).length !== (prueba?.preguntas.length || 0)}
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
