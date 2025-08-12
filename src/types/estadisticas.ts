// Tipos para las respuestas de la API de estadísticas

export interface AdminDashboardStats {
  n_usuarios: number
  n_pruebas_no_completadas: number
  n_pruebas_completadas: number
  uptime: string
  nota_promedio: string // Promedio sobre 20, se mostrará como string
  n_cursos: string // Se usa como tiempo de respuesta de IA
}

export interface ReporteEstadisticasGenerales {
  total_usuarios: number
  total_cursos: number
  total_evaluaciones: number
  promedio_calificaciones: number
  estudiantes_activos_ultimo_mes: number
  profesores_activos: number
}

export interface ReporteAtencionEstudiantes {
  estudiantes: Array<{
    id: number
    nombre: string
    apellido: string
    email: string
    nivel_atencion_promedio: number
    sesiones_totales: number
    ultima_sesion: string
  }>
  promedio_general_atencion: number
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
