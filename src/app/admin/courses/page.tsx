"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Shield, Plus, Edit, Trash2, Book, FileText, ArrowLeft, Save, X, RefreshCw } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { courseAPI, topicAPI, userAPI } from "@/lib/api"

// Interfaces
interface Course {
  id: number
  nombreCurso: string
  profesor: number
  dificultadMinima: number
  dificultadMaxima: number
}

interface Topic {
  id: number
  titulo: string
  contenido: string
  curso: number
  orden: number
}

interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  username?: string
  tipo_usuario?: string
  is_staff?: boolean
  is_superuser?: boolean
}

interface CourseForm {
  nombreCurso: string
  profesor: number
  dificultadMinima: number
  dificultadMaxima: number
}

interface TopicForm {
  titulo: string
  contenido: string
  curso: number
  orden: number
}

export default function AdminCoursesPage() {
  // Estados
  const [courses, setCourses] = useState<Course[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [teachers, setTeachers] = useState<User[]>([])
  const [activeTab, setActiveTab] = useState("courses")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  
  // Estados para formularios
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null)
  const [showCourseForm, setShowCourseForm] = useState(false)
  const [showTopicForm, setShowTopicForm] = useState(false)
  
  const [courseForm, setCourseForm] = useState<CourseForm>({
    nombreCurso: "",
    profesor: 0,
    dificultadMinima: 0,
    dificultadMaxima: 10
  })
  
  const [topicForm, setTopicForm] = useState<TopicForm>({
    titulo: "",
    contenido: "",
    curso: 0,
    orden: 0
  })

  const { user, logout } = useAuth()
  const router = useRouter()

  // Verificar autenticación y autorización
  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    
    if (user.tipo_usuario !== 'administrador') {
      router.push('/dashboard')
      return
    }
    
    console.log('Usuario autenticado como administrador, cargando datos...')
    loadInitialData()
  }, [user, router])

  // Cargar datos iniciales
  const loadInitialData = async () => {
    setIsLoading(true)
    setError("")
    try {
      console.log('Cargando datos iniciales...')
      await Promise.all([
        loadCourses(),
        loadTopics(),
        loadTeachers()
      ])
      console.log('Datos iniciales cargados exitosamente')
    } catch (error) {
      console.error('Error loading initial data:', error)
      setError('Error al cargar los datos')
    } finally {
      setIsLoading(false)
    }
  }

  // Función para refrescar todos los datos
  const refreshAllData = async () => {
    console.log('Refrescando todos los datos...')
    await loadInitialData()
  }

  // Cargar cursos
  const loadCourses = async () => {
    try {
      console.log('Cargando cursos...')
      const response = await courseAPI.getAllCourses()
      console.log('Respuesta de cursos:', response)
      
      if (response.ok) {
        console.log('Cursos cargados:', response.data)
        setCourses(Array.isArray(response.data) ? response.data : [])
      } else {
        console.error('Error al cargar cursos:', response)
        setError('Error al cargar cursos')
        setCourses([])
      }
    } catch (error) {
      console.error('Error loading courses:', error)
      setError('Error al cargar cursos')
      setCourses([])
    }
  }

  // Cargar temas
  const loadTopics = async () => {
    try {
      console.log('Cargando temas...')
      const response = await topicAPI.getAllTopics()
      console.log('Respuesta de temas:', response)
      
      if (response.ok) {
        console.log('Temas cargados:', response.data)
        setTopics(Array.isArray(response.data) ? response.data : [])
      } else {
        console.error('Error al cargar temas:', response)
        setError('Error al cargar temas')
        setTopics([])
      }
    } catch (error) {
      console.error('Error loading topics:', error)
      setError('Error al cargar temas')
      setTopics([])
    }
  }

  // Cargar profesores
  const loadTeachers = async () => {
    try {
      const response = await userAPI.getAllUsers()
      console.log('Response de usuarios:', response)
      if (response.ok) {
        console.log('Datos de usuarios:', response.data)
        // Usar la misma lógica que en settings para determinar el tipo de usuario
        const teacherUsers = response.data.filter((user: User) => {
          const userType = getUserType(user)
          console.log(`Usuario ${user.first_name} ${user.last_name} (ID: ${user.id}): tipo = ${userType}`)
          console.log('Datos completos del usuario:', user)
          return userType === 'profesor'
        })
        console.log('Profesores filtrados:', teacherUsers)
        
        // Debug adicional para cada profesor
        teacherUsers.forEach((teacher: User) => {
          console.log(`Profesor ID ${teacher.id}:`, {
            first_name: teacher.first_name,
            last_name: teacher.last_name,
            username: teacher.username,
            email: teacher.email,
            first_name_type: typeof teacher.first_name,
            last_name_type: typeof teacher.last_name,
            username_type: typeof teacher.username
          })
        })
        
        setTeachers(teacherUsers)
      } else {
        setError('Error al cargar profesores')
      }
    } catch (error) {
      console.error('Error loading teachers:', error)
      setError('Error al cargar profesores')
    }
  }

  // Función helper para determinar el tipo de usuario (igual que en settings)
  const getUserType = (user: User): string => {
    if (user.tipo_usuario) {
      return user.tipo_usuario
    }
    // Fallback basado en los campos existentes
    if (user.is_superuser) return 'administrador'
    if (user.is_staff) return 'profesor'
    return 'alumno'
  }

  // Funciones para cursos
  const handleCreateCourse = () => {
    setCourseForm({
      nombreCurso: "",
      profesor: 0,
      dificultadMinima: 0,
      dificultadMaxima: 10
    })
    setEditingCourse(null)
    setShowCourseForm(true)
  }

  const handleEditCourse = (course: Course) => {
    setCourseForm({
      nombreCurso: course.nombreCurso,
      profesor: course.profesor,
      dificultadMinima: course.dificultadMinima,
      dificultadMaxima: course.dificultadMaxima
    })
    setEditingCourse(course)
    setShowCourseForm(true)
  }

  const handleSaveCourse = async () => {
    console.log('handleSaveCourse - courseForm completo:', courseForm)
    console.log('handleSaveCourse - profesor seleccionado:', courseForm.profesor, 'tipo:', typeof courseForm.profesor)
    
    if (!courseForm.nombreCurso || !courseForm.profesor) {
      console.log('Validación falló - nombreCurso:', courseForm.nombreCurso, 'profesor:', courseForm.profesor)
      setError('Por favor complete todos los campos obligatorios')
      return
    }

    if (courseForm.dificultadMinima > courseForm.dificultadMaxima) {
      setError('La dificultad mínima no puede ser mayor que la máxima')
      return
    }

    setIsLoading(true)
    setError("")
    
    try {
      console.log('Guardando curso:', courseForm)
      console.log('Teachers disponibles al guardar:', teachers)
      
      let response
      if (editingCourse) {
        console.log('Actualizando curso existente:', editingCourse.id)
        response = await courseAPI.updateCourse(editingCourse.id, courseForm)
      } else {
        console.log('Creando nuevo curso')
        response = await courseAPI.createCourse(courseForm)
      }

      console.log('Respuesta de guardar curso:', response)

      if (response.ok) {
        console.log('Curso guardado exitosamente, refrescando datos...')
        
        // Recargar cursos y profesores para asegurar datos actualizados
        await Promise.all([
          loadCourses(),
          loadTeachers()
        ])
        
        console.log('Datos refrescados después de guardar')
        
        setShowCourseForm(false)
        setEditingCourse(null)
        setError("")
        
        alert(editingCourse ? 'Curso actualizado exitosamente' : 'Curso creado exitosamente')
      } else {
        console.error('Error al guardar curso:', response)
        setError(`Error al guardar curso: ${response.data?.message || 'Error desconocido'}`)
      }
    } catch (error) {
      console.error('Error saving course:', error)
      setError('Error de conexión al guardar curso')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCourse = async (courseId: number) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este curso? También se eliminarán todos los temas asociados.')) {
      return
    }

    // Prevenir múltiples eliminaciones
    if (isLoading) {
      return
    }

    setIsLoading(true)
    setError("")
    
    try {
      console.log('Eliminando curso con ID:', courseId)
      await courseAPI.deleteCourse(courseId)
      
      console.log('Comando de eliminación enviado, actualizando interfaz...')
      
      // Actualizar el estado local inmediatamente
      setCourses(prevCourses => prevCourses.filter(course => course.id !== courseId))
      setTopics(prevTopics => prevTopics.filter(topic => topic.curso !== courseId))
      
      // Recargar datos después de un breve delay para asegurar sincronización
      setTimeout(() => {
        loadCourses()
        loadTopics()
      }, 500)
      
      setError("")
      alert('Curso eliminado exitosamente')
      
    } catch (error) {
      console.error('Error deleting course:', error)
      // Solo mostrar error si realmente falla la conexión
      // Pero aún así intentar actualizar la interfaz
      setCourses(prevCourses => prevCourses.filter(course => course.id !== courseId))
      setTopics(prevTopics => prevTopics.filter(topic => topic.curso !== courseId))
      
      // Recargar para verificar el estado real
      setTimeout(() => {
        loadCourses()
        loadTopics()
      }, 500)
    } finally {
      setIsLoading(false)
    }
  }

  // Funciones para temas
  const handleCreateTopic = () => {
    setTopicForm({
      titulo: "",
      contenido: "",
      curso: 0,
      orden: topics.length + 1
    })
    setEditingTopic(null)
    setShowTopicForm(true)
  }

  const handleEditTopic = (topic: Topic) => {
    setTopicForm({
      titulo: topic.titulo,
      contenido: topic.contenido,
      curso: topic.curso,
      orden: topic.orden
    })
    setEditingTopic(topic)
    setShowTopicForm(true)
  }

  const handleSaveTopic = async () => {
    if (!topicForm.titulo || !topicForm.contenido || !topicForm.curso) {
      setError('Por favor complete todos los campos obligatorios')
      return
    }

    setIsLoading(true)
    setError("")
    
    try {
      console.log('Guardando tema:', topicForm)
      let response
      if (editingTopic) {
        response = await topicAPI.updateTopic(editingTopic.id, topicForm)
      } else {
        response = await topicAPI.createTopic(topicForm)
      }

      console.log('Respuesta de guardar tema:', response)

      if (response.ok) {
        console.log('Tema guardado exitosamente, refrescando datos...')
        
        // Recargar temas y cerrar formulario
        await loadTopics()
        setShowTopicForm(false)
        setEditingTopic(null)
        setError("")
        
        alert(editingTopic ? 'Tema actualizado exitosamente' : 'Tema creado exitosamente')
      } else {
        console.error('Error al guardar tema:', response)
        setError(`Error al guardar tema: ${response.data?.message || 'Error desconocido'}`)
      }
    } catch (error) {
      console.error('Error saving topic:', error)
      setError('Error de conexión al guardar tema')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTopic = async (topicId: number) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este tema?')) {
      return
    }

    // Prevenir múltiples eliminaciones
    if (isLoading) {
      return
    }

    setIsLoading(true)
    setError("")
    
    try {
      console.log('Eliminando tema con ID:', topicId)
      await topicAPI.deleteTopic(topicId)
      
      console.log('Comando de eliminación enviado, actualizando interfaz...')
      
      // Actualizar el estado local inmediatamente
      setTopics(prevTopics => prevTopics.filter(topic => topic.id !== topicId))
      
      // Recargar datos después de un breve delay para asegurar sincronización
      setTimeout(() => {
        loadTopics()
      }, 500)
      
      setError("")
      alert('Tema eliminado exitosamente')
      
    } catch (error) {
      console.error('Error deleting topic:', error)
      // Solo mostrar error si realmente falla la conexión
      // Pero aún así intentar actualizar la interfaz
      setTopics(prevTopics => prevTopics.filter(topic => topic.id !== topicId))
      
      // Recargar para verificar el estado real
      setTimeout(() => {
        loadTopics()
      }, 500)
    } finally {
      setIsLoading(false)
    }
  }

  // Obtener nombre del profesor
  const getTeacherName = (teacherId: number) => {
    console.log('getTeacherName - teacherId:', teacherId, 'tipo:', typeof teacherId)
    console.log('getTeacherName - teachers disponibles:', teachers)
    console.log('getTeacherName - cantidad de teachers:', teachers.length)
    
    if (!teacherId) {
      console.warn('teacherId no válido:', teacherId)
      return 'Sin profesor asignado'
    }
    
    // Si aún se están cargando los datos
    if (isLoading) {
      return 'Cargando profesor...'
    }
    
    if (!Array.isArray(teachers) || teachers.length === 0) {
      console.warn('Lista de profesores vacía o no válida:', teachers)
      return 'Sin profesores disponibles'
    }
    
    // Convertir a número para asegurar comparación correcta
    const teacherIdNum = Number(teacherId)
    console.log('teacherId convertido a número:', teacherIdNum)
    
    const teacher = teachers.find(t => {
      const tIdNum = Number(t.id)
      console.log('Comparando:', tIdNum, '===', teacherIdNum, '=', tIdNum === teacherIdNum)
      return tIdNum === teacherIdNum
    })
    
    console.log('Profesor encontrado:', teacher)
    
    if (teacher) {
      console.log('Datos del profesor encontrado:', {
        id: teacher.id,
        first_name: teacher.first_name,
        last_name: teacher.last_name,
        username: teacher.username,
        email: teacher.email
      })
      
      // Verificar que tenga nombres válidos
      const firstName = teacher.first_name?.trim() || ''
      const lastName = teacher.last_name?.trim() || ''
      const username = teacher.username?.trim() || ''
      
      if (!firstName && !lastName) {
        console.warn('Profesor sin nombres válidos, usando fallback:', teacher)
        // Usar username como fallback si está disponible
        if (username) {
          return `@${username}`
        }
        // Último recurso: usar email o ID
        return teacher.email || `Usuario ID: ${teacher.id}`
      }
      
      const fullName = `${firstName} ${lastName}`.trim()
      console.log('Nombre completo calculado:', fullName)
      return fullName
    } else {
      console.warn('Profesor no encontrado con ID:', teacherId, 'Profesores disponibles:', teachers.map(t => ({ id: t.id, name: `${t.first_name} ${t.last_name}` })))
      return `Profesor no encontrado (ID: ${teacherId})`
    }
  }

  // Obtener nombre del curso
  const getCourseName = (courseId: number) => {
    const course = courses.find(c => c.id === courseId)
    return course ? course.nombreCurso : 'Curso no encontrado'
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/admin')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Panel
              </Button>
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Cursos</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.first_name} {user?.last_name}
              </span>
              <Button variant="outline" onClick={handleLogout}>
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="courses" className="flex items-center space-x-2">
              <Book className="h-4 w-4" />
              <span>Cursos</span>
            </TabsTrigger>
            <TabsTrigger value="topics" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Temas</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab de Cursos */}
          <TabsContent value="courses" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Gestión de Cursos</h2>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={loadCourses}
                  disabled={isLoading}
                  className="bg-white hover:bg-gray-50"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Actualizar
                </Button>
                <Button onClick={handleCreateCourse} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Curso
                </Button>
              </div>
            </div>

            {/* Formulario de curso */}
            {showCourseForm && (
              <Card className="max-w-4xl mx-auto">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardTitle className="text-xl font-bold text-gray-800">
                    {editingCourse ? '✏️ Editar Curso' : '➕ Nuevo Curso'}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {editingCourse ? 'Modifica los datos del curso existente' : 'Complete la información para crear un nuevo curso'}
                  </p>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Información básica */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">📚 Información del Curso</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <Label htmlFor="nombreCurso" className="text-sm font-medium text-gray-700">
                          Nombre del Curso *
                        </Label>
                        <Input
                          id="nombreCurso"
                          value={courseForm.nombreCurso}
                          onChange={(e) => setCourseForm({...courseForm, nombreCurso: e.target.value})}
                          placeholder="Ej: Introducción a la Ciberseguridad"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <Label htmlFor="profesor" className="text-sm font-medium text-gray-700">
                          Profesor Asignado *
                        </Label>
                        <select
                          id="profesor"
                          value={courseForm.profesor}
                          onChange={(e) => {
                            const selectedValue = parseInt(e.target.value)
                            console.log('Profesor seleccionado - value:', e.target.value, 'parsed:', selectedValue, 'type:', typeof selectedValue)
                            setCourseForm({...courseForm, profesor: selectedValue})
                          }}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value={0}>-- Seleccione un profesor --</option>
                          {teachers.length > 0 ? (
                            teachers.map(teacher => (
                              <option key={teacher.id} value={teacher.id}>
                                👨‍🏫 {teacher.first_name} {teacher.last_name} ({teacher.email})
                              </option>
                            ))
                          ) : (
                            <option disabled>No hay profesores disponibles</option>
                          )}
                        </select>
                        {teachers.length === 0 && (
                          <p className="mt-1 text-sm text-amber-600">
                            ⚠️ No se encontraron profesores. Verifique que existan usuarios con tipo "profesor".
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Configuración de dificultad */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">🎯 Nivel de Dificultad</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="dificultadMinima" className="text-sm font-medium text-gray-700">
                          Dificultad Mínima
                        </Label>
                        <Input
                          id="dificultadMinima"
                          type="number"
                          min="0"
                          max="10"
                          value={courseForm.dificultadMinima}
                          onChange={(e) => setCourseForm({...courseForm, dificultadMinima: parseInt(e.target.value) || 0})}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        <p className="mt-1 text-xs text-gray-500">Rango: 0-10</p>
                      </div>
                      
                      <div>
                        <Label htmlFor="dificultadMaxima" className="text-sm font-medium text-gray-700">
                          Dificultad Máxima
                        </Label>
                        <Input
                          id="dificultadMaxima"
                          type="number"
                          min="0"
                          max="10"
                          value={courseForm.dificultadMaxima}
                          onChange={(e) => setCourseForm({...courseForm, dificultadMaxima: parseInt(e.target.value) || 10})}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        <p className="mt-1 text-xs text-gray-500">Rango: 0-10</p>
                      </div>
                    </div>
                    
                    {courseForm.dificultadMinima > courseForm.dificultadMaxima && (
                      <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <p className="text-sm text-red-700">
                          ❌ La dificultad mínima no puede ser mayor que la máxima
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Botones de acción */}
                  <div className="flex justify-end space-x-3 pt-6 border-t">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowCourseForm(false)
                        setEditingCourse(null)
                        setError("")
                      }}
                      className="px-6"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleSaveCourse} 
                      className="bg-green-600 hover:bg-green-700 px-6"
                      disabled={!courseForm.nombreCurso || !courseForm.profesor || courseForm.dificultadMinima > courseForm.dificultadMaxima}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {editingCourse ? 'Actualizar Curso' : 'Crear Curso'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lista de cursos */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Curso
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Profesor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dificultad
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {courses.map((course) => (
                        <tr key={course.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {course.nombreCurso}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {getTeacherName(course.profesor)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="outline">
                              {course.dificultadMinima} - {course.dificultadMaxima}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditCourse(course)}
                              disabled={isLoading}
                              className="disabled:opacity-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteCourse(course.id)}
                              disabled={isLoading}
                              className="text-red-600 hover:text-red-700 disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Temas */}
          <TabsContent value="topics" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Gestión de Temas</h2>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={loadTopics}
                  disabled={isLoading}
                  className="bg-white hover:bg-gray-50"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Actualizar
                </Button>
                <Button onClick={handleCreateTopic} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Tema
                </Button>
              </div>
            </div>

            {/* Formulario de tema */}
            {showTopicForm && (
              <Card className="max-w-4xl mx-auto">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardTitle className="text-xl font-bold text-gray-800">
                    {editingTopic ? '✏️ Editar Tema' : '➕ Nuevo Tema'}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {editingTopic ? 'Modifica los datos del tema existente' : 'Complete la información para crear un nuevo tema'}
                  </p>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Información básica */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">📝 Información del Tema</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <Label htmlFor="titulo" className="text-sm font-medium text-gray-700">
                          Título del Tema *
                        </Label>
                        <Input
                          id="titulo"
                          value={topicForm.titulo}
                          onChange={(e) => setTopicForm({...topicForm, titulo: e.target.value})}
                          placeholder="Ej: Introducción a las Contraseñas Seguras"
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="curso" className="text-sm font-medium text-gray-700">
                          Curso Asignado *
                        </Label>
                        <select
                          id="curso"
                          value={topicForm.curso}
                          onChange={(e) => setTopicForm({...topicForm, curso: parseInt(e.target.value)})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                          <option value={0}>-- Seleccione un curso --</option>
                          {courses.length > 0 ? (
                            courses.map(course => (
                              <option key={course.id} value={course.id}>
                                📚 {course.nombreCurso}
                              </option>
                            ))
                          ) : (
                            <option disabled>No hay cursos disponibles</option>
                          )}
                        </select>
                        {courses.length === 0 && (
                          <p className="mt-1 text-sm text-amber-600">
                            ⚠️ No hay cursos disponibles. Cree un curso primero.
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="orden" className="text-sm font-medium text-gray-700">
                          Orden en el Curso
                        </Label>
                        <Input
                          id="orden"
                          type="number"
                          min="1"
                          value={topicForm.orden}
                          onChange={(e) => setTopicForm({...topicForm, orden: parseInt(e.target.value) || 1})}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring-green-500"
                        />
                        <p className="mt-1 text-xs text-gray-500">Orden de aparición en el curso</p>
                      </div>
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">📄 Contenido del Tema</h3>
                    
                    <div>
                      <Label htmlFor="contenido" className="text-sm font-medium text-gray-700">
                        Contenido (Formato Markdown) *
                      </Label>
                      <textarea
                        id="contenido"
                        value={topicForm.contenido}
                        onChange={(e) => setTopicForm({...topicForm, contenido: e.target.value})}
                        placeholder={`Ingrese el contenido en formato Markdown. Ejemplo:

# Título Principal
## Subtítulo

Este es un **texto en negrita** y esto es *cursiva*.

- Lista de elementos
- Segundo elemento

\`\`\`python
# Código de ejemplo
print("Hola mundo")
\`\`\``}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 min-h-[300px] font-mono text-sm"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        💡 Puede usar Markdown para formatear el texto: **negrita**, *cursiva*, # títulos, listas, código, etc.
                      </p>
                    </div>
                  </div>
                  
                  {/* Botones de acción */}
                  <div className="flex justify-end space-x-3 pt-6 border-t">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowTopicForm(false)
                        setEditingTopic(null)
                        setError("")
                      }}
                      className="px-6"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleSaveTopic} 
                      className="bg-green-600 hover:bg-green-700 px-6"
                      disabled={!topicForm.titulo || !topicForm.contenido || !topicForm.curso}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {editingTopic ? 'Actualizar Tema' : 'Crear Tema'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lista de temas */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Título
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Curso
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Orden
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {topics.map((topic) => (
                        <tr key={topic.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {topic.titulo}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {getCourseName(topic.curso)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="outline">
                              {topic.orden}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditTopic(topic)}
                              disabled={isLoading}
                              className="disabled:opacity-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteTopic(topic.id)}
                              disabled={isLoading}
                              className="text-red-600 hover:text-red-700 disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
