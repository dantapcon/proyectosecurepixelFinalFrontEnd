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

## Estructura de Datos Actualizada

### Reporte de Estadísticas Generales (ACTUALIZADO)

La API ahora devuelve la siguiente estructura para el endpoint `/api/estadisticas/reporte-estadisticas-generales`:

```json
{
  "estadisticas_globale": {
    "n_estudiantes": 1,
    "promedio_general": 5,
    "n_lecciones": 0,
    "tiempo_promedio_estudio": 5.984
  },
  "estadisticas_por_curso": {
    "dsfsdf": {
      "n_estudiantes": 1,
      "promedio_general": 5,
      "n_lecciones": 0,
      "tiempo_promedio_estudio": 5.984
    }
  },
  "estadisticas_por_profesor": {
    "usuario1": {
      "n_estudiantes": 1,
      "promedio_general": 5,
      "n_lecciones": 0,
      "tiempo_promedio_estudio": 5.984
    },
    "davidfranciscotoro@gmail.com": {
      "n_estudiantes": 0,
      "promedio_general": 0,
      "n_lecciones": 0,
      "tiempo_promedio_estudio": 0
    }
  }
}
```

**Tipos TypeScript Actualizados:**
- `EstadisticasGlobales` - Estructura base para estadísticas
- `EstadisticasPorEntidad` - Mapa de entidades a estadísticas
- `ReporteEstadisticasGenerales` - Estructura completa del reporte

**Visualización de Datos:**
- Métricas principales: estudiantes, lecciones, promedio general, tiempo de estudio
- Tabla detallada por curso con indicadores de rendimiento
- Tabla detallada por profesor con métricas individuales
- Progress bars para visualizar rendimiento relativo
- Badges para clasificar promedios (bueno/malo según umbral de 10/20)

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

### ReporteAtencionEstudiantes **ACTUALIZADA**
```typescript
{
  atencion: Array<{
    tema: string
    fecha: string
    vectorOjosCerados: string[]     // Momentos cuando los ojos estuvieron cerrados
    vectorAnguloCabeza: string[]    // Datos del ángulo de la cabeza
    tiempoLectura: number           // Tiempo en minutos
  }>
  emociones: Array<{
    emociones: { [key: string]: number }  // Conteo de cada emoción detectada
    emocionPredominante: string           // Emoción más frecuente
    numImgProsesadas: number              // Total de imágenes analizadas
  }>
}
```

