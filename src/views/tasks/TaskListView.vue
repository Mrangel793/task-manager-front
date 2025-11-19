<template>
  <div>
    <!-- Header stats -->
    <div class="mb-6">
      <p class="text-sm text-gray-600">
        {{ tasksCount.total }} tareas totales • {{ tasksCount.pending }} pendientes • {{ tasksCount.completed }} completadas
      </p>
    </div>

      <!-- Tabs -->
      <div class="mb-6 border-b border-gray-200">
        <nav class="-mb-px flex space-x-4 items-center">
          <!-- Pestaña Todas (fija) -->
          <button
            @click="currentTab = 'all'"
            :class="currentTab === 'all'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors"
          >
            Todas
            <span :class="currentTab === 'all' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-900'"
                  class="ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium">
              {{ taskStore.tasks.length }}
            </span>
          </button>

          <!-- Pestañas personalizadas -->
          <button
            v-for="tab in customTabs"
            :key="tab.id"
            @click="currentTab = tab.id"
            :class="currentTab === tab.id
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors group relative"
            :title="getTabTooltip(tab)"
          >
            <div class="flex items-center gap-2">
              <span>{{ tab.label }}</span>
              <span :class="currentTab === tab.id ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-900'"
                    class="py-0.5 px-2.5 rounded-full text-xs font-medium">
                {{ getCustomTabCount(tab) }}
              </span>
              <!-- Badge de usuarios si hay seleccionados -->
              <span
                v-if="getTabAssigneeNames(tab).length > 0"
                :class="currentTab === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-blue-50 text-blue-600'"
                class="py-0.5 px-2 rounded-full text-xs font-medium flex items-center gap-1"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                {{ getTabAssigneeNames(tab).length }}
              </span>
            </div>
            <!-- Botón eliminar pestaña -->
            <button
              @click.stop="deleteCustomTab(tab.id)"
              class="absolute -top-1 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
              title="Eliminar pestaña"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </button>

          <!-- Botón agregar pestaña -->
          <button
            @click="openTabModal"
            class="whitespace-nowrap py-4 px-2 text-gray-400 hover:text-primary-600 transition-colors"
            title="Agregar pestaña personalizada"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </nav>
      </div>

      <!-- Filters bar -->
      <div class="mb-6 flex flex-col sm:flex-row gap-3">
        <!-- Búsqueda -->
        <div class="flex-1">
          <div class="relative">
            <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Buscar tareas..."
              class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <!-- Filtros -->
        <div class="flex gap-2 flex-wrap sm:flex-nowrap">
          <!-- Estado -->
          <select
            v-model="filters.status"
            class="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="all">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En Progreso">En Progreso</option>
            <option value="Completada">Completada</option>
            <option value="Cancelada">Cancelada</option>
          </select>

          <!-- Prioridad -->
          <select
            v-model="filters.priority"
            class="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="all">Todas las prioridades</option>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>

          <!-- Asignado a -->
          <select
            v-model="filters.assigneeId"
            class="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="all">Todas las personas</option>
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.name }}
            </option>
          </select>

          <!-- Botón limpiar filtros (solo si hay filtros activos) -->
          <button
            v-if="hasActiveFilters"
            @click="clearFilters"
            class="px-4 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
            title="Limpiar filtros"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Content -->
      <div>
        <!-- Loading -->
        <div v-if="loading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>

        <!-- Empty state -->
        <div v-else-if="filteredTasks.length === 0" class="text-center py-12">
          <svg class="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900">No hay tareas</h3>
          <p class="mt-2 text-sm text-gray-500">
            {{ currentTab === 'all' ? 'Crea tu primera tarea para comenzar' : 'No se encontraron tareas con los filtros aplicados' }}
          </p>
        </div>

        <!-- Tasks grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <TaskCard
            v-for="task in filteredTasks"
            :key="task.id"
            :task="task"
            :users="users"
            @click="handleTaskClick"
            @status-change="handleStatusChange"
            @request-complete="handleRequestComplete"
          />
        </div>
      </div>

    <!-- FAB (Floating Action Button) - Solo Admin/Supervisor -->
    <button
      v-if="canCreateTask"
      @click="openCreateModal"
      class="fixed bottom-20 right-6 lg:bottom-6 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-4 shadow-lg transition-colors z-30"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
    </button>

    <!-- Task Modal -->
    <TaskModal
      :is-open="isModalOpen"
      :task="selectedTaskForEdit"
      :users="users"
      @save="handleSaveTask"
      @cancel="closeModal"
    />

    <!-- Confirmation Modal -->
    <div v-if="confirmModal.isOpen" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex min-h-screen items-center justify-center p-4">
        <!-- Overlay -->
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="closeConfirmModal"></div>

        <!-- Modal -->
        <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <!-- Icon -->
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <!-- Content -->
          <div class="text-center mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              {{ confirmModal.title }}
            </h3>
            <p class="text-sm text-gray-500">
              {{ confirmModal.message }}
            </p>
          </div>

          <!-- Actions -->
          <div class="flex gap-3">
            <button
              @click="closeConfirmModal"
              class="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              @click="handleConfirm"
              class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Custom Tab Modal -->
    <div v-if="isTabModalOpen" class="fixed inset-0 z-50 overflow-y-auto" @click.self="closeTabModal">
      <div class="flex min-h-screen items-center justify-center p-4">
        <!-- Overlay -->
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>

        <!-- Modal -->
        <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-2xl font-bold text-gray-900">Nueva Pestaña</h3>
            <button @click="closeTabModal" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleCreateTab" class="space-y-4">
            <!-- Nombre de la pestaña -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la pestaña <span class="text-red-500">*</span>
              </label>
              <input
                v-model="newTabData.label"
                type="text"
                placeholder="Ej: Equipo Marketing"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <!-- Estado -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Filtrar por estado
              </label>
              <select
                v-model="newTabData.status"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Todos los estados</option>
                <option value="Pendiente">Pendiente</option>
                <option value="En Progreso">En Progreso</option>
                <option value="Completada">Completada</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>

            <!-- Prioridad -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Filtrar por prioridad
              </label>
              <select
                v-model="newTabData.priority"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Todas las prioridades</option>
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
              </select>
            </div>

            <!-- Usuarios asignados (múltiples) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por usuarios asignados
              </label>
              <div class="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-2 space-y-1">
                <label
                  v-for="user in users"
                  :key="user.id"
                  class="flex items-center px-3 py-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    :value="user.id"
                    v-model="newTabData.assigneeIds"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span class="ml-3 text-sm text-gray-700">{{ user.name }}</span>
                </label>
                <div v-if="users.length === 0" class="text-sm text-gray-500 text-center py-2">
                  No hay usuarios disponibles
                </div>
              </div>
              <p class="mt-1 text-xs text-gray-500">
                {{ newTabData.assigneeIds.length === 0
                  ? 'Se mostrarán tareas de todos los usuarios'
                  : `${newTabData.assigneeIds.length} usuario(s) seleccionado(s)` }}
              </p>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                @click="closeTabModal"
                class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                Crear Pestaña
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Confirm Complete Dialog -->
    <ConfirmDialog
      :visible="completeConfirmDialog.visible"
      title="¿Tarea terminada?"
      message="Esta acción marcará la tarea como completada"
      confirm-text="Sí, completar"
      cancel-text="Cancelar"
      icon="success"
      @confirm="handleConfirmComplete"
      @cancel="handleCancelComplete"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTaskStore, useAuthStore } from '@/stores'
