# Módulo de Asistencia - GoSchool

## Descripción

El módulo de asistencia permite el registro, visualización y gestión de la asistencia escolar de los estudiantes del Colegio Stella Maris Rosario.

## Funcionalidades por Rol

### Estudiantes (`student`)
- **Ver su propia asistencia**: Acceso directo a sus registros de asistencia
- **Estadísticas personales**: Visualización de porcentajes de asistencia, tardanzas, etc.
- **Vista calendario**: Calendario visual con sus registros de asistencia
- **Vista lista**: Lista cronológica de registros con filtros

### Padres (`father`)
- **Ver asistencia de sus hijos**: Selección de hijo y visualización de registros
- **Estadísticas familiares**: Seguimiento del rendimiento de asistencia
- **Todas las vistas**: Acceso a calendario y lista como los estudiantes

### Profesores (`teacher`)
- **Solo consulta**: Acceso bloqueado según configuración del backend
- Sin permisos de edición o creación

### Preceptores (`preceptor`)
- **Gestión completa**: CRUD de registros de asistencia para sus cursos asignados
- **Registro rápido**: Formulario para registrar nueva asistencia
- **Edición/eliminación**: Modificar registros existentes
- **Todas las vistas**: Estadísticas, calendario y lista

### Administradores (`admin`)
- **Acceso total**: CRUD completo de registros de asistencia
- **Vista global**: Acceso a todos los estudiantes y cursos
- **Gestión avanzada**: Todas las funcionalidades disponibles

## Componentes Principales

### `AssistanceDisplay`
- Componente principal que muestra los registros de asistencia
- Incluye pestañas para alternar entre vista lista y calendario
- Filtros por estado de asistencia y ordenamiento
- Agrupación por mes en vista lista

### `AssistanceForm`
- Formulario para registrar nueva asistencia
- Solo visible para administradores y preceptores
- Validación de campos requeridos
- Selección de estado de asistencia con indicadores visuales

### `AssistanceStats`
- Componente de estadísticas con métricas clave
- Cálculo de porcentajes de asistencia
- Barra de progreso visual
- Evaluación de rendimiento (Excelente, Buena, Regular, Deficiente)

### `AssistanceCalendar`
- Vista calendario mensual de asistencia
- Indicadores visuales por tipo de estado
- Navegación por mes (implementación futura)
- Leyenda de colores

## Estados de Asistencia

- **Presente** (`present`): Estudiante asistió normalmente
- **Ausente** (`absent`): Estudiante no asistió
- **Tardanza** (`late`): Estudiante llegó tarde
- **Justificado** (`justified`): Ausencia o tardanza justificada

## Colores de Estados

- 🟢 **Verde**: Presente
- 🔴 **Rojo**: Ausente  
- 🟡 **Amarillo**: Tardanza
- 🔵 **Azul**: Justificado

## API Endpoints

- `GET /api/proxy/assistance/` - Obtener registros de asistencia
- `POST /api/proxy/assistance/` - Crear nuevo registro
- `PUT /api/proxy/assistance/{id}` - Actualizar registro existente
- `DELETE /api/proxy/assistance/{id}` - Eliminar registro

## Filtros Disponibles

- **Por estudiante**: `student_id`
- **Por fecha**: `date`
- **Por estado**: `presence`
- **Por ID**: `assistance_id`

## Estructura de Datos

```typescript
interface Assistance {
  id: number;
  student_id: number;
  presence: "present" | "absent" | "late" | "justified";
  date: string; // YYYY-MM-DD
}
```

## Navegación

La sección de asistencia sigue el patrón de navegación estándar:

1. **Selección de curso** (para admin/preceptor)
2. **Selección de estudiante** (si corresponde)
3. **Visualización de asistencia** con todas las funcionalidades

## Responsive Design

- **Mobile**: Vista de lista optimizada, formularios adaptables
- **Tablet**: Grid layout para mejor aprovechamiento del espacio
- **Desktop**: Layout completo con sidebar de formulario y área principal

## Implementación Futura

- Exportación de reportes en PDF/Excel
- Notificaciones automáticas por ausencias
- Integración con sistema de comunicación
- Filtros avanzados por rango de fechas
- Vista de tendencias y análisis temporal