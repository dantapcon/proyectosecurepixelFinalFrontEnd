# Integración de API de Estadísticas - SecurePixel

## Resumen de Implementación

Se ha integrado exitosamente la API de estadísticas del backend Django con el frontend de Next.js, siguiendo la lógica existente en el proyecto. **IMPORTANTE: Todas las llamadas a la API incluyen el token de autenticación requerido.**

## Endpoints Implementados

La API de estadísticas incluye los siguientes endpoints (todos requieren autenticación):

- `GET /api/estadisticas/admin-dashboard` - Estadísticas para el dashboard de administrador
- `GET /api/estadisticas/reporte-estadisticas-generales` - Reporte general del sistema
- `GET /api/estadisticas/reporte-atencion-estudiantes/<int:pk>` - **Reporte de atención de un estudiante específico (requiere ID)**
- `GET /api/estadisticas/reporte-emociones-estudiante` - **Reporte de emociones del estudiante autenticado (usa token para identificar)**
- `GET /api/estadisticas/profesor-dashboard` - Estadísticas para el dashboard de profesor

## Archivos Modificados/Creados

### 1. API Configuration (`src/lib/api.ts`)
- Agregados endpoints de estadísticas en `API_ENDPOINTS`
- Creada nueva sección `estadisticasAPI` con funciones tipadas
- **MEJORAS DE AUTENTICACIÓN:**
  - Validación previa del token antes de hacer llamadas
  - Manejo específico de errores 401 (no autorizado)
  - Limpieza automática de tokens inválidos
  - Funciones helper: `isAuthenticated()`, `getAuthToken()`, `clearAuthToken()`
  - Logs detallados para debugging de autenticación
- Importados tipos TypeScript para las respuestas

### 2. Tipos TypeScript (`src/types/estadisticas.ts`) - NUEVO
- `AdminDashboardStats` - Interfaz para estadísticas del admin
- `ReporteEstadisticasGenerales` - Interfaz para reporte general
- `ReporteAtencionEstudiantes` - Interfaz para reporte de atención
- `ReporteEmocionesEstudiante` - Interfaz para reporte de emociones
- `ProfesorDashboardStats` - Interfaz para estadísticas del profesor

### 3. Dashboard de Administrador (`src/app/admin/page.tsx`)
- Agregados estados para estadísticas del admin
- Función `loadAdminStats()` para cargar datos de la API
- **Validación de autenticación antes de cargar datos**
- **Manejo específico de errores 401 con mensajes informativos**
- Actualización de `systemStats` para usar datos reales
- Enlaces a reportes detallados en la sección de Reportes

### 4. Dashboard de Profesor (`src/app/teacher/page.tsx`)
- Agregados estados para estadísticas del profesor
- Función `loadProfesorStats()` para cargar datos de la API
- **Validación de autenticación antes de cargar datos**
- **Manejo específico de errores 401 con mensajes informativos**
- Actualización de `classStats` para usar datos reales

### 5. Dashboard de Estudiante (`src/app/dashboard/page.tsx`)
- Agregados estados para estadísticas de emociones del estudiante
- **Función `loadStudentEmotionStats()` actualizada** - ya no requiere ID del usuario
- **La API usa el token para identificar automáticamente al estudiante**
- **Validación de autenticación antes de cargar datos**
- **Manejo silencioso de errores de autenticación (logs en consola)**
- Actualización de la sección "Análisis Emocional" para mostrar datos reales

### 6. Reporte de Estadísticas Generales (`src/app/reports/general/page.tsx`) - NUEVO
- Página completa para mostrar estadísticas generales del sistema
- **Validación de autenticación y control de acceso por tipo de usuario**
- **Manejo robusto de errores 401 con redirección automática**
- Métricas principales: usuarios, cursos, evaluaciones, calificaciones
- Análisis detallado con gráficos de progreso
- Funcionalidad de descarga (por implementar)

### 7. Reporte de Atención de Estudiantes (`src/app/reports/attention/page.tsx`) - NUEVO **ACTUALIZADO**
- **Nueva funcionalidad**: Selección de estudiante específico
- **Carga dinámica**: Primero lista estudiantes, luego carga reporte individual
- **Validación de autenticación y control de acceso por tipo de usuario**
- **Manejo robusto de errores 401 con redirección automática**
- **Integración con API de usuarios** para obtener lista de estudiantes
- Funcionalidad de búsqueda y filtrado de estudiantes
- Vista detallada del reporte de atención individual
- Navegación entre lista de estudiantes y reporte específico

## Características Implementadas