import { userService } from '@/services'
import { useToast } from '@/composables/useToast'
import TaskCard from '@/components/tasks/TaskCard.vue'
import TaskModal from '@/components/tasks/TaskModal.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const router = useRouter()
const taskStore = useTaskStore()
const authStore = useAuthStore()
const toast = useToast()

const currentTab = ref('all')
const loading = ref(false)
const isModalOpen = ref(false)
const isTabModalOpen = ref(false)
const selectedTaskForEdit = ref(null)
const users = ref([])
const customTabs = ref([])

const confirmModal = ref({
  isOpen: false,
  title: '',
  message: '',
  onConfirm: null
})

const completeConfirmDialog = ref({
  visible: false,
  task: null
})

const filters = ref({
  search: '',
  status: 'all',
  priority: 'all',
  assigneeId: 'all',
  dateFrom: null,
  dateTo: null
})

const newTabData = ref({
  label: '',
  status: 'all',
  priority: 'all',
  assigneeIds: [] // Cambiado a array para múltiples usuarios
})

const tasksCount = computed(() => taskStore.tasksCount)

const filteredTasks = computed(() => {
  let tasks = taskStore.tasks

  // Filtrar por pestaña personalizada
  if (currentTab.value !== 'all') {
    const customTab = customTabs.value.find(t => t.id === currentTab.value)
    if (customTab) {
      tasks = applyCustomTabFilters(tasks, customTab)
    }
  }

  // Aplicar filtros adicionales
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    tasks = tasks.filter(t =>
      t.title.toLowerCase().includes(search) ||
      (t.description && t.description.toLowerCase().includes(search))
    )
  }

  if (filters.value.status !== 'all') {
    tasks = tasks.filter(t => t.status === filters.value.status)
  }

  if (filters.value.priority !== 'all') {
    tasks = tasks.filter(t => t.priority === filters.value.priority)
  }

  if (filters.value.assigneeId !== 'all') {
    tasks = tasks.filter(t => {
      const assigneeId = t.assignee?.id || t.assignee_id || t.assigned_to
      return assigneeId === filters.value.assigneeId
    })
  }

  return tasks
})

