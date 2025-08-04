// Configuración de la API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const API_ENDPOINTS = {
  // Usuarios
  REGISTER: `${API_BASE_URL}/api/usuarios/register`,
  LOGIN: `${API_BASE_URL}/api/usuarios/login`,
  LOGOUT: `${API_BASE_URL}/api/usuarios/logout`,
  USER_PROFILE: `${API_BASE_URL}/api/usuarios/yo`,
  UPDATE_USER: `${API_BASE_URL}/api/usuarios/update`,
  CHANGE_PASSWORD: `${API_BASE_URL}/api/usuarios/cambiar-contrasena`,
  USERS_LIST: `${API_BASE_URL}/api/usuarios/usuarios`,
  
  // Enseñanza y preguntas (para futuras implementaciones)
  TEACHING: `${API_BASE_URL}/api/ensennanza/`,
  QUESTIONS: `${API_BASE_URL}/api/preguntas/`,
}

// Función helper para hacer peticiones
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Token ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  try {
    console.log('Making request to:', endpoint, 'with options:', defaultOptions)
    const response = await fetch(endpoint, defaultOptions)
    
    let data;
    try {
      data = await response.json()
    } catch (e) {
      // Si no es JSON válido, usar el texto de respuesta
      data = { message: await response.text() }
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
    const token = localStorage.getItem('token')
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
}

// Función helper para determinar la ruta de redirección según el tipo de usuario
export function getRedirectPath(user: any): string {
  console.log('Usuario para redirección:', user) // Para debug - puedes ver la estructura del usuario
  
  // Verificar si es administrador (is_staff o is_superuser)
  if (user.is_staff || user.is_superuser) {
    return '/admin'
  }
  
  // Verificar si es profesor 
  // AJUSTA ESTA LÓGICA según tu modelo de usuario:
  // - Si tienes un campo user_type: user.user_type === 'teacher'
  // - Si tienes un campo is_teacher: user.is_teacher
  // - Si tienes grupos: user.groups?.includes('teacher')
  // - Si tienes roles: user.role === 'teacher'
  if (user.user_type === 'teacher' || user.is_teacher || user.groups?.includes('teacher')) {
    return '/teacher'
  }
  
  // Por defecto, es estudiante
  return '/dashboard'
}
