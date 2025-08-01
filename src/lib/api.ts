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
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(endpoint, defaultOptions)
    const data = await response.json()
    
    return {
      ok: response.ok,
      status: response.status,
      data,
    }
  } catch (error) {
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
    return apiRequest(API_ENDPOINTS.LOGOUT, {
      method: 'POST',
    })
  },

  getCurrentUser: async () => {
    return apiRequest(API_ENDPOINTS.USER_PROFILE, {
      method: 'GET',
    })
  },
}
