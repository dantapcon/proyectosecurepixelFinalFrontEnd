"use client"

import { useState } from "react"
import Link from "next/link"

// Types
interface Teacher {
  id: number
  name: string
  email: string
  phone: string
  department: string
  joinDate: string
  status: "active" | "inactive"
  classesCount: number
}

interface Class {
  id: number
  name: string
  code: string
  teacher: string
  teacherId: number
  studentsCount: number
  schedule: string
  semester: string
  status: "active" | "inactive"
}

interface Student {
  id: number
  name: string
  email: string
  studentId: string
  classId: number
  className: string
  enrollDate: string
  status: "active" | "inactive"
  progress: number
}

export default function AdminSettingsPage() {
  // Mock data
  const [teachers, setTeachers] = useState<Teacher[]>([
    {
      id: 1,
      name: "Ana Rodríguez",
      email: "ana.rodriguez@university.edu",
      phone: "+593 99 123 4567",
      department: "Ingeniería en Sistemas",
      joinDate: "2022-03-15",
      status: "active",
      classesCount: 3,
    },
    {
      id: 2,
      name: "Carlos Mendoza",
      email: "carlos.mendoza@university.edu",
      phone: "+593 99 234 5678",
      department: "Ciberseguridad",
      joinDate: "2021-08-20",
      status: "active",
      classesCount: 2,
    },
  ])

  const [classes, setClasses] = useState<Class[]>([
    {
      id: 1,
      name: "Ciberseguridad Básica",
      code: "CS101",
      teacher: "Ana Rodríguez",
      teacherId: 1,
      studentsCount: 32,
      schedule: "Lun-Mie-Vie 10:00-12:00",
      semester: "2024-1",
      status: "active",
    },
    {
      id: 2,
      name: "Seguridad Avanzada",
      code: "CS201",
      teacher: "Carlos Mendoza",
      teacherId: 2,
      studentsCount: 28,
      schedule: "Mar-Jue 14:00-16:00",
      semester: "2024-1",
      status: "active",
    },
  ])

  const [students, setStudents] = useState<Student[]>([
    {
      id: 1,
      name: "Juan Pérez",
      email: "juan.perez@student.edu",
      studentId: "2021001234",
      classId: 1,
      className: "Ciberseguridad Básica",
      enrollDate: "2024-02-15",
      status: "active",
      progress: 68,
    },
    {
      id: 2,
      name: "María García",
      email: "maria.garcia@student.edu",
      studentId: "2021001235",
      classId: 1,
      className: "Ciberseguridad Básica",
      enrollDate: "2024-02-15",
      status: "active",
      progress: 85,
    },
  ])

  const [activeTab, setActiveTab] = useState("teachers")

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin">
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors">
                ← Volver al Admin
              </button>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Configuración del Sistema</span>
            </div>
          </div>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Panel CRUD</span>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Overview */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Usuarios y Clases</h1>
          <p className="text-gray-600">Administra profesores, clases y estudiantes del sistema</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="border border-blue-100 p-6 rounded-lg bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Profesores</p>
                <p className="text-3xl font-bold text-blue-600">{teachers.length}</p>
              </div>
              <span className="text-4xl text-blue-600">👨‍🏫</span>
            </div>
          </div>

          <div className="border border-green-100 p-6 rounded-lg bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Clases</p>
                <p className="text-3xl font-bold text-green-600">{classes.length}</p>
              </div>
              <span className="text-4xl text-green-600">📚</span>
            </div>
          </div>

          <div className="border border-purple-100 p-6 rounded-lg bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Estudiantes</p>
                <p className="text-3xl font-bold text-purple-600">{students.length}</p>
              </div>
              <span className="text-4xl text-purple-600">👥</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("teachers")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "teachers"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Profesores
              </button>
              <button
                onClick={() => setActiveTab("classes")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "classes"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Clases
              </button>
              <button
                onClick={() => setActiveTab("students")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "students"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Estudiantes
              </button>
            </nav>
          </div>

          {/* Teachers Tab */}
          {activeTab === "teachers" && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center">
                  <span className="text-blue-600 mr-2">👨‍🏫</span>
                  Gestión de Profesores
                </h2>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
                  ➕ Nuevo Profesor
                </button>
              </div>
              <div className="space-y-4">
                {teachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {teacher.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{teacher.name}</p>
                        <p className="text-sm text-gray-600">{teacher.email}</p>
                        <p className="text-sm text-gray-600">{teacher.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          teacher.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {teacher.status === "active" ? "Activo" : "Inactivo"}
                      </span>
                      <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors">
                        ✏️
                      </button>
                      <button className="px-3 py-1 border border-red-300 text-red-600 rounded-md text-sm hover:bg-red-50 transition-colors">
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Classes Tab */}
          {activeTab === "classes" && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center">
                  <span className="text-green-600 mr-2">📚</span>
                  Gestión de Clases
                </h2>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors">
                  ➕ Nueva Clase
                </button>
              </div>
              <div className="space-y-4">
                {classes.map((classItem) => (
                  <div
                    key={classItem.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-semibold">{classItem.code}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{classItem.name}</p>
                        <p className="text-sm text-gray-600">Profesor: {classItem.teacher}</p>
                        <p className="text-sm text-gray-600">{classItem.schedule}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          classItem.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {classItem.status === "active" ? "Activa" : "Inactiva"}
                      </span>
                      <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors">
                        ✏️
                      </button>
                      <button className="px-3 py-1 border border-red-300 text-red-600 rounded-md text-sm hover:bg-red-50 transition-colors">
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Students Tab */}
          {activeTab === "students" && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center">
                  <span className="text-purple-600 mr-2">👥</span>
                  Gestión de Estudiantes
                </h2>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors">
                  ➕ Nuevo Estudiante
                </button>
              </div>
              <div className="space-y-4">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-semibold">
                          {student.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-600">{student.email}</p>
                        <p className="text-sm text-gray-600">ID: {student.studentId}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          student.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {student.status === "active" ? "Activo" : "Inactivo"}
                      </span>
                      <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors">
                        ✏️
                      </button>
                      <button className="px-3 py-1 border border-red-300 text-red-600 rounded-md text-sm hover:bg-red-50 transition-colors">
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
