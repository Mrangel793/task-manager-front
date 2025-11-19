# Guía de Uso de Componentes Reutilizables

## Componentes Comunes

### EmptyState
Estado vacío para listas sin elementos.

```vue
<EmptyState
  icon="clipboard"
  title="No hay tareas"
  message="No tienes tareas asignadas en este momento"
  actionText="Crear tarea"
  actionLink="/tasks/new"
/>

<!-- Con acción personalizada -->
<EmptyState
  icon="folder"
  title="No hay proyectos"
  message="Comienza creando tu primer proyecto"
  actionText="Nuevo Proyecto"
  @action="handleCreate"
/>
```

**Props:**
- `icon`: clipboard, folder, users, bell, search, inbox, calendar
- `title`: Título del estado vacío (requerido)
- `message`: Mensaje descriptivo
- `actionText`: Texto del botón
- `actionLink`: Ruta para router-link
- `size`: small, medium, large

---

### Badge
Etiquetas pequeñas para estados, categorías, etc.

```vue
<Badge text="Pendiente" color="warning" />
<Badge text="Completada" color="success" dot />
<Badge text="Alta prioridad" color="error" variant="solid" />
<Badge text="JavaScript" color="blue" removable @remove="handleRemove" />
```

**Props:**
- `text`: Texto del badge
- `color`: success, warning, error, info, gray, blue, green, yellow, red, purple, pink
- `size`: small, medium, large
- `variant`: light (default), solid, outline
- `dot`: Mostrar punto indicador
- `dotPosition`: left, right
- `removable`: Mostrar botón de remover

---

### LoadingSpinner
Indicador de carga.

```vue
<!-- Inline -->
<LoadingSpinner size="medium" text="Cargando..." />

<!-- Full screen overlay -->
<LoadingSpinner overlay size="large" text="Procesando solicitud..." />

<!-- Sin texto -->
<LoadingSpinner size="small" />
```

**Props:**
- `size`: small, medium, large, xlarge
- `text`: Texto opcional
- `overlay`: Mostrar como overlay full-screen
- `dismissible`: Permitir cerrar el overlay
- `center`: Centrar el contenido

---

### StatCard
Tarjeta de métrica para dashboards.

```vue
<StatCard
  title="Tareas Pendientes"
  :value="12"
  icon="tasks"
  color="blue"
  :trend="5.2"
  subtitle="Último mes"
/>

<!-- Con slot personalizado -->
<StatCard title="Usuarios Activos" icon="users" color="green">
  <template #value>
    <span class="text-2xl font-bold">1,234</span>
  </template>
  <template #footer>
    <a href="/users" class="text-sm text-primary-600">Ver todos →</a>
  </template>
</StatCard>
```

**Props:**
- `title`: Título de la métrica (requerido)
- `value`: Valor numérico o string
- `icon`: users, tasks, check, clock, chart, folder, star, alert
- `color`: blue, green, yellow, red, purple, pink, gray
- `trend`: Número positivo o negativo para tendencia
- `subtitle`: Texto adicional
- `clickable`: Hacer la tarjeta clickeable

---

### Avatar
Avatar de usuario con iniciales o imagen.

```vue
<Avatar :user="user" size="medium" />
<Avatar name="Juan Pérez" size="large" />
<Avatar :user="user" status="online" />
<Avatar src="/path/to/image.jpg" size="xl" :rounded="false" />
```

**Props:**
- `user`: Objeto usuario con name, avatar
- `name`: Nombre del usuario
- `src`: URL de la imagen
- `size`: xs, small, medium, large, xl, 2xl
- `rounded`: true (círculo) o false (cuadrado redondeado)
- `bordered`: Añadir borde blanco
- `status`: online, offline, busy, away

---

### ConfirmDialog
Modal de confirmación para acciones importantes.

```vue
<ConfirmDialog
  v-model:visible="showDialog"
  title="¿Eliminar tarea?"
  message="Esta acción no se puede deshacer"
  confirmText="Eliminar"
  cancelText="Cancelar"
  danger
  @confirm="handleDelete"
/>

<!-- Con contenido personalizado -->
<ConfirmDialog
  v-model:visible="showDialog"
  title="Confirmar acción"
  @confirm="handleConfirm"
>
  <p>Contenido personalizado aquí</p>
</ConfirmDialog>
```