### 🔒 Seguridad y Autorización **MEJORADA**
- **Validación previa del token** antes de todas las llamadas a la API
- **Manejo específico de errores 401** (token inválido/expirado)
- **Limpieza automática de tokens inválidos**
- Control de acceso por tipo de usuario
- Solo administradores pueden acceder a reportes completos
- Profesores ven estadísticas de sus cursos
- Estudiantes ven sus propias estadísticas
- **Funciones helper para autenticación**: `isAuthenticated()`, `getAuthToken()`, `clearAuthToken()`

### 📊 Visualización de Datos
- Tarjetas de métricas principales
- Barras de progreso para visualizar porcentajes
- Códigos de colores para diferentes niveles (atención, rendimiento)
- Badges para estados y categorías

### 🔄 Carga de Datos **CON AUTENTICACIÓN ROBUSTA**
- **Verificación de token antes de cada llamada**
- Estados de carga con spinners
- **Manejo específico de errores de autenticación**
- **Mensajes informativos para tokens expirados**
- Refrescado manual de datos
- Carga automática al montar componentes
- **Logs detallados para debugging**

### 📱 Responsive Design
- Grids adaptables para diferentes tamaños de pantalla
- Componentes que se ajustan a móviles, tablets y desktop
- Navegación intuitiva entre secciones

### 🔍 Funcionalidades Adicionales
- Búsqueda de estudiantes en reportes
- Filtrado por diferentes criterios
- Descarga de reportes (estructura preparada)
- Navegación entre dashboards y reportes

## Manejo de Autenticación

### Headers de Autorización
Todas las llamadas a la API incluyen automáticamente:
```typescript
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Token ${token}` // Cuando hay token disponible
}
```

### Validaciones Implementadas
1. **Verificación previa del token** en cada función de estadísticas
2. **Detección de respuestas 401** con limpieza automática de token
3. **Mensajes específicos** para errores de autenticación
4. **Logs detallados** para debugging de problemas de auth

## Estructura de Datos Esperada

### AdminDashboardStats
```typescript
{
  total_estudiantes: number
  evaluaciones_activas: number
  evaluaciones_completadas: number
  tiempo_actividad_sistema: string
  precision_deteccion_emociones: string
  tiempo_respuesta_ia: string
}
```

### ProfesorDashboardStats
```typescript
{
  total_estudiantes: number
  estudiantes_activos: number
  evaluaciones_completadas: number
  puntaje_promedio: number
  tiempo_promedio: string
  estudiantes_en_riesgo: number
  cursos_asignados: number
  temas_creados: number
}
```

### ReporteEmocionesEstudiante
```typescript
{
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
```

## Cómo Usar

1. **Dashboard de Admin**: Las estadísticas se cargan automáticamente al ingresar
2. **Dashboard de Profesor**: Las estadísticas se cargan al acceder a la página
3. **Dashboard de Estudiante**: Las estadísticas de emociones se cargan si el usuario tiene datos
4. **Reportes Detallados**: Accesibles desde el dashboard de admin en la pestaña "Reportes"

## Fallbacks y Manejo de Errores

- Si la API no está disponible, se muestran datos mock como fallback
- Los errores se muestran con mensajes informativos
- Los componentes de carga se muestran durante la obtención de datos
- Validación de tipos de usuario para control de acceso

## Cambios Importantes en las APIs

### 🔄 **Correcciones de Endpoints Implementadas:**

1. **Reporte de Atención de Estudiantes:**
   - ❌ Antes: `GET /api/estadisticas/reporte-atencion-estudiantes` (sin parámetros)
   - ✅ Ahora: `GET /api/estadisticas/reporte-atencion-estudiantes/<int:pk>` (requiere ID del estudiante)
   - **Impacto**: La página ahora permite seleccionar estudiantes específicos

2. **Reporte de Emociones:**
   - ❌ Antes: `GET /api/estadisticas/reporte-emociones-estudiante/<int:pk>` (requería ID)
   - ✅ Ahora: `GET /api/estadisticas/reporte-emociones-estudiante` (usa token para identificar)
   - **Impacto**: Simplifica la llamada desde el dashboard del estudiante

### 📋 **Comportamiento Actualizado:**

- **Estudiantes**: Sus reportes de emociones se cargan automáticamente usando su token
- **Administradores**: Pueden seleccionar cualquier estudiante para ver su reporte de atención
- **Profesores**: Mantienen acceso a sus estadísticas de dashboard

## Próximos Pasos Sugeridos

1. Implementar funcionalidad de descarga de reportes (PDF/Excel)
2. Agregar más visualizaciones (gráficos de líneas, barras, pasteles)
3. Implementar filtros de fecha para reportes históricos
4. Agregar notificaciones en tiempo real para alertas importantes
5. Implementar cache para mejorar performance
6. Agregar tests para las nuevas funcionalidades
