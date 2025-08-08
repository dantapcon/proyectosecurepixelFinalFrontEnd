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
  const ultimoAnguloRef = useRef<{ pitch: number; yaw: number; roll: number } | null>(null);

  // Enviar con sendBeacon (al desmontar)
  const enviarAtencionBeacon = () => {
    try {
      const datos = {
        tema: topicId,
        usuario: userId,
        fecha: new Date().toISOString(),
        vectorOjosCerados: null,
        vectorAnguloCabeza: ultimoAnguloRef.current,
        tiempoLectura,
      };
      const blob = new Blob([JSON.stringify(datos)], { type: 'application/json' });
      const sent = navigator.sendBeacon('http://localhost:8090/api/ia/atencion', blob);
      if (sent) console.log('✅ Atención enviada con sendBeacon');
      else console.warn('⚠️ sendBeacon no pudo enviar los datos');
    } catch (err) {
      console.error('❌ Error enviando atención con sendBeacon:', err);
    }
  };

  // Enviar con fetch + keepalive (respaldo para unload)
  const enviarAtencionFetchKeepalive = () => {
    try {
      const datos = {
        tema: topicId,
        usuario: userId,
        fecha: new Date().toISOString(),
        vectorOjosCerados: null,
        vectorAnguloCabeza: ultimoAnguloRef.current,
        tiempoLectura,
      };

      fetch('http://localhost:8090/api/ia/atencion', {
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

  useEffect(() => {
    if (!active) {
      // Solo limpiar y detener, NO enviar aquí para evitar dobles envíos
      runningRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (faceLandmarkerRef.current) {
        faceLandmarkerRef.current.close();
        faceLandmarkerRef.current = null;
      }
      return;
    }

    runningRef.current = true;
    let cancelled = false;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await new Promise<void>((resolve) => {
            videoRef.current!.onloadedmetadata = () => {
              videoRef.current!.play();
              resolve();
            };
          });
        }
      } catch (err) {
        console.error('Error al iniciar cámara:', err);
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
          if (!runningRef.current || !videoRef.current) return;
          const video = videoRef.current;
          if (video.readyState < 2 || video.videoWidth === 0) return;

          try {
            const results = await faceLandmarkerRef.current.detectForVideo(video, performance.now());
            const matrixData = results.facialTransformationMatrixes?.[0]?.data;
            if (!matrixData) return;

            const [r00, r01, r02, , r10, r11, r12, , r20, r21, r22] = matrixData;

            const pitch = Math.asin(-r21);
            const yaw = Math.atan2(r20, r22);
            const roll = Math.atan2(r01, r11);

            ultimoAnguloRef.current = {
              pitch: pitch * (180 / Math.PI),
              yaw: yaw * (180 / Math.PI),
              roll: roll * (180 / Math.PI),
            };

            if (onEmotionChange) {
              const umbral = 20;
              const concentrado =
                Math.abs(ultimoAnguloRef.current.pitch) <= umbral &&
                Math.abs(ultimoAnguloRef.current.yaw) <= umbral &&
                Math.abs(ultimoAnguloRef.current.roll) <= umbral;
              onEmotionChange(concentrado ? '🟢 Concentrado' : '🟠 No Concentrado');
            }
          } catch (err) {
            console.error('Error en detectForVideo:', err);
          }
        }, 1000 / 24);
      } catch (err) {
        console.error('Error inicializando FaceLandmarker:', err);
      }
    }

    startCamera().then(() => {
      if (!cancelled) runFaceMesh();
    });

    return () => {
      cancelled = true;
      runningRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (faceLandmarkerRef.current) {
        faceLandmarkerRef.current.close();
        faceLandmarkerRef.current = null;
      }
      // Enviar datos en desmontaje: primero sendBeacon, luego fetch (respaldo)
      enviarAtencionBeacon();
      enviarAtencionFetchKeepalive();
    };
  }, [active]);

  return (
    <div style={{ position: 'relative' }}>
      <video
        ref={videoRef}
        style={{ width: '100%', maxWidth: '600px', borderRadius: '12px' }}
        autoPlay
        muted
        playsInline
      />
    </div>
  );
}