**Props:**
- `visible`: Boolean (v-model)
- `title`: Título del diálogo (requerido)
- `message`: Mensaje descriptivo
- `confirmText`: Texto del botón confirmar
- `cancelText`: Texto del botón cancelar
- `danger`: Estilo de acción peligrosa
- `loading`: Estado de carga
- `showCancelButton`: Mostrar botón cancelar
- `showIcon`: Mostrar ícono
- `icon`: warning, danger, info, success, question

---

## Componentes de Gráficos

### SimpleBarChart
Gráfico de barras simple y responsive.

```vue
<SimpleBarChart
  :data="[10, 25, 15, 30, 20]"
  :labels="['Lun', 'Mar', 'Mié', 'Jue', 'Vie']"
  :colors="['#3B82F6']"
  title="Tareas por día"
  :height="300"
/>

<!-- Con múltiples colores -->
<SimpleBarChart
  :data="taskStats"
  :labels="weekDays"
  :colors="['#3B82F6', '#10B981', '#F59E0B']"
  showLegend
/>
```

**Props:**
- `data`: Array de números (requerido)
- `labels`: Array de etiquetas (requerido)
- `colors`: Array de colores (hex)
- `title`: Título del gráfico
- `height`: Altura en pixels
- `showLegend`: Mostrar leyenda
- `valuePrefix`: Prefijo para valores (ej: "$")
- `valueSuffix`: Sufijo para valores (ej: "%")

---

### SimpleDoughnutChart
Gráfico de dona para proporciones.

```vue
<SimpleDoughnutChart
  :data="[30, 45, 25]"
  :labels="['Completadas', 'En Progreso', 'Pendientes']"
  :colors="['#10B981', '#3B82F6', '#F59E0B']"
  title="Estado de Tareas"
  :size="240"
/>
```

**Props:**
- `data`: Array de números (requerido)
- `labels`: Array de etiquetas (requerido)
- `colors`: Array de colores (hex)
- `title`: Título del gráfico
- `size`: Tamaño en pixels
- `thickness`: Grosor del anillo (0-1)
- `showTotal`: Mostrar total en el centro
- `totalLabel`: Etiqueta del total

---

## Importación

```javascript
// Importar componentes individuales
import { EmptyState, Badge, StatCard } from '@/components/common'
import { SimpleBarChart, SimpleDoughnutChart } from '@/components/charts'

// O importar directamente
import EmptyState from '@/components/common/EmptyState.vue'
```

---

## Colores Disponibles

- **success/green**: Acciones positivas, completado
- **warning/yellow**: Advertencias, pendiente
- **error/red**: Errores, peligro
- **info/blue**: Información, en progreso
- **purple**: Administrativo
- **pink**: Destacado

---

## Ejemplos Prácticos

### Dashboard con métricas
```vue
<div class="grid grid-cols-1 md:grid-cols-4 gap-6">
  <StatCard
    title="Total Usuarios"
    :value="users.length"
    icon="users"
    color="blue"
  />
  <StatCard
    title="Tareas Completadas"
    :value="completedTasks"
    icon="check"
    color="green"
    :trend="12.5"
  />
</div>
```

### Lista con estado vacío
```vue
<div v-if="tasks.length > 0">
  <TaskCard v-for="task in tasks" :key="task.id" :task="task" />
</div>
<EmptyState
  v-else
  icon="clipboard"
  title="No hay tareas"
  message="Comienza creando tu primera tarea"
  actionText="Nueva Tarea"
  actionLink="/tasks/new"
/>
```

### Confirmación de eliminación
```vue
<template>
  <button @click="showConfirm = true">Eliminar</button>

  <ConfirmDialog
    v-model:visible="showConfirm"
    title="¿Eliminar usuario?"
    message="Esta acción eliminará permanentemente el usuario y todos sus datos"
    confirmText="Sí, eliminar"
    cancelText="Cancelar"
    danger
    :loading="isDeleting"
    @confirm="deleteUser"
  />
</template>

<script setup>
import { ref } from 'vue'
import { ConfirmDialog } from '@/components/common'

const showConfirm = ref(false)
const isDeleting = ref(false)

const deleteUser = async () => {
  isDeleting.value = true
  try {
    await api.deleteUser(userId)
    showConfirm.value = false
    toast.success('Usuario eliminado')
  } finally {
    isDeleting.value = false
  }
}
</script>
```
