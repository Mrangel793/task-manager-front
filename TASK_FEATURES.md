# Funcionalidades de Tareas - Sistema Mejorado

## 🎨 Características Visuales

### 1. Estados de Tareas

El sistema maneja 4 estados diferentes:

- **Pendiente** (pending) - Color amarillo
- **En Progreso** (in_progress) - Color azul  
- **Completada** (completed) - Color verde
- **Cancelada** (cancelled) - Color gris

### 2. Prioridades

- **Baja** - Color azul, orden 1
- **Media** - Color amarillo, orden 2
- **Alta** - Color rojo, orden 3

### 3. Indicadores de Urgencia

El sistema calcula automáticamente la urgencia basándose en la fecha límite:

#### Vencida (Overdue)
- **Cuándo:** Fecha límite pasada
- **Visual:** Borde rojo, fondo rojo claro, badge "VENCIDA"
- **Mensaje:** "Vencida hace X días"

#### Urgente (Urgent)
- **Cuándo:** Vence en menos de 24 horas
- **Visual:** Borde naranja, fondo naranja claro, badge "URGENTE"
- **Mensaje:** "Vence en X horas"

#### Pronto (Soon)
- **Cuándo:** Vence en 24-48 horas
- **Visual:** Borde amarillo, fondo amarillo claro
- **Mensaje:** "Vence en X horas"

#### Normal
- **Cuándo:** Vence en más de 48 horas
- **Visual:** Sin indicadores especiales

## 🔄 Cambio de Estado

### Dropdown Interactivo

Cada tarea tiene un dropdown que permite cambiar su estado fácilmente:

```vue
<TaskStatusDropdown
  :task="task"
  @change="handleStatusChange"
/>
```

**Características:**
- Click en el badge del estado para abrir el dropdown
- Lista de todos los estados disponibles
- Estado actual marcado con checkmark
- Solo muestra estados permitidos según rol del usuario

### Permisos por Rol

#### Administrador
- ✅ Puede cambiar cualquier tarea a cualquier estado
- ✅ Puede cancelar tareas

#### Supervisor
- ✅ Puede cambiar cualquier tarea a cualquier estado
- ✅ Puede cancelar tareas

#### Operador
- ✅ Solo puede cambiar tareas asignadas a él
- ❌ No puede cancelar tareas
- ✅ Puede marcar como completada

## 📊 TaskCard Mejorado

### Estructura Visual

```
┌─────────────────────────────────────┐
│ [BORDE PRIORIDAD] [BADGE URGENCIA]  │
│                                      │
│ Título de la Tarea                   │
│ Descripción breve...                 │
│                                      │
│ ⚠ Mensaje de urgencia (si aplica)   │
│                                      │
│ 📅 Hoy • 15:00  [Badge Prioridad]   │
│ 👤 Usuario asignado                  │
│                                      │
│ ──────────────────────────────────── │
│ [Dropdown Estado]   [Ver detalles →] │
└─────────────────────────────────────┘
```

### Ejemplo de Uso

```vue
<template>
  <TaskCard
    :task="task"
    :users="users"
    @click="handleTaskClick"
    @status-change="handleStatusChange"
  />
</template>

<script setup>
import TaskCard from '@/components/tasks/TaskCard.vue'

const task = {
  id: 1,
  title: 'Revisar documentación',
  description: 'Actualizar la documentación técnica del proyecto',
  status: 'pending',
  priority: 'Alta',
  due_date: '2025-11-10',
  due_time: '15:00',
  assignee_id: 'user-123'
}

const users = [
  { id: 'user-123', name: 'Juan Pérez' }
]

const handleTaskClick = (task) => {
  router.push(`/tasks/${task.id}`)
}

const handleStatusChange = async ({ task, newStatus }) => {
  await taskStore.updateTaskStatus(task.id, newStatus)
  toast.success('Estado actualizado')
}
</script>
```

## 🛠 Utilidades Disponibles

### taskHelpers.js