**Datos reales de ejemplo:**
```json
{
  "atencion": [
    {
      "tema": "tema prueva",
      "fecha": "2025-08-12", 
      "vectorOjosCerados": ["0:0:4:58", "0:0:5:32", "0:0:7:10", "0:0:8:87"],
      "vectorAnguloCabeza": [],
      "tiempoLectura": 11.657
    }
  ],
  "emociones": [
    {
      "emociones": { "neutral": 7 },
      "emocionPredominante": "neutral", 
      "numImgProsesadas": 7
    }
  ]
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

## Integración de Correlación Emoción-Rendimiento **ACTUALIZADA**

### Dashboard de Administrador
- **Datos en tiempo real**: Utiliza el endpoint `reporte-emociones-estudiante` con estructura real de la API
- **Estructura de datos API**:
  ```json
  {
    "emociones_porcentaje": {
      "happy": 9.677,
      "sad": 35.484,
      "neutral": 22.581,
      "angry": 29.032,
      "fear": 3.226
    },
    "promedios_calificaciones": {
      "happy": 6.667,
      "sad": 0,
      "neutral": 4.286,
      "angry": 0,
      "fear": 0
    }
  }
  ```
- **Estructura AdminDashboardStats**:
  ```typescript
  {
    n_usuarios: number,
    n_pruebas_no_completadas: number,
    n_pruebas_completadas: number,
    uptime: string,
    nota_promedio: string, // Promedio sobre 20
    n_cursos: string // Usado como tiempo de respuesta IA
  }
  ```
- **Fallback inteligente**: Si no hay datos de emociones, muestra datos por defecto
- **Visualización mejorada**:
  - Colores dinámicos para diferentes emociones
  - Indicador de carga durante la obtención de datos
  - Badge que indica cuando se usan datos en tiempo real
  - **Calificaciones promedio reales (escala 0-20)**
  - Porcentajes de frecuencia de detección
  - Traducción automática de emociones inglés → español

### 📊 **Ejemplo de Datos Mostrados en Dashboard**
Con la estructura de ejemplo:
```json
{
  "emociones_porcentaje": { "happy": 9.67, "sad": 35.48, "neutral": 22.58, "angry": 29.03, "fear": 3.23 },
  "promedios_calificaciones": { "happy": 6.67, "sad": 0, "neutral": 4.29, "angry": 0, "fear": 0 }
}
```

Se mostraría:
- 🟢 **Feliz**: Calificación 7/20 • 9.67% frecuencia
- 🔵 **Triste**: Calificación 0/20 • 35.48% frecuencia  
- ⚫ **Neutral**: Calificación 4/20 • 22.58% frecuencia
- 🔴 **Enojado**: Calificación 0/20 • 29.03% frecuencia
- 🟡 **Miedo**: Calificación 0/20 • 3.23% frecuencia

### ✅ **Estado del Proyecto Actualizado**
- ✅ Sin errores de compilación
- ✅ Tipos TypeScript actualizados para estructura real de API
- ✅ Sistema de calificaciones sobre escala 0-20
- ✅ Integración API completa con endpoints reales
- ✅ Fallbacks implementados para datos por defecto
- ✅ Documentación actualizada con ejemplos reales
- ✅ Logging para debugging y monitoreo
- ✅ UI responsive y accesible
- ✅ Estructura AdminDashboardStats corregida

### Emociones Soportadas por la API
- **happy** → **Feliz** (Verde)
- **sad** → **Triste** (Azul)
- **neutral** → **Neutral** (Gris)
- **angry** → **Enojado** (Rojo)
- **fear** → **Miedo** (Amarillo)
- **contempt** → **Desprecio** (Púrpura)
- **disgust** → **Disgusto** (Naranja)
- **surprise** → **Sorpresa** (Rosa)

### Datos Mostrados
- **Emoción**: Nombre traducido al español
- **Calificación**: Promedio real de calificaciones (0-20) para esa emoción
- **Frecuencia**: Porcentaje de detección de la emoción
- **Contexto**: Número total de tipos de emociones detectadas

### Funcionalidades
- **Traducción automática**: Convierte emociones de inglés a español
- **Filtrado inteligente**: Solo muestra emociones con datos (> 0%)
- **Colores dinámicos**: Sistema de colores adaptativo para cada emoción
- **Datos reales**: Usa calificaciones promedio reales de la API (escala 0-20)

## Página de Reporte de Atención **COMPLETAMENTE RENOVADA**

### 🎯 **Nuevas Funcionalidades Implementadas**

#### **Análisis de Sesiones de Lectura**
- **Seguimiento temporal**: Muestra fecha y duración de cada sesión
- **Detección de distracción**: Vectores de tiempo cuando los ojos estuvieron cerrados
- **Métricas de atención**: Cálculo automático del nivel de atención basado en distracciones
- **Visualización de temas**: Cada sesión muestra el tema estudiado

#### **Análisis de Emociones Detallado**
- **Procesamiento agregado**: Suma todas las emociones detectadas across sesiones
- **Visualización por porcentajes**: Muestra distribución de emociones
- **Colores dinámicos**: Sistema de colores para cada tipo de emoción
- **Conteo de imágenes**: Total de imágenes procesadas por el sistema de IA

#### **Métricas Calculadas**
- **Nivel de atención promedio**: Basado en frecuencia de distracciones
- **Tiempo total de lectura**: Suma de todas las sesiones
- **Eventos de distracción**: Conteo y formateo de momentos específicos
- **Estado de atención**: Clasificación (Excelente/Bueno/Regular/Necesita Atención)

#### **Interfaz Mejorada**
- **Selección de estudiantes**: Lista completa con búsqueda
- **Cards informativas**: Métricas principales destacadas
- **Layout en grid**: Sesiones y emociones lado a lado
- **Información contextual**: Detalles del estudiante y resumen

## 🔧 **Soluciones de Hidratación Implementadas**

### **Problema de Hidratación de Next.js**
Se implementaron soluciones para prevenir errores de hidratación causados por diferencias entre el servidor y el cliente:

#### **1. Hook `useClientOnly()`**
```typescript
// src/hooks/useClientOnly.ts
export function useClientOnly() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted
}
```

#### **2. AuthContext Protegido**
- ✅ Acceso a `localStorage` protegido con `typeof window !== 'undefined'`
- ✅ Estado `mounted` para controlar inicialización
- ✅ Validación de disponibilidad de API del navegador

#### **3. Componentes con Protección de Hidratación**
- ✅ **ReporteEstadisticasPage**: Usa `useClientOnly()` 
- ✅ **AuthProvider**: Control de montaje interno
- ✅ **api.ts**: Todas las llamadas a `localStorage` protegidas

#### **4. Patrón de Implementación**
```typescript
const mounted = useClientOnly()

if (!mounted) {
  return <LoadingComponent />
}

