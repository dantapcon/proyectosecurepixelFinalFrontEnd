"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Camera,
  CameraOff,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { topicAPI, pruebaAPI } from "@/lib/api";
import EmotionTracker from "@/components/EmotionTracker";

interface Topic {
  id: number;
  titulo: string;
  contenido: string;
  contenido_formateado: string;
  curso: number;
  orden: number;
}

export default function LearningModulePage() {
  const params = useParams();
  const router = useRouter();

  const [topic, setTopic] = useState<Topic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [emotionalState, setEmotionalState] = useState("Analizando...");
  const [tiempoLectura, setTiempoLectura] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Cargar el tema cuando se monta el componente
  useEffect(() => {
    const loadTopic = async () => {
      if (!params.module) return;

      setIsLoading(true);
      setError("");
      setCameraError("");
      setCameraEnabled(false);
      setEmotionalState("Analizando...");
      setTiempoLectura(0);

      try {
        const topicId = parseInt(params.module as string);
        console.log("Cargando tema con ID:", topicId);

        const response = await topicAPI.getTopic(topicId);
        console.log("Respuesta del tema:", response);

        if (response.ok) {
          setTopic(response.data);
          console.log("Tema cargado:", response.data);

          // Esperar un pequeño delay y activar cámara
          setTimeout(() => {
            startCamera();
          }, 1000);
        } else {
          setError("Error al cargar el tema");
          console.error("Error al cargar tema:", response);
        }
      } catch (error) {
        console.error("Error de conexión:", error);
        setError("Error de conexión al servidor");
      } finally {
        setIsLoading(false);
      }
    };

    loadTopic();
  }, [params.module]);

  // Limpiar recursos cuando el componente se desmonta o cambia el stream
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Función para iniciar la cámara
  const startCamera = async () => {
    try {
      setCameraError("");
      console.log("Solicitando acceso a la cámara...");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      console.log("Cámara activada exitosamente");
      setCameraStream(stream);
      setCameraEnabled(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Simular análisis de emociones cada 3 segundos
      intervalRef.current = setInterval(() => {
        const emotions = ["Concentrado", "Curioso", "Interesado", "Reflexivo", "Atento"];
        const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
        setEmotionalState(randomEmotion);
      }, 3000);

      // Iniciar contador de tiempo de lectura
      setTiempoLectura(0);
      timerRef.current = setInterval(() => {
        setTiempoLectura((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error al acceder a la cámara:", err);
      setCameraError("No se pudo acceder a la cámara. Verifica los permisos.");
      setCameraEnabled(false);
    }
  };

  // Función para detener la cámara y limpiar intervalos
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setCameraEnabled(false);
    setEmotionalState("Sesión finalizada");
    console.log("Cámara desactivada - fin de sesión");
  };

  // Manejo para volver al dashboard
  const handleReturnToDashboard = () => {
    stopCamera();
    setTimeout(() => {
      router.push("/dashboard");
    }, 100);
  };
  const emotionTrackerRef = useRef(null);
  // Manejo para ir a evaluación, crea prueba y redirige
  const handleGoToEvaluation = async () => {
    stopCamera();
    console.log('Ref actual:', emotionTrackerRef.current);
    if (emotionTrackerRef.current) {
      emotionTrackerRef.current.enviarAtencion();
    }
    try {
      if (!topic) return;
      // Crear prueba vía API
      const res = await pruebaAPI.createPrueba({ tema_id: topic.id });
      if (!res.ok) throw new Error("No se pudo crear la prueba");
      router.push(`/evaluation/${res.data.id}`);
    } catch (e) {
      alert("Error al crear la prueba");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tema...</p>
        </div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error || "Tema no encontrado"}</p>
          <Button onClick={handleReturnToDashboard}>Volver al Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" legacyBehavior>
              <a>
                <Button variant="outline" size="sm" onClick={handleReturnToDashboard}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </a>
            </Link>
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">{topic.titulo}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Tema {topic.orden}
            </Badge>
            <div className="flex items-center space-x-2">
              {cameraEnabled ? (
                <Badge className="bg-green-100 text-green-800">
                  <Camera className="h-3 w-3 mr-1" />
                  Cámara Activa
                </Badge>
              ) : (
                <Badge className="bg-yellow-100 text-yellow-800">
                  <CameraOff className="h-3 w-3 mr-1" />
                  {cameraError ? "Error Cámara" : "Cámara Desactivada"}
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
                          <p className="text-sm text-gray-600 font-medium">Iniciando cámara...</p>
                          <p className="text-xs text-gray-500 mt-1">Para continuar con el tema</p>
                        </div>
                      </div>
                    )}

                    {/* EmotionTracker solo si cámara está activada */}
                    {cameraEnabled && topic && (
                      <div className="absolute inset-0">
                        <EmotionTracker
                          ref={emotionTrackerRef}  
                          active={cameraEnabled}
                          topicId={topic.id}
                          userId={1} // Cambiar según contexto real fcvbfcb gvbfcgvbfcfcgv
                          tiempoLectura={tiempoLectura}
                          onEmotionChange={(emotion) => setEmotionalState(emotion)}
                        />
                      </div>
                    )}
                  </div>

                  {cameraError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-xs">
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        {cameraError}
                      </div>
                      <p className="mt-1 text-xs">
                        Actualiza la página y permite el acceso a la cámara para continuar.
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Estado emocional:</span>
                    <Badge
                      className={`${
                        cameraEnabled
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {emotionalState}
                    </Badge>
                  </div>

                  <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded border">
                    <div className="flex items-start space-x-2">
                      <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-blue-800 mb-1">Monitoreo de Aprendizaje</p>
                        <p>
                          La cámara permanecerá activa durante todo el tema para analizar tu atención
                          y mejorar la experiencia de aprendizaje.
                        </p>
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
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">{topic.titulo}</CardTitle>
                  <Badge variant="outline">
                    <BookOpen className="h-4 w-4 mr-1" />
                    Tema
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Contenido del tema en HTML */}
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: topic.contenido_formateado }}
                />

                {/* Navigation */}
                <div className="flex justify-between items-center pt-6 border-t">
                  <Button variant="outline" onClick={handleReturnToDashboard}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver al Dashboard
                  </Button>

                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={handleGoToEvaluation}
                  >
                    Tomar Evaluación
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
