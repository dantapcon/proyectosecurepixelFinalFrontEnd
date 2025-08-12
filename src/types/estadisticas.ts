// Tipos para las respuestas de la API de estadísticas

export interface AdminDashboardStats {
  n_usuarios: number
  n_pruebas_no_completadas: number
  n_pruebas_completadas: number
  uptime: string
  nota_promedio: string // Promedio sobre 20, se mostrará como string
  n_cursos: string // Se usa como tiempo de respuesta de IA
}

export interface EstadisticasGlobales {
  n_estudiantes: number
  promedio_general: number
  n_lecciones: number
  tiempo_promedio_estudio: number
}

export interface EstadisticasPorEntidad {
  [key: string]: EstadisticasGlobales
}

export interface ReporteEstadisticasGenerales {
  estadisticas_globale: EstadisticasGlobales
  estadisticas_por_curso: EstadisticasPorEntidad
  estadisticas_por_profesor: EstadisticasPorEntidad
}

export interface ReporteAtencionEstudiantes {
  atencion: Array<{
    tema: string
    fecha: string
    vectorOjosCerados: string[]
    vectorAnguloCabeza: string[]
    tiempoLectura: number
  }>
  emociones: Array<{
    emociones: { [key: string]: number }
    emocionPredominante: string
    numImgProsesadas: number
  }>
}

export interface ReporteEmocionesEstudiante {
  emociones_porcentaje: {
    happy: number
    sad: number
    neutral: number
    angry: number
    fear: number
    contempt?: number
    disgust?: number
    surprise?: number
  }
  promedios_calificaciones: {
    happy: number
    sad: number
    neutral: number
    angry: number
    fear: number
    contempt?: number
    disgust?: number
    surprise?: number
  }
}

export interface ProfesorDashboardStats {
  total_estudiantes: number
  estudiantes_activos: number
  evaluaciones_completadas: number
  puntaje_promedio: number
  tiempo_promedio: string
  estudiantes_en_riesgo: number
  cursos_asignados: number
  temas_creados: number
}