// Renderizar contenido normal
```

### **Errores Corregidos**
- ❌ `localStorage` accedido en servidor
- ❌ Diferencias en atributos HTML servidor/cliente  
- ❌ Estados iniciales inconsistentes
- ✅ Hidratación sin errores
- ✅ Funcionalidad completa en cliente

## Corrección de Autenticación (ACTUALIZADO)

**PROBLEMA RESUELTO:** Se identificó y corrigió un problema crítico donde algunos endpoints de estadísticas no estaban pasando correctamente el token de autenticación en los headers de las requests.

### Endpoints Corregidos:
- `getAdminDashboardStats()` - ✅ Token agregado
- `getReporteEstadisticasGenerales()` - ✅ Token agregado  
- `getReporteAtencionEstudiantes()` - ✅ Token agregado
- `getReporteEmocionesEstudiante()` - ✅ Token agregado
- `getProfesorDashboardStats()` - ✅ Token agregado

### Formato de Autenticación:
Todos los endpoints ahora incluyen consistentemente:
```javascript
headers: {
  'Authorization': `Token ${token}`,
  'Content-Type': 'application/json',
}
```

**IMPORTANTE:** Todos los endpoints de estadísticas requieren autenticación válida y ahora están configurados correctamente para enviar el token en cada request.

### Dashboard de Profesor - Estructura Actualizada

La API para el dashboard de profesor ahora devuelve la siguiente estructura:

```json
{
  "n_estudiantes": 0,
  "n_pruebas_completadas": 0,
  "n_pruebas_no_completadas": 0,
  "n_estudiantes_reprobaron": 2,
  "nota_promedio": 0,
  "n_cursos": 0
}
```

**Tipos TypeScript Actualizados:**
```typescript
export interface ProfesorDashboardStats {
  n_estudiantes: number
  n_pruebas_completadas: number
  n_pruebas_no_completadas: number
  n_estudiantes_reprobaron: number
  nota_promedio: number
  n_cursos: number
}
```

**Métricas Visualizadas:**
- **Estudiantes**: Total de estudiantes asignados al profesor
- **Activos**: Misma cantidad que estudiantes (se asume que todos los asignados están activos)
- **Evaluaciones**: Número de pruebas completadas
- **Promedio**: Nota promedio de los estudiantes (escala 0-20)
- **Pruebas Incompletas**: Evaluaciones pendientes de completar
- **Reprobados**: Número de estudiantes que han reprobado
- **Cursos**: Total de cursos asignados al profesor

**Cambios en el Dashboard:**
- Actualizado para usar la nueva estructura de datos de la API
- Reemplazadas métricas obsoletas (`tiempo_promedio`, `estudiantes_en_riesgo`) por nuevas métricas relevantes
- Agregada nueva carta para mostrar total de cursos
- Mantiene compatibilidad con valores por defecto en caso de datos faltantes

## Refactorización de EmotionTracker API (NUEVO)

**MEJORA IMPLEMENTADA:** Se refactorizó la función de análisis de atención del componente `EmotionTracker` para seguir el patrón estándar de las demás APIs.

### Cambios Realizados:

#### 1. **API Centralizada** (`src/lib/api.ts`)
- **Función actualizada:** `emotionAPI.analyzeAttention()`
- **Autenticación:** Incluye validación de token y headers de autorización
- **Manejo de errores:** Consistente con el patrón de otras APIs
- **Logging:** Logs detallados para debugging

```typescript
analyzeAttention: async (data: any) => {
  // Validación de token
  // Headers de autorización
  // Manejo robusto de errores
  // Logging consistente
}
```

#### 2. **Componente EmotionTracker** (`src/components/EmotionTracker.tsx`)
- **Importación:** Agregada importación de `emotionAPI`
- **Eliminado:** Fetch directo con URL hardcodeada
- **Reemplazado:** Por llamada a `emotionAPI.analyzeAttention()`
- **Beneficios:** 
  - Autenticación automática
  - Manejo de errores centralizado
  - Consistencia con el resto del sistema

### Antes vs Después:

**Antes (fetch directo):**
```typescript
const response = await fetch("http://localhost:8000/api/ia/atencion", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(datos),
});
```

**Después (API centralizada):**
```typescript
const response = await emotionAPI.analyzeAttention(datos);
```

### Ventajas de la Refactorización:
- ✅ **Autenticación automática** con token
- ✅ **Manejo de errores** estandarizado
- ✅ **URL centralizada** (no hardcodeada)
- ✅ **Logging consistente** para debugging
- ✅ **Mantenibilidad** mejorada
- ✅ **Reutilizable** desde otros componentes
