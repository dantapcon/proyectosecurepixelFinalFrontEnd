'use client';

import React, { useEffect, useRef } from 'react';
import {
  FaceLandmarker,
  FilesetResolver,
} from '@mediapipe/tasks-vision';

interface EmotionTrackerProps {
  active: boolean;
  topicId: number;
  userId: number;
  tiempoLectura: number; // segundos
  onEmotionChange?: (emotion: string) => void;
}

export default function EmotionTracker({
  active,
  topicId,
  userId,
  tiempoLectura,
  onEmotionChange,
}: EmotionTrackerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const runningRef = useRef<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Referencias para almacenar los vectores de tiempo
  const vectorOjosCerradosRef = useRef<string[]>([]);
  const vectorAnguloCabezaRef = useRef<string[]>([]);
  const inicioAnalisisRef = useRef<Date | null>(null);
  const tiempoTotalRef = useRef<number>(0);
  
  // Para detección de parpadeos
  const estadoOjosRef = useRef<{ abiertos: boolean; umbralParpadeo: number }>({
    abiertos: true,
    umbralParpadeo: 0.3 // Ajusta según necesites
  });
  
  // Última posición de cabeza para comparar
  const ultimoAnguloRef = useRef<{ pitch: number; yaw: number; roll: number } | null>(null);

  // Función para obtener la hora actual como string
  const obtenerHoraActual = (): string => {
    return new Date().toLocaleTimeString('es-ES', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  // Detectar parpadeo basado en la distancia entre párpados
  const detectarParpadeo = (landmarks: any) => {
    if (!landmarks || landmarks.length === 0) return;
    
    const faceLandmarks = landmarks[0];
    
    // Puntos de los ojos (MediaPipe landmarks)
    // Ojo izquierdo: puntos 145, 159 (superior e inferior)
    // Ojo derecho: puntos 374, 386 (superior e inferior)
    const ojoIzqSuperior = faceLandmarks[145];
    const ojoIzqInferior = faceLandmarks[159];
    const ojoDerSuperior = faceLandmarks[374];
    const ojoDerInferior = faceLandmarks[386];
    
    if (!ojoIzqSuperior || !ojoIzqInferior || !ojoDerSuperior || !ojoDerInferior) return;
    
    // Calcular distancia vertical de cada ojo
    const distanciaIzq = Math.abs(ojoIzqSuperior.y - ojoIzqInferior.y);
    const distanciaDer = Math.abs(ojoDerSuperior.y - ojoDerInferior.y);
    
    // Promedio de ambos ojos
    const promedioDistancia = (distanciaIzq + distanciaDer) / 2;
    
    // Detectar cambio de estado (parpadeo)
    const ojosAbiertos = promedioDistancia > estadoOjosRef.current.umbralParpadeo;
    
    // Si cambia de abierto a cerrado, es un parpadeo
    if (estadoOjosRef.current.abiertos && !ojosAbiertos) {
      const horaParpadeo = obtenerHoraActual();
      vectorOjosCerradosRef.current.push(horaParpadeo);
      console.log(`👁️ Parpadeo detectado a las: ${horaParpadeo}`);
    }
    
    estadoOjosRef.current.abiertos = ojosAbiertos;
  };

  // Detectar ángulo de cabeza superior a 48 grados
  const detectarAnguloExcesivo = (pitch: number, yaw: number, roll: number) => {
    const umbralAngulo = 48; // grados
    
    const anguloExcesivo = 
      Math.abs(pitch) > umbralAngulo || 
      Math.abs(yaw) > umbralAngulo || 
      Math.abs(roll) > umbralAngulo;
    
    if (anguloExcesivo) {
      const horaAngulo = obtenerHoraActual();
      vectorAnguloCabezaRef.current.push(horaAngulo);
      console.log(`📐 Ángulo excesivo detectado a las: ${horaAngulo} (P:${pitch.toFixed(1)}° Y:${yaw.toFixed(1)}° R:${roll.toFixed(1)}°)`);
    }
  };

  // Enviar con sendBeacon (al desmontar)
  const enviarAtencionBeacon = () => {
    try {
      // Calcular tiempo total de análisis
      const tiempoFinal = inicioAnalisisRef.current 
        ? (Date.now() - inicioAnalisisRef.current.getTime()) / 1000
        : tiempoTotalRef.current;

      const datos = {
        tema: topicId,
        usuario: userId,
        fecha: new Date().toISOString(),
        vectorOjosCerados: vectorOjosCerradosRef.current,
        vectorAnguloCabeza: vectorAnguloCabezaRef.current,
        tiempoLectura: tiempoFinal, // Tiempo real que estuvo la cámara activa
        tiempoAnalisis: tiempoFinal // Tiempo de análisis (igual al tiempo de lectura)
      };
      
      console.log('📊 Datos finales a enviar:', datos);
      
      const blob = new Blob([JSON.stringify(datos)], { type: 'application/json' });
      const sent = navigator.sendBeacon('http://localhost:8000/api/ia/atencion', blob);
      if (sent) console.log('✅ Atención enviada con sendBeacon');
      else console.warn('⚠️ sendBeacon no pudo enviar los datos');
    } catch (err) {
      console.error('❌ Error enviando atención con sendBeacon:', err);
    }
  };

  // Enviar con fetch + keepalive (respaldo para unload)
  const enviarAtencionFetchKeepalive = () => {
    try {
      // Calcular tiempo total de análisis
      const tiempoFinal = inicioAnalisisRef.current 
        ? (Date.now() - inicioAnalisisRef.current.getTime()) / 1000
        : tiempoTotalRef.current;

      const datos = {
        tema: topicId,
        usuario: userId,
        fecha: new Date().toISOString(),
        vectorOjosCerados: vectorOjosCerradosRef.current,
        vectorAnguloCabeza: vectorAnguloCabezaRef.current,
        tiempoLectura: tiempoFinal,
        tiempoAnalisis: tiempoFinal
      };

      fetch('http://localhost:8000/api/ia/atencion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
        keepalive: true, // permite completar la petición al cerrar la página
      })
        .then(() => console.log('✅ Atención enviada con fetch (keepalive)'))
        .catch((err) => console.error('❌ Error enviando atención con fetch:', err));
    } catch (err) {
      console.error('❌ Error preparando fetch:', err);
    }
  };

  // Función separada para limpiar recursos
  const limpiarRecursos = () => {
    runningRef.current = false;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    if (faceLandmarkerRef.current) {
      faceLandmarkerRef.current.close();
      faceLandmarkerRef.current = null;
    }
  };

  useEffect(() => {
    if (!active) {
      // Calcular tiempo total al desactivar
      if (inicioAnalisisRef.current) {
        tiempoTotalRef.current = (Date.now() - inicioAnalisisRef.current.getTime()) / 1000;
      }
      
      limpiarRecursos();
      return;
    }

    // Limpiar recursos previos antes de inicializar nuevos
    limpiarRecursos();
    
    // Inicializar tiempo de análisis
    inicioAnalisisRef.current = new Date();
    vectorOjosCerradosRef.current = [];
    vectorAnguloCabezaRef.current = [];
    tiempoTotalRef.current = 0;
    
    runningRef.current = true;
    let cancelled = false;

    async function startCamera() {
      try {
        console.log('🎥 Iniciando cámara...');
        
        // Solicitar permisos de cámara
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: 640, 
            height: 480, 
            facingMode: 'user' 
          } 
        });
        
        if (cancelled) {
          console.log('⚠️ Cancelando stream porque el componente se desactivó');
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        
        streamRef.current = stream;
        
        if (videoRef.current) {
          console.log('📱 Asignando stream al video element');
          videoRef.current.srcObject = stream;
          
          // Esperar a que el video esté listo
          await new Promise<void>((resolve, reject) => {
            if (!videoRef.current) {
              reject(new Error('Video ref no disponible'));
              return;
            }
            
            const video = videoRef.current;
            
            video.onloadedmetadata = () => {
              console.log('✅ Video metadata cargado');
              video.play()
                .then(() => {
                  console.log('▶️ Video reproduciéndose');
                  resolve();
                })
                .catch((err) => {
                  console.error('❌ Error reproduciendo video:', err);
                  reject(err);
                });
            };
            
            video.onerror = (err) => {
              console.error('❌ Error en video element:', err);
              reject(err);
            };
            
            // Timeout de seguridad
            setTimeout(() => {
              reject(new Error('Timeout cargando video'));
            }, 10000);
          });
        }
        
        console.log('🎬 Cámara iniciada correctamente');
      } catch (err) {
        console.error('❌ Error al iniciar cámara:', err);
        // Intentar mostrar error específico
        if (err instanceof DOMException) {
          if (err.name === 'NotAllowedError') {
            console.error('🚫 Permisos de cámara denegados');
          } else if (err.name === 'NotFoundError') {
            console.error('📹 No se encontró cámara');
          }
        }
      }
    }

    async function runFaceMesh() {
      try {
        console.log('🧠 Inicializando Face Landmarker...');
        
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        
        if (cancelled) {
          console.log('⚠️ Cancelando Face Landmarker porque el componente se desactivó');
          return;
        }

        faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          },
          runningMode: 'VIDEO',
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: true,
          numFaces: 1,
        });

        if (cancelled || !faceLandmarkerRef.current) {
          console.log('⚠️ Face Landmarker cancelado o no inicializado');
          return;
        }

        console.log('✅ Face Landmarker inicializado, comenzando detección...');

        intervalRef.current = setInterval(async () => {
          if (!runningRef.current || !videoRef.current || !faceLandmarkerRef.current) {
            return;
          }
          
          const video = videoRef.current;
          
          // Verificar que el video esté listo
          if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
            return;
          }

          try {
            const results = await faceLandmarkerRef.current.detectForVideo(video, performance.now());
            
            // Detectar parpadeos usando landmarks
            if (results.faceLandmarks && results.faceLandmarks.length > 0) {
              detectarParpadeo(results.faceLandmarks);
            }
            
            // Procesar matriz de transformación para ángulos de cabeza
            const matrixData = results.facialTransformationMatrixes?.[0]?.data;
            if (!matrixData) return;

            const [r00, r01, r02, , r10, r11, r12, , r20, r21, r22] = matrixData;

            const pitch = Math.asin(-r21);
            const yaw = Math.atan2(r20, r22);
            const roll = Math.atan2(r01, r11);

            const pitchDeg = pitch * (180 / Math.PI);
            const yawDeg = yaw * (180 / Math.PI);
            const rollDeg = roll * (180 / Math.PI);

            ultimoAnguloRef.current = {
              pitch: pitchDeg,
              yaw: yawDeg,
              roll: rollDeg,
            };

            // Detectar ángulos excesivos
            detectarAnguloExcesivo(pitchDeg, yawDeg, rollDeg);

            if (onEmotionChange) {
              const umbral = 20;
              const concentrado =
                Math.abs(pitchDeg) <= umbral &&
                Math.abs(yawDeg) <= umbral &&
                Math.abs(rollDeg) <= umbral;
              
              onEmotionChange(
                concentrado 
                  ? `🟢 Concentrado (P:${pitchDeg.toFixed(1)}° Y:${yawDeg.toFixed(1)}° R:${rollDeg.toFixed(1)}°)` 
                  : `🟠 No Concentrado (P:${pitchDeg.toFixed(1)}° Y:${yawDeg.toFixed(1)}° R:${rollDeg.toFixed(1)}°)`
              );
            }
          } catch (err) {
            console.error('❌ Error en detectForVideo:', err);
          }
        }, 1000 / 24); // 24 FPS
        
      } catch (err) {
        console.error('❌ Error inicializando FaceLandmarker:', err);
      }
    }

    // Inicializar cámara primero, luego Face Landmarker
    startCamera()
      .then(() => {
        if (!cancelled) {
          return runFaceMesh();
        }
      })
      .catch((err) => {
        console.error('❌ Error en inicialización:', err);
      });

    return () => {
      console.log('🧹 Limpiando componente EmotionTracker...');
      cancelled = true;
      
      // Calcular tiempo total final
      if (inicioAnalisisRef.current) {
        tiempoTotalRef.current = (Date.now() - inicioAnalisisRef.current.getTime()) / 1000;
      }
      
      limpiarRecursos();
      
      // Enviar datos en desmontaje: primero sendBeacon, luego fetch (respaldo)
      enviarAtencionBeacon();
      enviarAtencionFetchKeepalive();
    };
  }, [active, topicId, userId]);

  return (
    <div style={{ position: 'relative' }}>
      <video
        ref={videoRef}
        style={{ 
          width: '100%', 
          maxWidth: '600px', 
          borderRadius: '12px',
          backgroundColor: '#000' // Para ver si el elemento está ahí
        }}
        autoPlay
        muted
        playsInline
      />
      {/* Debug info - puedes remover esto en producción */}
      <div style={{ 
        position: 'absolute', 
        top: '10px', 
        left: '10px', 
        background: 'rgba(0,0,0,0.7)', 
        color: 'white', 
        padding: '8px',
        borderRadius: '4px',
        fontSize: '12px'
      }}>
        <div>Activo: {active ? 'Sí' : 'No'}</div>
        <div>Parpadeos: {vectorOjosCerradosRef.current.length}</div>
        <div>Ángulos &gt; 48°: {vectorAnguloCabezaRef.current.length}</div>
        <div>Tiempo: {inicioAnalisisRef.current ? Math.floor((Date.now() - inicioAnalisisRef.current.getTime()) / 1000) : 0}s</div>
      </div>
    </div>
  );
}