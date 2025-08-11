'use client';

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { FaceLandmarker, FilesetResolver} from '@mediapipe/tasks-vision';

interface EmotionTrackerProps {
  active: boolean;
  topicId: number;
  userId: number;
  tiempoLectura: number; // segundos
  onEmotionChange?: (emotion: string) => void;
}

const EmotionTracker = forwardRef(function EmotionTracker({
  active,
  topicId,
  userId,
  tiempoLectura,
  onEmotionChange,
}: EmotionTrackerProps,ref) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const runningRef = useRef<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Vectores de eventos
  const vectorOjosCerradosRef = useRef<string[]>([]);
  const vectorAnguloCabezaRef = useRef<string[]>([]);
  const inicioAnalisisRef = useRef<Date | null>(null);
  const tiempoTotalRef = useRef<number>(0);
  
  // Estado de los ojos
  const estadoOjosRef = useRef<{ abiertos: boolean; umbralParpadeo: number }>({
    abiertos: true,
    umbralParpadeo: 0.3
  });
  
  // Último ángulo de cabeza
  const ultimoAnguloRef = useRef<{ pitch: number; yaw: number; roll: number } | null>(null);

  const obtenerHoraActual = (): string => {
    return new Date().toLocaleTimeString('es-ES', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  // Detectar parpadeo mejorado
  const detectarParpadeo = (landmarks: any) => {
  if (!landmarks || landmarks.length === 0) return;

  const faceLandmarks = landmarks[0];
  const ojoIzqSuperior = faceLandmarks[145];
  const ojoIzqInferior = faceLandmarks[159];
  const ojoDerSuperior = faceLandmarks[374];
  const ojoDerInferior = faceLandmarks[386];

  if (!ojoIzqSuperior || !ojoIzqInferior || !ojoDerSuperior || !ojoDerInferior) return;

  const distanciaIzq = Math.abs(ojoIzqSuperior.y - ojoIzqInferior.y);
  const distanciaDer = Math.abs(ojoDerSuperior.y - ojoDerInferior.y);
  const promedioDistancia = (distanciaIzq + distanciaDer) / 2;

  const ojosAbiertos = promedioDistancia > estadoOjosRef.current.umbralParpadeo;

  // Detecta solo transición de abierto -> cerrado y evita duplicados en frames consecutivos
  if (estadoOjosRef.current.abiertos && !ojosAbiertos) {
    const horaParpadeo = obtenerHoraActual();
    vectorOjosCerradosRef.current.push(horaParpadeo);
    console.log(`👁️ Parpadeo detectado a las: ${horaParpadeo}`);
  }

  estadoOjosRef.current.abiertos = ojosAbiertos;
};


  // Detectar ángulo excesivo
  const detectarAnguloExcesivo = (pitch: number, yaw: number, roll: number) => {
    const umbralAngulo = 48;
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

  // Enviar con sendBeacon
const enviarAtencion = async () => {
  try {
    const tiempoFinal = inicioAnalisisRef.current
      ? (Date.now() - inicioAnalisisRef.current.getTime()) / 1000
      : tiempoTotalRef.current;

    const datos = {
      tema: topicId,
      Usuario: userId,
      fecha: new Date().toISOString(),
      vectorOjosCerrados: vectorOjosCerradosRef , // <-- aquí
      vectorAnguloCabeza: vectorAnguloCabezaRef,  // <-- y aquí
      tiempoLectura: tiempoFinal,
    };

    console.log("Datos finales a enviar:", datos);

    const response = await fetch("http://localhost:8000/api/ia/atencion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datos),
    });

    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.status}`);
    }

    console.log("✅ Datos enviados correctamente");
  } catch (err) {
    console.error("❌ Error enviando atención:", err);
  }
};
useImperativeHandle(ref, () => ({
    enviarAtencion,
  }));

  // Limpiar recursos
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
      if (inicioAnalisisRef.current) {
        tiempoTotalRef.current = (Date.now() - inicioAnalisisRef.current.getTime()) / 1000;
      }
      limpiarRecursos();
      return;
    }

    limpiarRecursos();
    inicioAnalisisRef.current = new Date();
    vectorOjosCerradosRef.current = [];
    vectorAnguloCabezaRef.current = [];
    tiempoTotalRef.current = 0;
    runningRef.current = true;
    let cancelled = false;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480, facingMode: 'user' } 
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await new Promise<void>((resolve, reject) => {
            if (!videoRef.current) {
              reject(new Error('Video ref no disponible'));
              return;
            }
            videoRef.current.onloadedmetadata = () => {
              videoRef.current!.play().then(resolve).catch(reject);
            };
            setTimeout(() => reject(new Error('Timeout cargando video')), 10000);
          });
        }
      } catch (err) {
        console.error('❌ Error al iniciar cámara:', err);
      }
    }

    async function runFaceMesh() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        if (cancelled) return;

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
        if (cancelled || !faceLandmarkerRef.current) return;

        intervalRef.current = setInterval(async () => {
          if (!runningRef.current || !videoRef.current || !faceLandmarkerRef.current) return;
          const video = videoRef.current;
          if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) return;

          try {
            const results = await faceLandmarkerRef.current.detectForVideo(video, performance.now());
            if (results.faceLandmarks && results.faceLandmarks.length > 0) {
              detectarParpadeo(results.faceLandmarks);
            }
            const matrixData = results.facialTransformationMatrixes?.[0]?.data;
            if (!matrixData) return;
            const [r00, r01, r02, , r10, r11, r12, , r20, r21, r22] = matrixData;
            const pitch = Math.asin(-r21);
            const yaw = Math.atan2(r20, r22);
            const roll = Math.atan2(r01, r11);
            const pitchDeg = pitch * (180 / Math.PI);
            const yawDeg = yaw * (180 / Math.PI);
            const rollDeg = roll * (180 / Math.PI);
            ultimoAnguloRef.current = { pitch: pitchDeg, yaw: yawDeg, roll: rollDeg };
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
        }, 1000 / 24); // 🔹 Subimos a 30 FPS
      } catch (err) {
        console.error('❌ Error inicializando FaceLandmarker:', err);
      }
    }

    startCamera()
      .then(() => { if (!cancelled) return runFaceMesh(); })
      .catch((err) => console.error('❌ Error en inicialización:', err));

    return () => {
      cancelled = true;
      if (inicioAnalisisRef.current) {
        tiempoTotalRef.current = (Date.now() - inicioAnalisisRef.current.getTime()) / 1000;
      }
      limpiarRecursos(); 
    };
  }, [active, topicId, userId]);

  return (
    <div style={{ position: 'relative' }}>
      <video
        ref={videoRef}
        style={{ width: '100%', maxWidth: '600px', borderRadius: '12px', backgroundColor: '#000' }}
        autoPlay
        muted
        playsInline
      />
      <div style={{ 
        position: 'absolute', top: '10px', left: '10px', 
        background: 'rgba(0,0,0,0.7)', color: 'white', padding: '8px',
        borderRadius: '4px', fontSize: '12px'
      }}>
        <div>Activo: {active ? 'Sí' : 'No'}</div>
        <div>Parpadeos: {vectorOjosCerradosRef.current.length}</div>
        <div>Ángulos &gt; 48°: {vectorAnguloCabezaRef.current.length}</div>
        <div>Tiempo: {inicioAnalisisRef.current ? Math.floor((Date.now() - inicioAnalisisRef.current.getTime()) / 1000) : 0}s</div>
      </div>
      
    </div>
  );
});

export default EmotionTracker;
