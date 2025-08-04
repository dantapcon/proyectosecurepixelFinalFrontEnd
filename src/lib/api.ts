// Configuración de la API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const API_ENDPOINTS = {
  // Usuarios
  REGISTER: `${API_BASE_URL}/api/usuarios/register`,
  LOGIN: `${API_BASE_URL}/api/usuarios/login`,
  LOGOUT: `${API_BASE_URL}/api/usuarios/logout`,
  USER_PROFILE: `${API_BASE_URL}/api/usuarios/yo`,
  UPDATE_USER: (userId: number) => `${API_BASE_URL}/api/usuarios/update/${userId}`,
  CHANGE_PASSWORD: (userId: number) => `${API_BASE_URL}/api/usuarios/cambiar-contrasena/${userId}`,
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

  updateUser: async (userId: number, userData: any) => {
    return apiRequest(API_ENDPOINTS.UPDATE_USER(userId), {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
  },

  changePassword: async (userId: number, passwordData: any) => {
    return apiRequest(API_ENDPOINTS.CHANGE_PASSWORD(userId), {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    })
  },
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
