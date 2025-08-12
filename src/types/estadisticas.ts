// Tipos para las respuestas de la API de estadísticas

export interface AdminDashboardStats {
  total_estudiantes: number
  evaluaciones_activas: number
  evaluaciones_completadas: number
  tiempo_actividad_sistema: string
  precision_deteccion_emociones: string
  tiempo_respuesta_ia: string
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
  estudiante: {
    id: number
    nombre: string
    apellido: string
    email: string
  }
  emociones_detectadas: Array<{
    emocion: string
    cantidad: number
    porcentaje: number
  }>
  sesiones_analizadas: number
  fecha_primer_analisis: string
  fecha_ultimo_analisis: string
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
