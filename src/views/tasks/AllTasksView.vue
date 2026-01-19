<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Todas las Tareas</h1>
          <p class="text-sm text-gray-600 mt-1">
            {{ tasksCount.total }} tareas totales • {{ tasksCount.pending }} pendientes • {{ tasksCount.completed }} completadas
          </p>
        </div>
        <BaseButton
          v-if="canCreateTask"
          variant="primary"
          @click="openCreateModal"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nueva Tarea
        </BaseButton>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Search -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Buscar tareas..."
            class="input-field w-full"
          >
        </div>

        <!-- Status -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select v-model="filters.status" class="input-field w-full">
            <option value="all">Todos</option>
            <option value="Pendiente">Pendientes</option>
            <option value="En Progreso">En Progreso</option>
            <option value="Completada">Completadas</option>
          </select>
        </div>

        <!-- Priority -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
          <select v-model="filters.priority" class="input-field w-full">
            <option value="all">Todas</option>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>
        </div>

        <!-- Assignee -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Asignado a</label>
          <select v-model="filters.assignee" class="input-field w-full">
            <option value="all">Todos</option>
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Advanced filters toggle -->
      <button
        @click="showAdvancedFilters = !showAdvancedFilters"
        class="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center"
      >
        <svg
          class="w-4 h-4 mr-1 transition-transform"
          :class="{ 'rotate-180': showAdvancedFilters }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
        {{ showAdvancedFilters ? 'Ocultar' : 'Mostrar' }} filtros avanzados
      </button>

      <!-- Advanced filters -->
      <div v-if="showAdvancedFilters" class="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Fecha desde</label>
          <input
            v-model="filters.dateFrom"
            type="date"
            class="input-field w-full"
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Fecha hasta</label>
          <input
            v-model="filters.dateTo"
            type="date"
            class="input-field w-full"
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Mostrar</label>
          <select v-model="filters.showOverdue" class="input-field w-full">
            <option value="all">Todas las tareas</option>
            <option value="overdue">Solo vencidas</option>
            <option value="not-overdue">No vencidas</option>
          </select>
        </div>
      </div>
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

    <!-- Content -->
    <div>
      <!-- Loading -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>

      <!-- Empty state -->
      <div v-else-if="filteredTasks.length === 0" class="text-center py-12 bg-white rounded-lg shadow">
        <svg class="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-900">No hay tareas</h3>
        <p class="mt-2 text-sm text-gray-500">
          No se encontraron tareas con los filtros aplicados
        </p>
        <BaseButton variant="secondary" class="mt-4" @click="clearFilters">
          Limpiar filtros
        </BaseButton>
      </div>

      <!-- Tasks List (Asana style) -->
      <div v-else class="bg-white rounded-lg shadow overflow-hidden">
        <!-- Table Header -->
        <div class="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div class="col-span-4">Nombre de tarea</div>
          <div class="col-span-2">Asignado</div>
          <div class="col-span-2">Fecha límite</div>
          <div class="col-span-2">Prioridad</div>
          <div class="col-span-2">Estado</div>
        </div>

        <!-- Task Rows -->
        <div class="divide-y divide-gray-100">
          <div
            v-for="task in filteredTasks"
            :key="task.id"
            @click="viewTask(task)"
            class="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-gray-50 cursor-pointer transition-colors group"
            :class="{ 'bg-green-50/50': task.status === 'Completada' }"
          >
            <!-- Task name with checkbox -->
            <div class="col-span-4 flex items-center min-w-0">
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
              <div class="min-w-0 flex-1">
                <span
                  class="block truncate text-sm"
                  :class="task.status === 'Completada' ? 'text-gray-400 line-through' : 'text-gray-900 font-medium'"
                >
                  {{ task.title }}
                </span>
                <span v-if="task.description" class="block text-xs text-gray-500 truncate">
                  {{ task.description }}
                </span>
              </div>
            </div>

            <!-- Assignee -->
            <div class="col-span-2 flex items-center">
              <div
                class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium mr-2 flex-shrink-0"
                :class="getAvatarColor(getAssigneeName(task))"
              >
                {{ getInitials(getAssigneeName(task)) }}
              </div>
              <span class="text-sm text-gray-600 truncate hidden lg:block">
                {{ getAssigneeName(task) }}
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

            <!-- Status -->
            <div class="col-span-2" @click.stop>
              <select
                v-if="canChangeTaskStatus(task)"
                v-model="task.status"
                @change="handleStatusChange(task)"
                class="text-xs font-medium px-2.5 py-1 rounded border-0 focus:ring-2 focus:ring-primary-500 cursor-pointer"
                :class="getStatusSelectClass(task.status)"
              >
                <option value="Pendiente">Pendiente</option>
                <option value="En Progreso">En Progreso</option>
                <option value="Completada">Completada</option>
              </select>
              <span
                v-else
                class="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium"
                :class="getStatusBadgeClass(task.status)"
              >
                {{ task.status }}
              </span>
            </div>
          </div>
        </div>

        <!-- Add task row -->
        <div
          v-if="canCreateTask"
          class="px-4 py-3 border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
          @click="openCreateModal"
        >
          <div class="flex items-center text-gray-400 text-sm">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Agregar tarea...
          </div>
        </div>
      </div>
    </div>

    <!-- Task Modal -->
    <TaskModal
      :is-open="isModalOpen"
      :task="selectedTaskForEdit"
      :users="users"
      @save="handleSaveTask"
      @cancel="closeModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTaskStore, useAuthStore } from '@/stores'
