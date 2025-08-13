// Configuración de la API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Importar tipos
import type { 
  AdminDashboardStats, 
  ReporteEstadisticasGenerales, 
  ReporteAtencionEstudiantes, 
  ReporteEmocionesEstudiante, 
  ProfesorDashboardStats 
} from '@/types/estadisticas'


//comentario prueva
export const API_ENDPOINTS = {
  // Usuarios
  REGISTER: `${API_BASE_URL}/api/usuarios/register`,
  LOGIN: `${API_BASE_URL}/api/usuarios/login`,
  LOGOUT: `${API_BASE_URL}/api/usuarios/logout`,
  USER_PROFILE: `${API_BASE_URL}/api/usuarios/yo`,
  UPDATE_USER: (userId: number) => `${API_BASE_URL}/api/usuarios/update/${userId}`,
  CHANGE_PASSWORD: (userId: number) => `${API_BASE_URL}/api/usuarios/cambiar-contrasena/${userId}`,
  USERS_LIST: `${API_BASE_URL}/api/usuarios/usuarios`,
  
  // Cursos
  COURSES_LIST: `${API_BASE_URL}/api/ensennanza/cursos/`,
  COURSE_DETAIL: (courseId: number) => `${API_BASE_URL}/api/ensennanza/cursos/${courseId}/`,
  
  // Temas
  TOPICS_LIST: `${API_BASE_URL}/api/ensennanza/temas/`,
  TOPIC_DETAIL: (topicId: number) => `${API_BASE_URL}/api/ensennanza/temas/${topicId}/`,
  NEXT_TOPIC: `${API_BASE_URL}/api/ensennanza/temas/siguiente/`,
  
  // Pruebas/Evaluaciones
  CREATE_PRUEBA: `${API_BASE_URL}/api/preguntas/crear-prueba/`,
  GET_PRUEBA: (pruebaId: number) => `${API_BASE_URL}/api/preguntas/prueba/${pruebaId}/`,
  RESPOND_PRUEBA: (pruebaId: number) => `${API_BASE_URL}/api/preguntas/prueba/${pruebaId}/responder/`,
  LIST_PRUEBAS: `${API_BASE_URL}/api/preguntas/listar-pruebas/`,
  PRUEBA_DETAIL: (pruebaId: number) => `${API_BASE_URL}/api/preguntas/detalle-prueba/${pruebaId}/`,
  
  // Análisis de emociones
  ATENCION: `${API_BASE_URL}/api/ia/atencion`,
  EMOCIONES: (pruebaId: number) =>`${API_BASE_URL}/api/ia/emociones/${pruebaId}/`,
  
  // Estadísticas
  ADMIN_DASHBOARD_STATS: `${API_BASE_URL}/api/estadisticas/admin-dashboard`,
  REPORTE_ESTADISTICAS_GENERALES: `${API_BASE_URL}/api/estadisticas/reporte-estadisticas-generales`,
  REPORTE_ATENCION_ESTUDIANTES: (studentId: number) => `${API_BASE_URL}/api/estadisticas/reporte-atencion-estudiantes/${studentId}`,
  REPORTE_EMOCIONES_ESTUDIANTE: `${API_BASE_URL}/api/estadisticas/reporte-emociones-estudiante`,
  PROFESOR_DASHBOARD_STATS: `${API_BASE_URL}/api/estadisticas/profesor-dashboard`,
  
  // Enseñanza y preguntas (para futuras implementaciones)
  TEACHING: `${API_BASE_URL}/api/ensennanza/`,
  QUESTIONS: `${API_BASE_URL}/api/preguntas/`,
}

// Función helper para hacer peticiones
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  
  // Log para debugging - solo mostrar si hay token
  if (token) {
    console.log('Making authenticated request to:', endpoint)
  } else {
    console.log('Making unauthenticated request to:', endpoint)
  }
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Token ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  try {
    console.log('Request headers:', defaultOptions.headers)
    const response = await fetch(endpoint, defaultOptions)
    
    // Verificar si la respuesta es 401 (No autorizado)
    if (response.status === 401) {
      console.error('Authentication failed - Token may be invalid or expired')
      // Limpiar el token inválido
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
      }
      return {
        ok: false,
        status: 401,
        data: { message: 'Token de autenticación inválido o expirado' },
      }
    }
    
    let data;
    
    // Clonar la respuesta ANTES de leer el stream para poder leerla múltiples veces si es necesario
    const responseClone = response.clone()
    
    // Verificar si hay contenido para leer
    const contentType = response.headers.get('content-type')
    const hasContent = response.status !== 204 && response.status !== 205
    
    if (hasContent) {
      try {
        // Intentar leer como JSON primero
        data = await response.json()
      } catch (e) {
        try {
          // Si falla el JSON, leer como texto usando el clon
          const textData = await responseClone.text()
          data = { message: textData || 'Respuesta vacía' }
        } catch (e2) {
          data = { message: 'Respuesta no válida' }
        }
      }
    } else {
      // Respuesta sin contenido (como DELETE exitoso con status 204)
      data = { message: 'Operación completada exitosamente' }
    }
    
    console.log('Response status:', response.status, 'Data:', data)
    
    return {
      ok: response.ok,
      status: response.status,
      data,
    }
  } catch (error) {
    console.error('Request error:', error)
    return {
      ok: false,
      status: 0,
      data: { message: 'Error de conexión' },
    }
  }
}

