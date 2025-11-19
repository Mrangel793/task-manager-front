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

      <!-- Tasks grid -->
      <div v-else>
        <!-- Priority groups -->
        <div v-if="currentTab === 'pending'" class="space-y-6">
          <!-- Alta prioridad -->
          <div v-if="tasksByPriority.Alta.length > 0">
            <div class="flex items-center mb-3">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clip-rule="evenodd" />
                </svg>
                Alta Prioridad
              </span>
              <div class="flex-1 ml-3 border-t border-gray-300"></div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <TaskCard
                v-for="task in tasksByPriority.Alta"
                :key="task.id"
                :task="task"
                :users="users"
                @click="handleTaskClick"
                @status-change="handleStatusChange"
              />
            </div>
          </div>

          <!-- Media prioridad -->
          <div v-if="tasksByPriority.Media.length > 0">
            <div class="flex items-center mb-3">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" />
                </svg>
                Media Prioridad
              </span>
              <div class="flex-1 ml-3 border-t border-gray-300"></div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <TaskCard
                v-for="task in tasksByPriority.Media"
                :key="task.id"
                :task="task"
                :users="users"
                @click="handleTaskClick"
                @status-change="handleStatusChange"
              />
            </div>
          </div>

          <!-- Baja prioridad -->
          <div v-if="tasksByPriority.Baja.length > 0">
            <div class="flex items-center mb-3">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clip-rule="evenodd" />
                </svg>
                Baja Prioridad
              </span>
              <div class="flex-1 ml-3 border-t border-gray-300"></div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <TaskCard
                v-for="task in tasksByPriority.Baja"
                :key="task.id"
                :task="task"
                :users="users"
                @click="handleTaskClick"
                @status-change="handleStatusChange"
              />
            </div>
          </div>
        </div>

        <!-- Grid normal para otras pestañas -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <TaskCard
            v-for="task in filteredMyTasks"
            :key="task.id"
            :task="task"
            :users="users"
            @click="handleTaskClick"
            @status-change="handleStatusChange"
          />
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
import TaskCard from '@/components/tasks/TaskCard.vue'

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

  return tasks
})

// Agrupar por prioridad para vista pendientes
const tasksByPriority = computed(() => {
  const tasks = filteredMyTasks.value
  return {
    Alta: tasks.filter(t => t.priority === 'Alta'),
    Media: tasks.filter(t => t.priority === 'Media'),
    Baja: tasks.filter(t => t.priority === 'Baja')
  }
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
    // Manejar si viene como array o en un objeto con data
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
    // No mostrar toast aquí para no molestar al usuario
  }
}

const applyQuickFilter = (filterValue) => {
  activeQuickFilter.value = filterValue
}

const handleTaskClick = (task) => {
  router.push(`/tasks/${task.id}`)
}

const handleStatusChange = async ({ task, newStatus }) => {
  try {
    await taskStore.updateTaskStatus(task.id, newStatus)
    toast.success('Estado actualizado correctamente')
  } catch (error) {
    toast.error('Error al actualizar el estado')
  }
}

onMounted(async () => {
  await Promise.all([
    loadTasks(),
    loadUsers()
  ])
})
</script>
