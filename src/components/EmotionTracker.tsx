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
  
  // Vectores de eventos - MODIFICADO: ahora guardamos timestamps exactos
  const vectorOjosCerradosRef = useRef<string[]>([]);
  const vectorAnguloCabezaRef = useRef<string[]>([]);
  const inicioAnalisisRef = useRef<Date | null>(null);
  const tiempoTotalRef = useRef<number>(0);
  
  // Estado mejorado de los ojos con calibración automática
  const estadoOjosRef = useRef<{ 
    abiertos: boolean; 
    umbralParpadeo: number;
    historialEAR: number[];
    calibrando: boolean;
    umbralAdaptativo: number;
  }>({
    abiertos: true,
    umbralParpadeo: 0.25,
    historialEAR: [],
    calibrando: true,
    umbralAdaptativo: 0.20
  });
  
  // Último ángulo de cabeza
  const ultimoAnguloRef = useRef<{ pitch: number; yaw: number; roll: number } | null>(null);

  // FUNCIÓN MODIFICADA: Formato específico H:M:S:MS
  const obtenerHoraActual = (): string => {
    const now = new Date();
    const horas = now.getHours();
    const minutos = now.getMinutes();
    const segundos = now.getSeconds();
    const milisegundos = Math.floor(now.getMilliseconds() / 10); // Solo 2 dígitos de ms
    
    // Formato: H:M:S:MS (sin ceros a la izquierda como pediste)
    return `${horas}:${minutos}:${segundos}:${milisegundos.toString().padStart(2, '0')}`;
  };

  // NUEVA FUNCIÓN: Obtener tiempo relativo desde el inicio
  const obtenerTiempoRelativo = (): string => {
    if (!inicioAnalisisRef.current) return "0:0:0:00";
    
    const transcurrido = Date.now() - inicioAnalisisRef.current.getTime();
    const horas = Math.floor(transcurrido / 3600000);
    const minutos = Math.floor((transcurrido % 3600000) / 60000);
    const segundos = Math.floor((transcurrido % 60000) / 1000);
    const centisegundos = Math.floor((transcurrido % 1000) / 10);
    
    return `${horas}:${minutos}:${segundos}:${centisegundos.toString().padStart(2, '0')}`;
  };

  // Calcular EAR (Eye Aspect Ratio) - Método más robusto
  const calcularEAR = (landmarks: any) => {
    if (!landmarks || landmarks.length === 0) return null;

    const faceLandmarks = landmarks[0];
    
    // Puntos del ojo izquierdo (6 puntos)
    const ojoIzq = [
      faceLandmarks[33],  // esquina externa
      faceLandmarks[160], // punto superior 1
      faceLandmarks[158], // punto superior 2  
      faceLandmarks[133], // esquina interna
      faceLandmarks[153], // punto inferior 2
      faceLandmarks[144]  // punto inferior 1
    ];
    
    // Puntos del ojo derecho (6 puntos)
    const ojoDer = [
      faceLandmarks[362], // esquina externa
      faceLandmarks[385], // punto superior 1
      faceLandmarks[387], // punto superior 2
      faceLandmarks[263], // esquina interna  
      faceLandmarks[373], // punto inferior 2
      faceLandmarks[380]  // punto inferior 1
    ];

    // Verificar que todos los puntos existen
    const puntosValidos = [...ojoIzq, ...ojoDer].every(punto => punto && punto.x !== undefined && punto.y !== undefined);
    if (!puntosValidos) {
      console.log("❌ Algunos landmarks de ojos no están disponibles");
      return null;
    }

    // Calcular EAR para ojo izquierdo
    const earIzq = calcularEARPorOjo(ojoIzq);
    // Calcular EAR para ojo derecho  
    const earDer = calcularEARPorOjo(ojoDer);

    // Promedio de ambos ojos
    return (earIzq + earDer) / 2;
  };

  const calcularEARPorOjo = (puntosOjo: any[]) => {
    // Distancias verticales
    const vertical1 = Math.sqrt(
      Math.pow(puntosOjo[1].x - puntosOjo[5].x, 2) + 
      Math.pow(puntosOjo[1].y - puntosOjo[5].y, 2)
    );
    const vertical2 = Math.sqrt(
      Math.pow(puntosOjo[2].x - puntosOjo[4].x, 2) + 
      Math.pow(puntosOjo[2].y - puntosOjo[4].y, 2)
    );
    
    // Distancia horizontal
    const horizontal = Math.sqrt(
      Math.pow(puntosOjo[0].x - puntosOjo[3].x, 2) + 
      Math.pow(puntosOjo[0].y - puntosOjo[3].y, 2)
    );
    
    return (vertical1 + vertical2) / (2 * horizontal);
  };

  // Calibración automática del umbral
  const calibrarUmbral = (ear: number) => {
    if (!estadoOjosRef.current.calibrando) return;
    
    estadoOjosRef.current.historialEAR.push(ear);
    
    // Después de 60 muestras (aproximadamente 2-3 segundos), calcular umbral
    if (estadoOjosRef.current.historialEAR.length >= 60) {
      const promedioEAR = estadoOjosRef.current.historialEAR.reduce((a, b) => a + b, 0) / estadoOjosRef.current.historialEAR.length;
      // El umbral es aproximadamente 70% del EAR promedio cuando los ojos están abiertos
      estadoOjosRef.current.umbralAdaptativo = promedioEAR * 0.7;
      estadoOjosRef.current.calibrando = false;
      console.log(`🔧 Calibración completada. EAR promedio: ${promedioEAR.toFixed(4)}, Umbral: ${estadoOjosRef.current.umbralAdaptativo.toFixed(4)}`);
    }
  };

  // FUNCIÓN MODIFICADA: Detectar parpadeo con timestamp preciso
  const detectarParpadeo = (landmarks: any) => {
    const ear = calcularEAR(landmarks);
    if (ear === null) return;

    // Fase de calibración
    if (estadoOjosRef.current.calibrando) {
      calibrarUmbral(ear);
      return;
    }

    const umbralActual = estadoOjosRef.current.umbralAdaptativo;
    const ojosAbiertos = ear > umbralActual;

    // 🔍 DEBUG: Log detallado (puedes comentar después de calibrar)
    console.log(`👁️ EAR: ${ear.toFixed(4)}, Umbral: ${umbralActual.toFixed(4)}, Ojos: ${ojosAbiertos ? 'ABIERTOS' : 'CERRADOS'}`);

    // Detecta transición de abierto -> cerrado (parpadeo)
    if (estadoOjosRef.current.abiertos && !ojosAbiertos) {
      // MODIFICADO: Guardamos tanto hora absoluta como tiempo relativo
      const horaAbsoluta = obtenerHoraActual();
      const tiempoRelativo = obtenerTiempoRelativo();
      
      // Puedes elegir cuál usar: hora absoluta o tiempo relativo desde el inicio
      vectorOjosCerradosRef.current.push(tiempoRelativo); // Usando tiempo relativo
      
      console.log(`👁️ ¡PARPADEO DETECTADO!`);
      console.log(`   Hora absoluta: ${horaAbsoluta}`);
      console.log(`   Tiempo relativo: ${tiempoRelativo}`);
      console.log(`   EAR: ${ear.toFixed(4)}`);
      console.log(`   Total parpadeos: ${vectorOjosCerradosRef.current.length}`);
    }

    estadoOjosRef.current.abiertos = ojosAbiertos;
  };

  // Detectar ángulo excesivo (SIN timestamps - solo conteo)
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

  // FUNCIÓN MODIFICADA: Enviar con datos mejorados
  const enviarAtencion = async () => {
    try {
      const tiempoFinal = inicioAnalisisRef.current
        ? (Date.now() - inicioAnalisisRef.current.getTime()) / 1000
        : tiempoTotalRef.current;
      console.log(vectorOjosCerradosRef.current);
      console.log(vectorAnguloCabezaRef.current);
      const vectorOjosCerrados = [...vectorOjosCerradosRef.current];
      const vectorAnguloCabeza = [...vectorAnguloCabezaRef.current];

      console.log(vectorOjosCerrados);
      console.log(vectorAnguloCabeza);
      const datos = {
        tema: topicId,
        Usuario: userId,
        fecha: new Date().toISOString(),
        // SOLO vectorOjosCerrados tiene timestamps, vectorAnguloCabeza sigue igual
        vectorOjosCerados: vectorOjosCerrados,
        vectorAnguloCabeza: vectorAnguloCabeza,
        tiempoLectura: tiempoFinal,
        
      };

      console.log("📊 DATOS FINALES A ENVIAR:");
      console.log("Vector de parpadeos (con timestamps):", vectorOjosCerradosRef.current);
      console.log("Vector de ángulos excesivos (solo conteo):", vectorAnguloCabezaRef.current);
      console.log("Total parpadeos:", vectorOjosCerradosRef.current.length);
      console.log("Tiempo total:", tiempoFinal, "segundos");

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
    
    // Reiniciar calibración
    estadoOjosRef.current = {
      abiertos: true,
      umbralParpadeo: 0.25,
      historialEAR: [],
      calibrando: true,
      umbralAdaptativo: 0.20
    };
    
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

        // Aumentamos a 60 FPS para mejor detección de parpadeos
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

            if (onEmotionChange && !estadoOjosRef.current.calibrando) {
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
        }, 1000 / 60); // 60 FPS para mejor detección
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
        borderRadius: '4px', fontSize: '12px', minWidth: '200px'
      }}>
        <div>Activo: {active ? 'Sí' : 'No'}</div>
        <div>Estado: {estadoOjosRef.current.calibrando ? '🔧 Calibrando...' : '✅ Detectando'}</div>
        <div>Parpadeos: {vectorOjosCerradosRef.current.length}</div>
        <div>Ángulos &gt; 48°: {vectorAnguloCabezaRef.current.length}</div>
        <div>Tiempo: {inicioAnalisisRef.current ? obtenerTiempoRelativo() : '0:0:0:00'}</div>
        <div>Umbral EAR: {estadoOjosRef.current.umbralAdaptativo.toFixed(4)}</div>
        {/* AGREGADO: Mostrar últimos parpadeos */}
        {vectorOjosCerradosRef.current.length > 0 && (
          <div style={{ marginTop: '5px', fontSize: '10px' }}>
            <div>Últimos parpadeos:</div>
            {vectorOjosCerradosRef.current.slice(-3).map((tiempo, index) => (
              <div key={index} style={{ color: '#90EE90' }}>• {tiempo}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export default EmotionTracker;