// Funciones específicas para la API de usuarios
export const userAPI = {
  register: async (userData: {
    first_name: string
    last_name: string
    username: string
    email: string
    password: string
    password_confirm: string
  }) => {
    return apiRequest(API_ENDPOINTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  },

  login: async (credentials: { username: string; password: string }) => {
    return apiRequest(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  },

  logout: async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    console.log('Attempting logout with token:', token ? 'Token found' : 'No token found')
    
    // Intentar con diferentes formatos de autenticación
    const response = await apiRequest(API_ENDPOINTS.LOGOUT, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      }
    })
    
    console.log('Logout response:', response)
    return response
  },

  getCurrentUser: async () => {
    return apiRequest(API_ENDPOINTS.USER_PROFILE, {
      method: 'GET',
    })
  },

  getAllUsers: async () => {
    return apiRequest(API_ENDPOINTS.USERS_LIST, {
      method: 'GET',
    })
  },

  updateUser: async (userId: number, userData: any) => {
    return apiRequest(API_ENDPOINTS.UPDATE_USER(userId), {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
  },

  changePassword: async (userId: number, nuevaContrasena: string) => {
    return apiRequest(API_ENDPOINTS.CHANGE_PASSWORD(userId), {
      method: 'PUT',
      body: JSON.stringify({
        nueva_contrasena: nuevaContrasena
      }),
    })
  },
}

// API para Cursos
export const courseAPI = {
  // Listar todos los cursos
  getAllCourses: async () => {
    return apiRequest(API_ENDPOINTS.COURSES_LIST, {
      method: 'GET',
    })
  },

  // Crear nuevo curso
  createCourse: async (courseData: any) => {
    return apiRequest(API_ENDPOINTS.COURSES_LIST, {
      method: 'POST',
      body: JSON.stringify(courseData),
    })
  },

  // Obtener curso específico
  getCourse: async (courseId: number) => {
    return apiRequest(API_ENDPOINTS.COURSE_DETAIL(courseId), {
      method: 'GET',
    })
  },

  // Actualizar curso
  updateCourse: async (courseId: number, courseData: any) => {
    return apiRequest(API_ENDPOINTS.COURSE_DETAIL(courseId), {
      method: 'PUT',
      body: JSON.stringify(courseData),
    })
  },

  // Eliminar curso
  deleteCourse: async (courseId: number) => {
    return apiRequest(API_ENDPOINTS.COURSE_DETAIL(courseId), {
      method: 'DELETE',
    })
  },
}

// API para Temas
export const topicAPI = {
  // Listar todos los temas
  getAllTopics: async () => {
    return apiRequest(API_ENDPOINTS.TOPICS_LIST, {
      method: 'GET',
    })
  },

  // Crear nuevo tema
  createTopic: async (topicData: any) => {
    return apiRequest(API_ENDPOINTS.TOPICS_LIST, {
      method: 'POST',
      body: JSON.stringify(topicData),
    })
  },

  // Obtener tema específico
  getTopic: async (topicId: number) => {
    return apiRequest(API_ENDPOINTS.TOPIC_DETAIL(topicId), {
      method: 'GET',
    })
  },

  // Actualizar tema
  updateTopic: async (topicId: number, topicData: any) => {
    return apiRequest(API_ENDPOINTS.TOPIC_DETAIL(topicId), {
      method: 'PUT',
      body: JSON.stringify(topicData),
    })
  },

  // Eliminar tema
  deleteTopic: async (topicId: number) => {
    return apiRequest(API_ENDPOINTS.TOPIC_DETAIL(topicId), {
      method: 'DELETE',
    })
  },

  // Obtener siguiente tema
  getNextTopic: async () => {
    return apiRequest(API_ENDPOINTS.NEXT_TOPIC, {
      method: 'GET',
    })
  },
}

// API para Pruebas/Evaluaciones
export const pruebaAPI = {
  // Crear nueva prueba
  createPrueba: async (pruebaData: any) => {
    return apiRequest(API_ENDPOINTS.CREATE_PRUEBA, {
      method: 'POST',
      body: JSON.stringify(pruebaData),
    })
  },

  // Obtener prueba con preguntas por ID de tema
  getPruebaByTema: async (temaId: number) => {
    return apiRequest(API_ENDPOINTS.GET_PRUEBA(temaId), {
      method: 'GET',
    })
  },

  // Responder prueba
  responderPrueba: async (pruebaId: number, respuestas: any) => {
    return apiRequest(API_ENDPOINTS.RESPOND_PRUEBA(pruebaId), {
      method: 'POST',
      body: JSON.stringify(respuestas),
    })
  },

  // Listar todas las pruebas
  getAllPruebas: async () => {
    return apiRequest(API_ENDPOINTS.LIST_PRUEBAS, {
      method: 'GET',
    })
  },

  // Obtener detalle de prueba
  getPruebaDetail: async (pruebaId: number) => {
    return apiRequest(API_ENDPOINTS.PRUEBA_DETAIL(pruebaId), {
      method: 'GET',
    })
  },
}

// API de análisis de emociones
export const emotionAPI = {
  // Procesar imagen para análisis de emociones
  processImage: async (base64Image: string,pruebaId: number) => {
    return apiRequest(API_ENDPOINTS.EMOCIONES(pruebaId), {
      method: 'POST',
      body: JSON.stringify({
        image: base64Image
      }),
    })
  },

  // Análisis de atención
  analyzeAttention: async (data: any) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      console.error('No token found for attention analysis request')
      return {
        ok: false,
        status: 401,
        data: { message: 'Token de autenticación requerido' }
      }
    }
    
    console.log('📊 Enviando datos de atención:', data)
    
    const response = await apiRequest(API_ENDPOINTS.ATENCION, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    console.log('✅ Respuesta de análisis de atención:', response)
    return response
  },
}