import { userService } from '@/services'
import { useToast } from '@/composables/useToast'
import BaseButton from '@/components/common/BaseButton.vue'
import TaskModal from '@/components/tasks/TaskModal.vue'

const router = useRouter()
const taskStore = useTaskStore()
const authStore = useAuthStore()
const toast = useToast()

const loading = ref(false)
const currentTab = ref('all')
const isModalOpen = ref(false)
const selectedTaskForEdit = ref(null)
const users = ref([])
const showAdvancedFilters = ref(false)

const filters = ref({
  search: '',
  status: 'all',
  priority: 'all',
  assignee: 'all',
  dateFrom: null,
  dateTo: null,
  showOverdue: 'all'
})

const tasksCount = computed(() => taskStore.tasksCount)

const tabs = computed(() => [
  { value: 'all', label: 'Todas', count: taskStore.tasks.length },
  { value: 'pending', label: 'Pendientes', count: taskStore.pendingTasks.length },
  { value: 'completed', label: 'Completadas', count: taskStore.completedTasks.length }
])

const filteredTasks = computed(() => {
  let tasks = taskStore.tasks

  // Filtrar por tab
  if (currentTab.value === 'pending') {
    tasks = tasks.filter(t => t.status !== 'Completada')
  } else if (currentTab.value === 'completed') {
    tasks = tasks.filter(t => t.status === 'Completada')
  }

  // Aplicar búsqueda
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    tasks = tasks.filter(t =>
      t.title.toLowerCase().includes(search) ||
      (t.description && t.description.toLowerCase().includes(search))
    )
  }

  // Filtrar por estado
  if (filters.value.status !== 'all') {
    tasks = tasks.filter(t => t.status === filters.value.status)
  }

  // Filtrar por prioridad
  if (filters.value.priority !== 'all') {
    tasks = tasks.filter(t => t.priority === filters.value.priority)
  }

  // Filtrar por asignado
  if (filters.value.assignee !== 'all') {
    tasks = tasks.filter(t =>
      t.assignee_id === filters.value.assignee || t.assigned_to === filters.value.assignee
    )
  }

  // Filtrar por fecha
  if (filters.value.dateFrom) {
    const dateFrom = new Date(filters.value.dateFrom)
    tasks = tasks.filter(t => t.due_date && new Date(t.due_date) >= dateFrom)
  }

  if (filters.value.dateTo) {
    const dateTo = new Date(filters.value.dateTo)
    tasks = tasks.filter(t => t.due_date && new Date(t.due_date) <= dateTo)
  }

  // Filtrar vencidas
  if (filters.value.showOverdue === 'overdue') {
    const today = new Date()
    tasks = tasks.filter(t => t.due_date && new Date(t.due_date) < today && t.status !== 'Completada')
  } else if (filters.value.showOverdue === 'not-overdue') {
    const today = new Date()
    tasks = tasks.filter(t => !t.due_date || new Date(t.due_date) >= today || t.status === 'Completada')
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

const canCreateTask = computed(() => {
  const role = authStore.userRole
  return role === 'admin' || role === 'supervisor' || role === 'operario'
})

const getAssigneeName = (task) => {
  const assigneeId = task.assignee_id || task.assigned_to
  if (!assigneeId) return 'Sin asignar'
  const user = users.value.find(u => u.id === assigneeId)
  return user?.name || task.assignee_name || 'Usuario'
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

const canChangeTaskStatus = (task) => {
  const role = authStore.userRole
  const currentUserId = authStore.currentUser?.id
  const assignedToId = task?.assignee?.id || task?.assignee_id || task?.assigned_to
  const isAssigned = assignedToId === currentUserId

  // Admin y supervisor pueden cambiar cualquier tarea
  if (role === 'admin' || role === 'supervisor') return true
  // Operario solo puede cambiar sus tareas asignadas
  if (role === 'operario' && isAssigned) return true
  return false
}

const getStatusSelectClass = (status) => {
  const classes = {
    'Pendiente': 'bg-yellow-100 text-yellow-800',
    'En Progreso': 'bg-blue-100 text-blue-800',
    'Completada': 'bg-green-100 text-green-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getStatusBadgeClass = (status) => {
  const classes = {
    'Pendiente': 'bg-gray-100 text-gray-700',
    'En Progreso': 'bg-blue-100 text-blue-700',
    'Completada': 'bg-green-100 text-green-700'
  }
  return classes[status] || 'bg-gray-100 text-gray-700'
}

const handleStatusChange = async (task) => {
  try {
    await taskStore.updateTaskStatus(task.id, task.status)
    toast.success('Estado actualizado correctamente')
  } catch (error) {
    toast.error('Error al actualizar el estado')
    await taskStore.fetchTasks()
  }
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

const getPriorityBadgeClass = (priority) => {
  const classes = {
    Alta: 'bg-red-100 text-red-700',
    Media: 'bg-yellow-100 text-yellow-700',
    Baja: 'bg-blue-100 text-blue-700'
  }
  return classes[priority] || 'bg-gray-100 text-gray-700'
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

const viewTask = (task) => {
  router.push(`/tasks/${task.id}`)
}

const clearFilters = () => {
  filters.value = {
    search: '',
    status: 'all',
    priority: 'all',
    assignee: 'all',
    dateFrom: null,
    dateTo: null,
    showOverdue: 'all'
  }
  currentTab.value = 'all'
}

const openCreateModal = () => {
  selectedTaskForEdit.value = null
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedTaskForEdit.value = null
}

const handleSaveTask = async (taskData) => {
  try {
    if (selectedTaskForEdit.value) {
      await taskStore.updateTask(selectedTaskForEdit.value.id, taskData)
      toast.success('Tarea actualizada correctamente')
    } else {
      await taskStore.createTask(taskData)
      toast.success('Tarea creada correctamente')
    }
    closeModal()
  } catch (error) {
    toast.error(error.message || 'Error al guardar la tarea')
  }
}

const loadData = async () => {
  loading.value = true
  try {
    await Promise.all([
      taskStore.fetchTasks(),
      loadUsers()
    ])
  } catch (error) {
    toast.error('Error al cargar los datos')
  } finally {
    loading.value = false
  }
}

const loadUsers = async () => {
  try {
    const data = await userService.getUsers({ active: true })
    if (Array.isArray(data)) {
      users.value = data
    } else if (data.users) {
      users.value = data.users
    } else if (data.data) {
      users.value = data.data
    } else {
      users.value = []
    }

    const currentUser = authStore.user
    if (currentUser && !users.value.find(u => u.id === currentUser.id)) {
      users.value.push({
        id: currentUser.id,
        name: currentUser.name || currentUser.email,
        email: currentUser.email,
        role: currentUser.role
      })
    }
  } catch (error) {
    console.error('Error loading users:', error)
    const currentUser = authStore.user
    if (currentUser) {
      users.value = [{
        id: currentUser.id,
        name: currentUser.name || currentUser.email,
        email: currentUser.email,
        role: currentUser.role
      }]
    }
  }
}

onMounted(async () => {
  await loadData()
})
</script>
