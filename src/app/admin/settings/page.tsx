"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Shield, 
  Users, 
  UserCheck, 
  Search, 
  Edit, 
  Save, 
  X, 
  ArrowLeft, 
  LogOut 
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { apiRequest, API_ENDPOINTS, courseAPI } from "@/lib/api"

// Types actualizados para coincidir con el backend
interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  is_staff: boolean
  is_superuser?: boolean
  tipo_usuario?: string
  date_joined: string
  curso?: number
}

interface Course {
  id: number
  nombreCurso: string
  profesor: number
  dificultadMinima: number
  dificultadMaxima: number
}

interface EditUserForm {
  first_name: string
  last_name: string
  email: string
  username: string
  tipo_usuario: string
  curso?: number
}

export default function AdminSettingsPage() {
  const [users, setUsers] = useState<User[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTab, setSelectedTab] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState<EditUserForm>({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    tipo_usuario: "alumno",
    curso: undefined
  })
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [hasToken, setHasToken] = useState(false)
  const { logout, user } = useAuth()
  const router = useRouter()

  // Función helper para determinar el tipo de usuario
  const getUserType = (user: User): string => {
    if (user.tipo_usuario) {
      return user.tipo_usuario
    }
    // Fallback basado en los campos existentes
    if (user.is_superuser) return 'administrador'
    if (user.is_staff) return 'profesor'
    return 'alumno'
  }

  // Verificar token al montar el componente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHasToken(!!localStorage.getItem('token'))
    }
  }, [])

  // Cargar usuarios del backend solo si hay un usuario autenticado
  useEffect(() => {
    if (user) {
      console.log('Usuario autenticado:', user)
      loadUsersAndCourses()
    } else {
      console.log('No hay usuario autenticado, redirigiendo...')
      router.push('/login')
    }
  }, [user, router])

  // Función para cargar usuarios y cursos
  const loadUsersAndCourses = async () => {
    await Promise.all([
      loadUsers(),
      loadCourses()
    ])
  }

  // Cargar cursos disponibles
  const loadCourses = async () => {
    try {
      console.log('Cargando cursos...')
      const response = await courseAPI.getAllCourses()
      console.log('Respuesta de cursos:', response)
      
      if (response.ok) {
        console.log('Cursos cargados:', response.data)
        const coursesData = Array.isArray(response.data) ? response.data : []
        setCourses(coursesData)
      } else {
        console.error('Error al cargar cursos:', response)
        setCourses([])
      }
    } catch (error) {
      console.error('Error loading courses:', error)
      setCourses([])
    }
  }

  // Filtrar usuarios cuando cambia el término de búsqueda o la pestaña
  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, selectedTab])

  const loadUsers = async () => {
    setIsLoading(true)
    setError("")
    try {
      // Verificar que el token esté disponible
      const token = localStorage.getItem('token')
      console.log('Token disponible para cargar usuarios:', token ? 'Sí' : 'No')
      console.log('Enviando petición a:', API_ENDPOINTS.USERS_LIST)
      
      const response = await apiRequest(API_ENDPOINTS.USERS_LIST, {
        method: 'GET'
      })
      
      console.log('Respuesta de cargar usuarios:', response)
      
      if (response.ok) {
        console.log('Usuarios cargados:', response.data)
        // Asegurar que siempre se asigne un array válido
        const usersData = Array.isArray(response.data) ? response.data : []
        setUsers(usersData)
      } else {
        console.error('Error al cargar usuarios:', response)
        
        // Si el endpoint no funciona, intentar con un endpoint alternativo
        if (response.status === 404) {
          console.log('Probando endpoint alternativo...')
          const alternativeResponse = await apiRequest(`${API_ENDPOINTS.USERS_LIST.replace('/usuarios', '')}`, {
            method: 'GET'
          })
          
          if (alternativeResponse.ok) {
            console.log('Usuarios cargados con endpoint alternativo:', alternativeResponse.data)
            const alternativeUsersData = Array.isArray(alternativeResponse.data) ? alternativeResponse.data : []
            setUsers(alternativeUsersData)
            return
          }
        }
        
        setError(`Error al cargar los usuarios: ${response.data?.message || response.status}`)
        // Asegurar que users siga siendo un array vacío en caso de error
        setUsers([])
      }
    } catch (error) {
      console.error('Error de conexión:', error)
      setError('Error de conexión al servidor')
      // Asegurar que users siga siendo un array vacío en caso de error
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  const filterUsers = () => {
    // Verificar que users sea un array válido antes de filtrar
    if (!Array.isArray(users)) {
      console.log('Users no es un array válido:', users)
      setFilteredUsers([])
      return
    }

    let filtered = users.filter(user => 
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (selectedTab === "students") {
      filtered = filtered.filter(user => getUserType(user) === 'alumno')
    } else if (selectedTab === "teachers") {
      filtered = filtered.filter(user => getUserType(user) === 'profesor')
    } else if (selectedTab === "admins") {
      filtered = filtered.filter(user => getUserType(user) === 'administrador')
    }

    setFilteredUsers(filtered)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setEditForm({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      username: user.username,
      tipo_usuario: getUserType(user),
      curso: user.curso || undefined
    })
  }

  const handleSaveUser = async () => {
    if (!editingUser) return

    setIsLoading(true)
    try {
      console.log('Guardando usuario:', editingUser.id, editForm)
      
      // Preparar los datos para enviar
      const updateData: any = {
        username: editForm.username,
        email: editForm.email,
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        tipo_usuario: editForm.tipo_usuario,
      }
      
      // Solo agregar curso si es un estudiante y tiene un curso seleccionado
      if (editForm.tipo_usuario === 'alumno' && editForm.curso) {
        updateData.curso = editForm.curso
      }
      
      console.log('Datos a enviar al backend:', updateData)
      console.log('Curso seleccionado:', editForm.curso)
      console.log('Tipo de usuario:', editForm.tipo_usuario)
      
      const response = await apiRequest(API_ENDPOINTS.UPDATE_USER(editingUser.id), {
        method: 'PUT',
        body: JSON.stringify(updateData)
      })

      console.log('Respuesta de actualizar usuario:', response)

      if (response.ok) {
        console.log('Usuario actualizado exitosamente, recargando datos...')
        await loadUsersAndCourses() // Recargar tanto usuarios como cursos
        setEditingUser(null)
        setError("")
        console.log('Datos recargados')
      } else {
        console.error('Error al actualizar usuario:', response)
        setError(response.data?.message || 'Error al actualizar usuario')
      }
    } catch (error) {
      console.error('Error de conexión al actualizar usuario:', error)
      setError('Error de conexión al servidor')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingUser(null)
    setEditForm({
      first_name: "",
      last_name: "",
      email: "",
      username: "",
      tipo_usuario: "alumno",
      curso: undefined
    })
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Error durante el logout:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const getUserTypeBadge = (user: User) => {
    const userType = getUserType(user)
    if (userType === 'administrador') {
      return <Badge className="bg-red-100 text-red-800">Administrador</Badge>
    } else if (userType === 'profesor') {
      return <Badge className="bg-blue-100 text-blue-800">Profesor</Badge>
    } else {
      return <Badge className="bg-green-100 text-green-800">Estudiante</Badge>
    }
  }

  // Función para obtener el nombre del curso
  const getCourseName = (courseId: number | undefined) => {
    if (!courseId) return "Sin curso asignado"
    const course = courses.find(c => c.id === courseId)
    return course ? course.nombreCurso : "Curso no encontrado"
  }

  const getTabCounts = () => {
    // Verificar que users sea un array válido antes de contar
    if (!Array.isArray(users)) {
      return { students: 0, teachers: 0, admins: 0, total: 0 }
    }
    
    const students = users.filter(user => {
      const userType = getUserType(user)
      return userType === 'alumno'
    }).length
    
    const teachers = users.filter(user => {
      const userType = getUserType(user)
      return userType === 'profesor'
    }).length
    
    const admins = users.filter(user => {
      const userType = getUserType(user)
      return userType === 'administrador'
    }).length
    
    return { students, teachers, admins, total: users.length }
  }

  const counts = getTabCounts()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Panel
              </Link>
            </Button>
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Gestión de Usuarios</span>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {isLoggingOut ? 'Saliendo...' : 'Salir'}
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
            <details className="mt-2">
              <summary className="cursor-pointer text-sm">Información de debug</summary>
              <div className="mt-2 text-xs">
                <p>Token disponible: {hasToken ? 'Sí' : 'No'}</p>
                <p>Usuario autenticado: {user ? `${user.first_name} ${user.last_name}` : 'No'}</p>
                <p>Endpoint: {API_ENDPOINTS.USERS_LIST}</p>
              </div>
            </details>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Usuarios</p>
                  <p className="text-2xl font-bold text-gray-900">{counts.total}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Estudiantes</p>
                  <p className="text-2xl font-bold text-green-600">{counts.students}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Profesores</p>
                  <p className="text-2xl font-bold text-blue-600">{counts.teachers}</p>
                </div>
                <UserCheck className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Administradores</p>
                  <p className="text-2xl font-bold text-red-600">{counts.admins}</p>
                </div>
                <UserCheck className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <CardTitle>Gestión de Usuarios</CardTitle>
              <div className="flex gap-4 items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar usuarios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">Todos ({counts.total})</TabsTrigger>
                <TabsTrigger value="students">Estudiantes ({counts.students})</TabsTrigger>
                <TabsTrigger value="teachers">Profesores ({counts.teachers})</TabsTrigger>
                <TabsTrigger value="admins">Administradores ({counts.admins})</TabsTrigger>
              </TabsList>

              <TabsContent value={selectedTab} className="mt-6">
                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Cargando usuarios...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Usuario</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Email</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Tipo</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Curso</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user) => (
                          <tr key={user.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">
                              {editingUser?.id === user.id ? (
                                <div className="space-y-2">
                                  <Input
                                    value={editForm.first_name}
                                    onChange={(e) => setEditForm({...editForm, first_name: e.target.value})}
                                    placeholder="Nombre"
                                    className="text-sm"
                                  />
                                  <Input
                                    value={editForm.last_name}
                                    onChange={(e) => setEditForm({...editForm, last_name: e.target.value})}
                                    placeholder="Apellido"
                                    className="text-sm"
                                  />
                                </div>
                              ) : (
                                <div>
                                  <p className="font-medium">{user.first_name} {user.last_name}</p>
                                  <p className="text-sm text-gray-500">@{user.username}</p>
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {editingUser?.id === user.id ? (
                                <Input
                                  value={editForm.email}
                                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                  placeholder="Email"
                                  className="text-sm"
                                />
                              ) : (
                                user.email
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {editingUser?.id === user.id ? (
                                <select
                                  value={editForm.tipo_usuario}
                                  onChange={(e) => {
                                    const value = e.target.value
                                    setEditForm({
                                      ...editForm,
                                      tipo_usuario: value,
                                      // Limpiar curso si cambia a profesor o administrador
                                      curso: value === 'alumno' ? editForm.curso : undefined
                                    })
                                  }}
                                  className="text-sm border border-gray-300 rounded px-2 py-1"
                                  disabled={getUserType(user) === 'administrador'} // No permitir cambiar tipo de admin principal
                                >
                                  <option value="alumno">Estudiante</option>
                                  <option value="profesor">Profesor</option>
                                  <option value="administrador">Administrador</option>
                                </select>
                              ) : (
                                getUserTypeBadge(user)
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {editingUser?.id === user.id ? (
                                editForm.tipo_usuario === 'alumno' ? (
                                  <select
                                    value={editForm.curso || ''}
                                    onChange={(e) => {
                                      const value = e.target.value
                                      setEditForm({
                                        ...editForm,
                                        curso: value ? parseInt(value) : undefined
                                      })
                                    }}
                                    className="text-sm border border-gray-300 rounded px-2 py-1 w-full"
                                  >
                                    <option value="">-- Sin curso asignado --</option>
                                    {courses.map(course => (
                                      <option key={course.id} value={course.id}>
                                        {course.nombreCurso}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <span className="text-sm text-gray-500">
                                    {editForm.tipo_usuario === 'profesor' ? 'Se asigna al crear curso' : 'No aplica'}
                                  </span>
                                )
                              ) : (
                                <span className="text-sm">
                                  {getUserType(user) === 'alumno' ? getCourseName(user.curso) : (
                                    getUserType(user) === 'profesor' ? 'Se asigna al crear curso' : 'No aplica'
                                  )}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {editingUser?.id === user.id ? (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={handleSaveUser}
                                    disabled={isLoading}
                                  >
                                    <Save className="h-4 w-4 mr-1" />
                                    Guardar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleCancelEdit}
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Cancelar
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditUser(user)}
                                  disabled={getUserType(user) === 'administrador'} // No permitir editar administradores principales
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Editar
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredUsers.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No se encontraron usuarios</p>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
