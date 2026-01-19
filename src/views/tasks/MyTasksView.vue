<template>
  <div>
    <!-- Header stats -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Mis Tareas</h1>
      <p class="text-sm text-gray-600">
        {{ myTasksCount.total }} tareas asignadas • {{ myTasksCount.pending }} pendientes • {{ myTasksCount.completed }} completadas
      </p>
    </div>

    <!-- Tabs -->
    <div class="mb-6 border-b border-gray-200">
      <nav class="-mb-px flex space-x-8">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          @click="currentTab = tab.value"
          :class="currentTab === tab.value
            ? 'border-primary-500 text-primary-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors"
        >
          {{ tab.label }}
          <span :class="currentTab === tab.value ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-900'"
                class="ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium">
            {{ tab.count }}
          </span>
        </button>
      </nav>
    </div>

    <!-- Quick filters -->
    <div class="mb-6 flex flex-wrap gap-2">
      <button
        v-for="filter in quickFilters"
        :key="filter.value"
        @click="applyQuickFilter(filter.value)"
        :class="activeQuickFilter === filter.value
          ? 'bg-primary-600 text-white'
          : 'bg-white text-gray-700 hover:bg-gray-50'"
        class="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-full text-sm font-medium transition-colors"
      >
        <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="filter.icon" />
        </svg>
        {{ filter.label }}
      </button>
    </div>

    <!-- Content -->
    <div>
      <!-- Loading -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>

      <!-- Empty state -->
      <div v-else-if="filteredMyTasks.length === 0" class="text-center py-12 bg-white rounded-lg shadow">
        <svg class="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-900">No hay tareas</h3>
        <p class="mt-2 text-sm text-gray-500">
          {{ getEmptyStateMessage }}
        </p>
      </div>

      <!-- Tasks List (Asana style) -->
      <div v-else class="bg-white rounded-lg shadow overflow-hidden">
        <!-- Table Header -->
        <div class="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div class="col-span-5">Nombre de tarea</div>
          <div class="col-span-2">Asignado</div>
          <div class="col-span-2">Fecha límite</div>
          <div class="col-span-2">Prioridad</div>
          <div class="col-span-1">Estado</div>
        </div>

        <!-- Task Rows -->
        <div class="divide-y divide-gray-100">
          <div
            v-for="task in filteredMyTasks"
            :key="task.id"
            @click="handleTaskClick(task)"
            class="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-gray-50 cursor-pointer transition-colors group"
            :class="{ 'bg-green-50/50': task.status === 'Completada' }"
          >
            <!-- Task name with checkbox -->
            <div class="col-span-5 flex items-center min-w-0">
              <button
                @click.stop="toggleTaskComplete(task)"
                class="flex-shrink-0 w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center transition-colors"
                :class="task.status === 'Completada'
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 hover:border-green-400 group-hover:border-green-400'"
              >
                <svg v-if="task.status === 'Completada'" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
              <span
                class="truncate text-sm"
                :class="task.status === 'Completada' ? 'text-gray-400 line-through' : 'text-gray-900 font-medium'"
              >
                {{ task.title }}
              </span>
            </div>

            <!-- Assignee -->
            <div class="col-span-2 flex items-center">
              <div
                class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium mr-2"
                :class="getAvatarColor(task.assignee_name || getAssigneeName(task))"
              >
                {{ getInitials(task.assignee_name || getAssigneeName(task)) }}
              </div>
              <span class="text-sm text-gray-600 truncate hidden sm:block">
                {{ task.assignee_name || getAssigneeName(task) }}
              </span>
            </div>

            <!-- Due date -->
            <div class="col-span-2 flex items-center">
              <svg class="w-4 h-4 mr-1.5 flex-shrink-0" :class="getDueDateColor(task)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span class="text-sm" :class="getDueDateColor(task)">
                {{ formatDueDate(task.due_date) }}
              </span>
            </div>

            <!-- Priority badge -->
            <div class="col-span-2">
              <span
                class="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium"
                :class="getPriorityBadgeClass(task.priority)"
              >
                {{ task.priority }}
              </span>
            </div>

            <!-- Status badge -->
            <div class="col-span-1">
              <span
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                :class="getStatusBadgeClass(task.status)"
              >
                {{ getStatusShort(task.status) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Add task row (optional) -->
        <div class="px-4 py-3 border-t border-gray-100 hover:bg-gray-50 cursor-pointer" @click="showAddTaskHint">
          <div class="flex items-center text-gray-400 text-sm">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Agregar tarea...
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTaskStore, useAuthStore } from '@/stores'
import { userService } from '@/services'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const taskStore = useTaskStore()
const authStore = useAuthStore()
const toast = useToast()

const currentTab = ref('pending')
const activeQuickFilter = ref('all')
const loading = ref(false)
const users = ref([])

const quickFilters = [
  { value: 'all', label: 'Todas', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
  { value: 'today', label: 'Hoy', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { value: 'thisWeek', label: 'Esta semana', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { value: 'overdue', label: 'Vencidas', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' }
]

// Obtener solo las tareas del usuario actual
const myTasks = computed(() => {
  const userId = authStore.user?.id
  if (!userId) return []

  return taskStore.tasks.filter(task => task.assignee_id === userId || task.assigned_to === userId)
})

const myTasksCount = computed(() => {
  const pending = myTasks.value.filter(t => t.status !== 'Completada').length
  const completed = myTasks.value.filter(t => t.status === 'Completada').length

  return {
    total: myTasks.value.length,
    pending,
    completed
  }
})

const tabs = computed(() => [
  { value: 'pending', label: 'Pendientes', count: myTasksCount.value.pending },
  { value: 'completed', label: 'Completadas', count: myTasksCount.value.completed },
  { value: 'all', label: 'Todas', count: myTasksCount.value.total }
])

const filteredMyTasks = computed(() => {
  let tasks = myTasks.value

  // Filtrar por tab
  if (currentTab.value === 'pending') {
    tasks = tasks.filter(t => t.status !== 'Completada')
  } else if (currentTab.value === 'completed') {
    tasks = tasks.filter(t => t.status === 'Completada')
  }

  // Aplicar filtro rápido
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

  if (activeQuickFilter.value === 'today') {
    tasks = tasks.filter(t => {
      if (!t.due_date) return false
      const dueDate = new Date(t.due_date)
      return dueDate >= today && dueDate < new Date(today.getTime() + 24 * 60 * 60 * 1000)
    })
  } else if (activeQuickFilter.value === 'thisWeek') {
    tasks = tasks.filter(t => {
      if (!t.due_date) return false
      const dueDate = new Date(t.due_date)
      return dueDate >= today && dueDate <= weekEnd
    })
  } else if (activeQuickFilter.value === 'overdue') {
    tasks = tasks.filter(t => {
      if (!t.due_date || t.status === 'Completada') return false
      const dueDate = new Date(t.due_date)
      return dueDate < today
    })
  }

  // Ordenar: primero por prioridad, luego por fecha
  const priorityOrder = { 'Alta': 0, 'Media': 1, 'Baja': 2 }
  tasks = [...tasks].sort((a, b) => {
    const pA = priorityOrder[a.priority] ?? 3
    const pB = priorityOrder[b.priority] ?? 3
    if (pA !== pB) return pA - pB

    if (!a.due_date && !b.due_date) return 0
    if (!a.due_date) return 1
    if (!b.due_date) return -1
    return new Date(a.due_date) - new Date(b.due_date)
  })

  return tasks
})

const getEmptyStateMessage = computed(() => {
  if (currentTab.value === 'completed') {
    return 'Aún no has completado ninguna tarea'
  }
  if (activeQuickFilter.value === 'today') {
    return 'No tienes tareas para hoy'
  }
  if (activeQuickFilter.value === 'thisWeek') {
    return 'No tienes tareas para esta semana'
  }
  if (activeQuickFilter.value === 'overdue') {
    return 'No tienes tareas vencidas'
  }
  return 'No tienes tareas asignadas'
})

const loadTasks = async () => {
  loading.value = true
  try {
    await taskStore.fetchTasks()
  } catch (error) {
    toast.error('Error al cargar las tareas')
  } finally {
    loading.value = false
  }
}

const loadUsers = async () => {
  try {
    const data = await userService.getOperators()
    if (Array.isArray(data)) {
      users.value = data
    } else if (data.users && Array.isArray(data.users)) {
      users.value = data.users
    } else if (data.data && Array.isArray(data.data)) {
      users.value = data.data
    } else {
      users.value = []
    }
  } catch (error) {
    console.error('Error al cargar usuarios:', error)
  }
}

const applyQuickFilter = (filterValue) => {
  activeQuickFilter.value = filterValue
}

const handleTaskClick = (task) => {
  router.push(`/tasks/${task.id}`)
}

const toggleTaskComplete = async (task) => {
  try {
    const newStatus = task.status === 'Completada' ? 'Pendiente' : 'Completada'
    await taskStore.updateTaskStatus(task.id, newStatus)
    toast.success(newStatus === 'Completada' ? 'Tarea completada' : 'Tarea reabierta')
  } catch (error) {
    toast.error('Error al actualizar el estado')
  }
}

const getAssigneeName = (task) => {
  const assigneeId = task.assignee_id || task.assigned_to
  if (!assigneeId) return 'Sin asignar'
  const user = users.value.find(u => u.id === assigneeId)
  return user?.name || 'Usuario'
}

const getInitials = (name) => {
  if (!name || name === 'Sin asignar') return '?'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const getAvatarColor = (name) => {
  if (!name) return 'bg-gray-200 text-gray-600'
  const colors = [
    'bg-pink-100 text-pink-700',
    'bg-purple-100 text-purple-700',
    'bg-indigo-100 text-indigo-700',
    'bg-blue-100 text-blue-700',
    'bg-cyan-100 text-cyan-700',
    'bg-teal-100 text-teal-700',
    'bg-green-100 text-green-700',
    'bg-yellow-100 text-yellow-700',
    'bg-orange-100 text-orange-700',
    'bg-red-100 text-red-700'
  ]
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
  return colors[index]
}

const formatDueDate = (date) => {
  if (!date) return 'Sin fecha'
  const d = new Date(date)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
  const taskDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())

  if (taskDate.getTime() === today.getTime()) return 'Hoy'
  if (taskDate.getTime() === tomorrow.getTime()) return 'Mañana'

  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
}

const getDueDateColor = (task) => {
  if (!task.due_date) return 'text-gray-400'
  if (task.status === 'Completada') return 'text-gray-400'

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dueDate = new Date(task.due_date)

  if (dueDate < today) return 'text-red-600'
  if (dueDate.getTime() === today.getTime()) return 'text-orange-600'
  return 'text-gray-600'
}

const getPriorityBadgeClass = (priority) => {
  const classes = {
    'Alta': 'bg-red-100 text-red-700',
    'Media': 'bg-yellow-100 text-yellow-700',
    'Baja': 'bg-blue-100 text-blue-700'
  }
  return classes[priority] || 'bg-gray-100 text-gray-700'
}

const getStatusBadgeClass = (status) => {
  const classes = {
    'Pendiente': 'bg-gray-100 text-gray-700',
    'En Progreso': 'bg-blue-100 text-blue-700',
    'Completada': 'bg-green-100 text-green-700'
  }
  return classes[status] || 'bg-gray-100 text-gray-700'
}

const getStatusShort = (status) => {
  const short = {
    'Pendiente': 'Pend.',
    'En Progreso': 'Prog.',
    'Completada': 'Hecho'
  }
  return short[status] || status
}

const showAddTaskHint = () => {
  toast.info('Usa el botón "Nueva Tarea" en la vista de todas las tareas')
}

onMounted(async () => {
  await Promise.all([
    loadTasks(),
    loadUsers()
  ])
})
</script>
