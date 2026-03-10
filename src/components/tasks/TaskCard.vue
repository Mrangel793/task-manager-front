<template>
  <div
    :class="[cardClasses, urgency.cardClass, { 'opacity-75': isSyncing, 'border-orange-300': hasSyncError }]"
    class="bg-white rounded-lg shadow-md p-5 cursor-pointer transition-all hover:shadow-lg relative overflow-hidden border-2 border-transparent"
    @click="handleClick"
  >
    <!-- Badge de urgencia (solo si es urgente o vencida) -->
    <div
      v-if="urgency.level === 'overdue' || urgency.level === 'urgent'"
      class="absolute top-3 right-3"
    >
      <span :class="urgency.badgeClass" class="text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
        </svg>
        {{ urgency.level === 'overdue' ? 'VENCIDA' : 'URGENTE' }}
      </span>
    </div>

    <!-- Indicador de sincronización pendiente -->
    <div
      v-if="isSyncing"
      class="absolute top-3 right-3 flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full"
    >
      <svg class="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      Sincronizando...
    </div>

    <!-- Indicador de error de sincronización -->
    <div
      v-if="hasSyncError"
      class="bg-orange-50 border border-orange-200 rounded-md p-3 mb-3"
    >
      <div class="flex items-center gap-2 mb-2">
        <svg class="w-4 h-4 text-orange-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <span class="text-xs font-semibold text-orange-700">Error al sincronizar</span>
      </div>
      <p v-if="task._errorMessage" class="text-xs text-orange-600 mb-2">{{ task._errorMessage }}</p>
      <div class="flex gap-2">
        <button
          @click.stop="handleRetry"
          class="text-xs font-medium text-white bg-orange-500 hover:bg-orange-600 px-3 py-1 rounded transition-colors"
        >
          Reintentar
        </button>
        <button
          @click.stop="handleDiscard"
          class="text-xs font-medium text-orange-700 bg-orange-100 hover:bg-orange-200 px-3 py-1 rounded transition-colors"
        >
          Descartar
        </button>
      </div>
    </div>

    <!-- Nombre de la tarea -->
    <div class="mb-3">
      <h3 class="text-lg font-bold text-gray-900 pr-20 mb-1">{{ task.title }}</h3>
    </div>

    <!-- Descripción -->
    <div v-if="task.description" class="mb-4">
      <p class="text-sm text-gray-600 line-clamp-2">
        {{ task.description }}
      </p>
    </div>

    <!-- Información de la tarea -->
    <div class="space-y-2.5 mb-4">
      <!-- Fecha Inicio -->
      <div v-if="task.created_at" class="flex items-start gap-2 text-sm">
        <div class="flex items-center gap-1.5 min-w-[110px]">
          <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-gray-500 font-medium">Fecha Inicio:</span>
        </div>
        <span class="text-gray-700">{{ formatCreatedDate }}</span>
      </div>

      <!-- Fecha Fin -->
      <div class="flex items-start gap-2 text-sm">
        <div class="flex items-center gap-1.5 min-w-[110px]">
          <svg class="w-4 h-4 flex-shrink-0" :class="urgency.textClass || 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span class="font-medium" :class="urgency.textClass || 'text-gray-500'">Fecha Fin:</span>
        </div>
        <span class="font-medium" :class="urgency.textClass || 'text-gray-700'">{{ formattedDate }}</span>
      </div>

      <!-- Asignado a -->
      <div v-if="assignedUser" class="flex items-start gap-2 text-sm">
        <div class="flex items-center gap-1.5 min-w-[110px]">
          <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span class="text-gray-500 font-medium">Asignado a:</span>
        </div>
        <div class="flex items-center gap-1.5">
          <Avatar :user="assignedUser" size="xs" />
          <span class="text-gray-700">{{ assignedUser.name }}</span>
        </div>
      </div>

      <!-- Estado -->
      <div class="flex items-start gap-2 text-sm">
        <div class="flex items-center gap-1.5 min-w-[110px]">
          <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-gray-500 font-medium">Estado:</span>
        </div>
        <TaskStatusDropdown
          :task="task"
          @change="handleStatusChange"
          @request-complete="handleRequestComplete"
        />
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center justify-end pt-3 border-t border-gray-100">
      <!-- Ver detalles -->
      <button
        @click.stop="handleClick"
        class="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 transition-colors"
      >
        Ver detalles
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores'
import { useTaskStore } from '@/stores/task.store'
import { getTaskUrgency } from '@/utils/taskHelpers'
import TaskStatusDropdown from './TaskStatusDropdown.vue'
import Avatar from '@/components/common/Avatar.vue'

const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  users: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['status-change', 'click', 'request-complete'])

const authStore = useAuthStore()
const taskStore = useTaskStore()

const isSyncing = computed(() => props.task._isPending && !props.task._syncError)
const hasSyncError = computed(() => !!props.task._syncError)

function handleRetry() {
  taskStore.retrySyncTask(props.task.id).catch(() => {})
}

function handleDiscard() {
  taskStore.removePendingTask(props.task.id)
}

// Calcular urgencia
const urgency = computed(() => getTaskUrgency(props.task))

const formattedDate = computed(() => {
  if (!props.task.due_date) return 'Sin fecha límite'

  const date = new Date(props.task.due_date)
  const dateStr = date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })

  // Verificar si la fecha incluye hora (timestamp ISO o si existe due_time)
  const hasTime = props.task.due_time || props.task.due_date.includes('T')

  if (hasTime) {
    const timeStr = date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
    })
    return `${dateStr} ${timeStr}`
  }

  return dateStr
})

const formatCreatedDate = computed(() => {
  if (!props.task.created_at) return ''
  const date = new Date(props.task.created_at)
  const dateStr = date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
  const timeStr = date.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit'
  })
  return `${dateStr} ${timeStr}`
})

const cardClasses = computed(() => {
  return 'relative pl-5'
})

// Usuario asignado
const assignedUser = computed(() => {
  // Si el backend envía el objeto assignee directamente
  if (props.task.assignee && typeof props.task.assignee === 'object') {
    return props.task.assignee
  }

  // Fallback para compatibilidad con estructuras antiguas
  const assigneeId = props.task.assignee_id || props.task.assigned_to
  const assigneeName = props.task.assigned_to_name || props.task.assignee_name

  // Si no hay ID ni nombre, no hay usuario asignado
  if (!assigneeId && !assigneeName) return null

  // Si hay ID, buscar en el array de usuarios
  if (assigneeId && props.users.length > 0) {
    const user = props.users.find(u => u.id === assigneeId)
    if (user) return user
  }

  // Si no se encuentra en el array o no hay users, usar la info de la tarea
  return {
    id: assigneeId || 'unknown',
    name: assigneeName || 'Usuario sin nombre',
    email: props.task.assigned_to_email || ''
  }
})

const handleClick = () => {
  emit('click', props.task)
}

const handleStatusChange = ({ task, newStatus }) => {
  emit('status-change', { task, newStatus })
}

const handleRequestComplete = ({ task }) => {
  emit('request-complete', { task })
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