// API de estadísticas
export const estadisticasAPI = {
  // Dashboard de administrador
  getAdminDashboardStats: async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      console.error('No token found for admin dashboard stats request')
      return {
        ok: false,
        status: 401,
        data: { message: 'Token de autenticación requerido' }
      }
    }
    
    console.log('Calling admin dashboard stats endpoint:', API_ENDPOINTS.ADMIN_DASHBOARD_STATS)
    console.log('Token being used:', token ? 'Present' : 'Missing')
    
    const response = await apiRequest(API_ENDPOINTS.ADMIN_DASHBOARD_STATS, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
    })
    
    console.log('Admin dashboard stats response:', response)
    return response
  },

  // Reporte de estadísticas generales
  getReporteEstadisticasGenerales: async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      console.error('No token found for general stats request')
      return {
        ok: false,
        status: 401,
        data: { message: 'Token de autenticación requerido' }
      }
    }
    
    return apiRequest(API_ENDPOINTS.REPORTE_ESTADISTICAS_GENERALES, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
    })
  },

  // Reporte de atención de estudiantes (requiere ID del estudiante)
  getReporteAtencionEstudiantes: async (studentId: number) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      console.error('No token found for attention report request')
      return {
        ok: false,
        status: 401,
        data: { message: 'Token de autenticación requerido' }
      }
    }
    
    if (!studentId || studentId <= 0) {
      console.error('Invalid student ID provided for attention report:', studentId)
      return {
        ok: false,
        status: 400,
        data: { message: 'ID de estudiante requerido para el reporte de atención' }
      }
    }
    
    return apiRequest(API_ENDPOINTS.REPORTE_ATENCION_ESTUDIANTES(studentId), {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
    })
  },

  // Reporte de emociones de estudiante (no requiere ID en URL)
  getReporteEmocionesEstudiante: async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      console.error('No token found for student emotions request')
      return {
        ok: false,
        status: 401,
        data: { message: 'Token de autenticación requerido' }
      }
    }
    
    return apiRequest(API_ENDPOINTS.REPORTE_EMOCIONES_ESTUDIANTE, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
    })
  },

  // Dashboard de profesor
  getProfesorDashboardStats: async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      console.error('No token found for teacher dashboard stats request')
      return {
        ok: false,
        status: 401,
        data: { message: 'Token de autenticación requerido' }
      }
    }
    
    return apiRequest(API_ENDPOINTS.PROFESOR_DASHBOARD_STATS, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
    })
  },
}

// Función helper para verificar autenticación
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  const token = localStorage.getItem('token')
  return !!token
}

// Función helper para obtener el token
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

// Función helper para limpiar el token
export function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token')
  }
}

// Función helper para determinar la ruta de redirección según el tipo de usuario
export function getRedirectPath(user: any): string {
  console.log('Usuario para redirección:', user) // Para debug - puedes ver la estructura del usuario
  
  // Usar el campo tipo_usuario del backend Django
  if (user.tipo_usuario === 'administrador') {
    return '/admin'
  }
  
  if (user.tipo_usuario === 'profesor') {
    return '/teacher'
  }
  
  // Por defecto, es estudiante (tipo_usuario === 'alumno')
  return '/dashboard'
}