// Función para aplicar filtros de pestaña personalizada
const applyCustomTabFilters = (tasks, tab) => {
  let filtered = tasks

  if (tab.filters.status && tab.filters.status !== 'all') {
    filtered = filtered.filter(t => t.status === tab.filters.status)
  }

  if (tab.filters.priority && tab.filters.priority !== 'all') {
    filtered = filtered.filter(t => t.priority === tab.filters.priority)
  }

  // Soporte para múltiples usuarios
  if (tab.filters.assigneeIds && tab.filters.assigneeIds.length > 0) {
    filtered = filtered.filter(t => {
      const assigneeId = t.assignee?.id || t.assignee_id || t.assigned_to
      return tab.filters.assigneeIds.includes(assigneeId)
    })
  }
  // Soporte legacy para assigneeId único (retrocompatibilidad)
  else if (tab.filters.assigneeId && tab.filters.assigneeId !== 'all') {
    filtered = filtered.filter(t => {
      const assigneeId = t.assignee?.id || t.assignee_id || t.assigned_to
      return assigneeId === tab.filters.assigneeId
    })
  }

  return filtered
}

// Calcular cantidad de tareas en pestaña personalizada
const getCustomTabCount = (tab) => {
  return applyCustomTabFilters(taskStore.tasks, tab).length
}

// Obtener nombres de usuarios asignados a la pestaña
const getTabAssigneeNames = (tab) => {
  if (!tab.filters.assigneeIds || tab.filters.assigneeIds.length === 0) {
    // Soporte legacy para assigneeId único
    if (tab.filters.assigneeId && tab.filters.assigneeId !== 'all') {
      const user = users.value.find(u => u.id === tab.filters.assigneeId)
      return user ? [user.name] : []
    }
    return []
  }

  return tab.filters.assigneeIds
    .map(id => {
      const user = users.value.find(u => u.id === id)
      return user ? user.name : null
    })
    .filter(name => name !== null)
}

// Obtener tooltip con información de la pestaña
const getTabTooltip = (tab) => {
  const parts = []

  // Usuarios
  const userNames = getTabAssigneeNames(tab)
  if (userNames.length > 0) {
    parts.push(`Usuarios: ${userNames.join(', ')}`)
  }

  // Estado
  if (tab.filters.status && tab.filters.status !== 'all') {
    parts.push(`Estado: ${tab.filters.status}`)
  }

  // Prioridad
  if (tab.filters.priority && tab.filters.priority !== 'all') {
    parts.push(`Prioridad: ${tab.filters.priority}`)
  }

  return parts.length > 0 ? parts.join(' | ') : 'Sin filtros adicionales'
}