```javascript
import {
  getTaskUrgency,
  getPriorityConfig,
  getStatusConfig,
  formatDueDate,
  sortTasksByUrgency,
  getTaskStats
} from '@/utils/taskHelpers'

// Obtener nivel de urgencia
const urgency = getTaskUrgency(task)
// Retorna: { level, message, cardClass, textClass, badgeClass }

// Configuración de prioridad
const priorityConfig = getPriorityConfig('Alta')
// Retorna: { label, color, bgClass, textClass, badgeClass, order }

// Formatear fecha
const formatted = formatDueDate('2025-11-10', '15:00')
// Retorna: "Hoy • 15:00" o "Mañana • 15:00" o "10 nov • 15:00"

// Ordenar por urgencia
const sortedTasks = sortTasksByUrgency(tasks)
// Ordena: Vencidas > Urgentes > Pronto > Normal > Por prioridad

// Estadísticas
const stats = getTaskStats(tasks)
// Retorna: { total, pending, inProgress, completed, overdue, urgent, completionRate }
```

## 🎯 Casos de Uso

### 1. Tarea Vencida

```javascript
const task = {
  title: 'Tarea urgente',
  status: 'pending',
  priority: 'Alta',
  due_date: '2025-11-08', // Hace 2 días
  due_time: '10:00'
}
```

**Resultado:**
- Borde rojo grueso
- Fondo rojo claro
- Badge "VENCIDA" en rojo
- Mensaje: "Vencida hace 2 días"

### 2. Tarea Urgente (< 24h)

```javascript
const task = {
  title: 'Reunión importante',
  status: 'in_progress',
  priority: 'Media',
  due_date: '2025-11-10',
  due_time: '16:00' // En 4 horas
}
```

**Resultado:**
- Borde naranja grueso
- Fondo naranja claro
- Badge "URGENTE" en naranja
- Mensaje: "Vence en 4 horas"

### 3. Tarea Normal

```javascript
const task = {
  title: 'Proyecto largo',
  status: 'pending',
  priority: 'Baja',
  due_date: '2025-11-20',
  due_time: null
}
```

**Resultado:**
- Borde azul (prioridad baja)
- Sin indicadores de urgencia
- Fecha: "20 nov"

## 💡 Tips de Implementación

### En TaskListView

```vue
<TaskCard
  v-for="task in filteredTasks"
  :key="task.id"
  :task="task"
  :users="users"
  @click="handleTaskClick"
  @status-change="handleStatusChange"
/>
```

### En MyTasksView

```vue
<!-- Ordenar por urgencia -->
<TaskCard
  v-for="task in sortTasksByUrgency(myTasks)"
  :key="task.id"
  :task="task"
  :users="users"
  @status-change="handleStatusChange"
/>
```

### Dashboard con Estadísticas

```vue
<script setup>
import { getTaskStats } from '@/utils/taskHelpers'

const stats = computed(() => getTaskStats(tasks.value))
</script>

<template>
  <StatCard
    title="Tareas Vencidas"
    :value="stats.overdue"
    icon="alert"
    color="red"
  />
  
  <StatCard
    title="Urgentes"
    :value="stats.urgent"
    icon="clock"
    color="orange"
  />
</template>
```

## 🚀 Ventajas

1. **Visual Intuitivo:** Los usuarios identifican rápidamente las tareas urgentes
2. **Cambio Rápido:** Dropdown permite cambiar estado en un click
3. **Permisos Claros:** El sistema respeta los roles automáticamente
4. **Sin Dependencias:** Todo hecho con Vue 3 + Tailwind
5. **Responsive:** Funciona en móvil, tablet y desktop
6. **Accesible:** Keyboard navigation y ARIA labels

## 🎨 Personalización

### Cambiar Colores de Urgencia

Edita `src/utils/taskHelpers.js`:

```javascript
export function getTaskUrgency(task) {
  // ...
  if (diffMs < 0) {
    return {
      level: URGENCY_LEVELS.OVERDUE,
      cardClass: 'border-2 border-red-600 bg-red-100', // Personalizar aquí
      // ...
    }
  }
}
```

### Agregar Nuevo Estado

1. Agregar en `TASK_STATUSES`
2. Agregar configuración en `STATUS_CONFIG`
3. Actualizar permisos en `canChangeToStatus`

### Cambiar Umbrales de Urgencia

```javascript
// En getTaskUrgency()
if (diffHours <= 12) { // Cambiar de 24 a 12 horas
  return { level: URGENCY_LEVELS.URGENT, ... }
}
```
