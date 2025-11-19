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

      <!-- Tasks table -->
      <div v-else class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tarea
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Asignado a
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prioridad
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vencimiento
              </th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="task in filteredTasks"
              :key="task.id"
              @click="viewTask(task)"
              class="hover:bg-gray-50 cursor-pointer"
            >
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ task.title }}</div>
                    <div v-if="task.description" class="text-sm text-gray-500 truncate max-w-md">
                      {{ task.description }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ getAssigneeName(task) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getPriorityClass(task.priority)"
                >
                  {{ task.priority }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap" @click.stop>
                <!-- Select para cambiar estado si tiene permisos -->
                <select
                  v-if="canChangeTaskStatus(task)"
                  v-model="task.status"
                  @change="handleStatusChange(task)"
                  class="text-xs font-medium px-2.5 py-0.5 rounded-full border-0 focus:ring-2 focus:ring-primary-500"
                  :class="getStatusSelectClass(task.status)"
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="En Progreso">En Progreso</option>
                  <option value="Completada">Completada</option>
                </select>
                <!-- Badge solo lectura si no tiene permisos -->
                <span
                  v-else
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getStatusClass(task.status)"
                >
                  {{ getStatusLabel(task.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div
                  class="text-sm"
                  :class="isOverdue(task) ? 'text-red-600 font-medium' : 'text-gray-900'"
                >
                  {{ formatDueDate(task.due_date) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click.stop="viewTask(task)"
                  class="text-primary-600 hover:text-primary-900"
                >
                  Ver
                </button>
              </td>
            </tr>
          </tbody>
        </table>
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

  return tasks
})

const canCreateTask = computed(() => {
  const role = authStore.userRole
  return role === 'admin' || role === 'supervisor' || role === 'operario'
})

const getAssigneeName = (task) => {
  const assigneeId = task.assignee_id || task.assigned_to
  const user = users.value.find(u => u.id === assigneeId)
  return user?.name || 'Sin asignar'
}

const canChangeTaskStatus = (task) => {
  const role = authStore.userRole
  const currentUserId = authStore.currentUser?.id
  const assignedToId = task?.assignee?.id
  const isAssigned = assignedToId === currentUserId

  console.log('🔍 canChangeTaskStatus:', {
    taskTitle: task?.title,
    role,
    currentUserId,
    assignedToId,
    isAssigned,
    task: task
  })

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

const handleStatusChange = async (task) => {
  try {
    await taskStore.updateTaskStatus(task.id, task.status)
    toast.success('Estado actualizado correctamente')
  } catch (error) {
    toast.error('Error al actualizar el estado')
    // Recargar para revertir el cambio en la UI
    await taskStore.fetchTasks()
  }
}

const getPriorityClass = (priority) => {
  const classes = {
    Alta: 'bg-red-100 text-red-800',
    Media: 'bg-yellow-100 text-yellow-800',
    Baja: 'bg-blue-100 text-blue-800'
  }
  return classes[priority] || 'bg-gray-100 text-gray-800'
}

const getStatusClass = (status) => {
  const classes = {
    'Pendiente': 'bg-yellow-100 text-yellow-800',
    'En Progreso': 'bg-blue-100 text-blue-800',
    'Completada': 'bg-green-100 text-green-800',
    'Cancelada': 'bg-gray-100 text-gray-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (status) => {
  // El status ya viene en español desde el backend
  return status
}

const isOverdue = (task) => {
  if (!task.due_date || task.status === 'Completada') return false
  const today = new Date()
  const dueDate = new Date(task.due_date)
  return dueDate < today
}

const formatDueDate = (date) => {
  if (!date) return 'Sin fecha'
  const d = new Date(date)
  return d.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
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
    // Obtener todos los usuarios activos para asignación
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

    // Asegurar que el usuario actual esté en la lista (para poder asignarse tareas a sí mismo)
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
    // Si falla, al menos agregar el usuario actual
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