const canCreateTask = computed(() => {
  const role = authStore.userRole
  return role === 'admin' || role === 'supervisor' || role === 'operario'
})

const hasActiveFilters = computed(() => {
  return filters.value.search !== '' ||
    filters.value.status !== 'all' ||
    filters.value.priority !== 'all' ||
    filters.value.assigneeId !== 'all'
})

const clearFilters = () => {
  filters.value = {
    search: '',
    status: 'all',
    priority: 'all',
    assigneeId: 'all',
    dateFrom: null,
    dateTo: null
  }
}

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
    // Obtener todos los usuarios activos para asignación
    const data = await userService.getUsers({ active: true })
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
    console.error('Error al cargar usuarios:', error)
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

const handleRequestComplete = ({ task }) => {
  completeConfirmDialog.value = {
    visible: true,
    task
  }
}

const handleConfirmComplete = async () => {
  const task = completeConfirmDialog.value.task
  if (!task) return

  try {
    await taskStore.updateTaskStatus(task.id, 'Completada')
    toast.success('Tarea completada correctamente')
    completeConfirmDialog.value = {
      visible: false,
      task: null
    }
  } catch (error) {
    toast.error('Error al completar la tarea')
  }
}

const handleCancelComplete = () => {
  completeConfirmDialog.value = {
    visible: false,
    task: null
  }
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

// Funciones para pestañas personalizadas
const loadCustomTabs = () => {
  try {
    const saved = localStorage.getItem('customTabs')
    if (saved) {
      customTabs.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('Error al cargar pestañas:', error)
  }
}

const saveCustomTabs = () => {
  try {
    localStorage.setItem('customTabs', JSON.stringify(customTabs.value))
  } catch (error) {
    console.error('Error al guardar pestañas:', error)
  }
}

const openTabModal = () => {
  // Resetear datos del formulario
  newTabData.value = {
    label: '',
    status: 'all',
    priority: 'all',
    assigneeIds: [] // Array vacío para múltiples usuarios
  }
  isTabModalOpen.value = true
}

const closeTabModal = () => {
  isTabModalOpen.value = false
}

const handleCreateTab = () => {
  if (!newTabData.value.label.trim()) {
    toast.error('El nombre de la pestaña es requerido')
    return
  }

  createCustomTab(newTabData.value)
}

const createCustomTab = (tabData) => {
  const newTab = {
    id: `tab_${Date.now()}`,
    label: tabData.label,
    filters: {
      status: tabData.status || 'all',
      priority: tabData.priority || 'all',
      assigneeIds: tabData.assigneeIds || [] // Usar array de IDs
    }
  }

  customTabs.value.push(newTab)
  saveCustomTabs()
  closeTabModal()
  toast.success('Pestaña creada correctamente')

  // Cambiar a la nueva pestaña
  currentTab.value = newTab.id
}

const deleteCustomTab = (tabId) => {
  const tab = customTabs.value.find(t => t.id === tabId)
  if (!tab) return

  confirmModal.value = {
    isOpen: true,
    title: 'Eliminar pestaña',
    message: `¿Estás seguro de eliminar la pestaña "${tab.label}"? Esta acción no se puede deshacer.`,
    onConfirm: () => {
      customTabs.value = customTabs.value.filter(t => t.id !== tabId)
      saveCustomTabs()

      // Si estamos en la pestaña eliminada, volver a "Todas"
      if (currentTab.value === tabId) {
        currentTab.value = 'all'
      }

      toast.success('Pestaña eliminada')
      closeConfirmModal()
    }
  }
}

const closeConfirmModal = () => {
  confirmModal.value = {
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  }
}

const handleConfirm = () => {
  if (confirmModal.value.onConfirm) {
    confirmModal.value.onConfirm()
  }
}

onMounted(async () => {
  loadCustomTabs()
  await Promise.all([
    loadTasks(),
    loadUsers()
  ])
})
</script>
