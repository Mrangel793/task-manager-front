<template>
  <div>
    <!-- Breadcrumb -->
      <nav class="flex mb-6" aria-label="Breadcrumb">
        <ol class="inline-flex items-center space-x-1 md:space-x-3">
          <li>
            <router-link to="/tasks" class="text-gray-500 hover:text-gray-700">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </router-link>
          </li>
          <li>
            <div class="flex items-center">
              <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
              <router-link to="/tasks" class="ml-1 text-sm font-medium text-gray-500 hover:text-gray-700">
                Tareas
              </router-link>
            </div>
          </li>
          <li aria-current="page">
            <div class="flex items-center">
              <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
              <span class="ml-1 text-sm font-medium text-gray-500">Detalle</span>
            </div>
          </li>
        </ol>
      </nav>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>

      <!-- Task detail -->
      <div v-else-if="task" class="space-y-6">
        <!-- Card principal -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <!-- Header con acciones -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ task.title }}</h1>
              <div class="flex flex-wrap items-center gap-3">
                <span :class="statusBadgeClass" class="text-sm font-medium px-3 py-1 rounded-full">
                  {{ statusLabel }}
                </span>
                <span :class="priorityBadgeClass" class="text-sm font-medium px-3 py-1 rounded-full">
                  {{ priorityLabel }}
                </span>
              </div>
            </div>

            <!-- Actions -->
            <div v-if="canEdit" class="flex gap-2">
              <button
                @click="handleReassign"
                class="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg"
                title="Reasignar"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </button>
              <button
                @click="handleEdit"
                class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                title="Editar"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                @click="handleDelete"
                class="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg"
                title="Eliminar"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Descripción -->
          <div v-if="task.description" class="mb-6">
            <h3 class="text-sm font-medium text-gray-700 mb-2">Descripción</h3>
            <p class="text-gray-600 whitespace-pre-wrap">{{ task.description }}</p>
          </div>

          <!-- Metadata -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 class="text-sm font-medium text-gray-700 mb-1">Fecha y hora</h3>
              <p class="text-gray-900">{{ formattedDate }}</p>
            </div>

            <div v-if="task.assignee">
              <h3 class="text-sm font-medium text-gray-700 mb-1">Asignado a</h3>
              <p class="text-gray-900">{{ task.assignee.name || task.assignee.phone }}</p>
            </div>

            <div v-if="task.created_at">
              <h3 class="text-sm font-medium text-gray-700 mb-1">Creada el</h3>
              <p class="text-gray-900">{{ formatDateTime(task.created_at) }}</p>
            </div>

            <div v-if="task.updated_at">
              <h3 class="text-sm font-medium text-gray-700 mb-1">Última actualización</h3>
              <p class="text-gray-900">{{ formatDateTime(task.updated_at) }}</p>
            </div>
          </div>

          <!-- Cambio de estado (para operadores y supervisores) -->
          <div v-if="canChangeStatus" class="mt-6 border-t pt-6">
            <h3 class="text-sm font-medium text-gray-700 mb-3">Cambiar estado de la tarea</h3>
            <div class="flex items-center gap-4">
              <div class="flex-1 max-w-xs">
                <select
                  v-model="selectedStatus"
                  @change="handleStatusChangeFromSelect"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  :class="getStatusSelectClass(selectedStatus)"
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="En Progreso">En Progreso</option>
                  <option value="Completada">Completada</option>
                </select>
              </div>
              <div class="text-sm text-gray-500">
                <p v-if="selectedStatus !== task.status" class="flex items-center text-blue-600">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Cambio guardado automáticamente
                </p>
              </div>
            </div>
          </div>

        </div>

        <!-- Historial de cambios -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <!-- Header -->
          <div class="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-4">
            <h2 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Actividad Reciente
            </h2>
          </div>

          <!-- Content -->
          <div class="p-6">
            <!-- Loading state -->
            <div v-if="loadingHistory" class="flex flex-col items-center justify-center py-12">
              <div class="animate-spin rounded-full h-10 w-10 border-3 border-primary-200 border-t-primary-600 mb-3"></div>
              <p class="text-sm text-gray-500">Cargando historial...</p>
            </div>

            <!-- Lista de eventos del historial -->
            <div v-else-if="taskHistory.length > 0" class="space-y-3">
              <div
                v-for="(event, index) in taskHistory"
                :key="event.id || index"
                class="group relative"
              >
                <!-- Timeline connector -->
                <div
                  v-if="index < taskHistory.length - 1"
                  class="absolute left-5 top-11 w-0.5 h-full bg-gray-200"
                ></div>

                <!-- Event card -->
                <div class="flex gap-4">
                  <!-- Icono del evento -->
                  <div class="flex-shrink-0 relative z-10">
                    <div
                      class="w-10 h-10 rounded-full flex items-center justify-center shadow-sm ring-2 ring-white transition-transform group-hover:scale-110"
                      :class="getEventIconClass(event.event_type)"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" :d="getEventIconPath(event.event_type)" />
                      </svg>
                    </div>
                  </div>

                  <!-- Contenido del evento -->
                  <div class="flex-1 bg-gray-50 rounded-lg p-4 group-hover:bg-gray-100 group-hover:shadow-sm transition-all border border-gray-100">
                    <div class="flex items-start justify-between gap-3 mb-2">
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900 leading-relaxed">{{ event.description }}</p>
                      </div>
                      <span
                        v-if="event.event_type"
                        class="flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full"
                        :class="getEventTypeClass(event.event_type)"
                      >
                        {{ getEventTypeLabel(event.event_type) }}
                      </span>
                    </div>

                    <!-- Metadata row -->
                    <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-600">
                      <!-- Usuario -->
                      <div v-if="event.changed_by" class="flex items-center gap-1.5">
                        <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span class="font-medium">{{ event.changed_by.name || event.changed_by.email }}</span>
                      </div>

                      <!-- Fecha -->
                      <div class="flex items-center gap-1.5">
                        <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{{ formatEventDate(event.created_at) }}</span>
                      </div>
                    </div>

                    <!-- Cambios de valores (antes/después) -->
                    <div v-if="formatHistoryValue(event.old_value, event.event_type) || formatHistoryValue(event.new_value, event.event_type)" class="mt-3 flex items-center gap-2 text-xs flex-wrap">
                      <div v-if="formatHistoryValue(event.old_value, event.event_type)" class="flex items-center gap-1.5 bg-white border border-red-200 rounded-md px-3 py-1.5">
                        <span class="text-red-600 font-semibold">De:</span>
                        <span class="text-red-800 font-medium">{{ formatHistoryValue(event.old_value, event.event_type) }}</span>
                      </div>
                      <svg v-if="formatHistoryValue(event.old_value, event.event_type) && formatHistoryValue(event.new_value, event.event_type)" class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                      <div v-if="formatHistoryValue(event.new_value, event.event_type)" class="flex items-center gap-1.5 bg-white border border-green-200 rounded-md px-3 py-1.5">
                        <span class="text-green-600 font-semibold">A:</span>
                        <span class="text-green-800 font-medium">{{ formatHistoryValue(event.new_value, event.event_type) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty state -->
            <div v-else class="text-center py-16">
              <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p class="text-gray-600 text-sm font-medium mb-1">No hay actividad registrada</p>
              <p class="text-gray-400 text-xs">Los cambios aparecerán aquí cuando se modifique la tarea</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Error state -->
      <div v-else class="bg-white rounded-lg shadow-md p-6 text-center">
        <p class="text-gray-500">No se pudo cargar la tarea</p>
        <router-link to="/tasks" class="mt-4 inline-block text-primary-600 hover:text-primary-700">
          Volver a tareas
        </router-link>
      </div>

    <!-- Edit Modal -->
    <TaskModal
      :is-open="isEditModalOpen"
      :task="task"
      :users="users"
      @save="handleSaveEdit"
      @cancel="isEditModalOpen = false"
    />

    <!-- Reassign Modal -->
    <ReassignTaskModal
      :visible="isReassignModalOpen"
      :task="task"
      @reassign="handleReassignTask"
      @cancel="isReassignModalOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTaskStore, useAuthStore } from '@/stores'
import { userService, taskService } from '@/services'
import { useToast } from '@/composables/useToast'
import BaseButton from '@/components/common/BaseButton.vue'
import TaskModal from '@/components/tasks/TaskModal.vue'
import ReassignTaskModal from '@/components/tasks/ReassignTaskModal.vue'

const route = useRoute()
const router = useRouter()
const taskStore = useTaskStore()
const authStore = useAuthStore()
const toast = useToast()

const task = ref(null)
const loading = ref(false)
const loadingHistory = ref(false)
const isEditModalOpen = ref(false)
const isReassignModalOpen = ref(false)
const users = ref([])
const selectedStatus = ref('')
const taskHistory = ref([])

const statusBadges = {
  'Pendiente': { label: 'Pendiente', class: 'bg-gray-100 text-gray-800' },
  'En Progreso': { label: 'En Progreso', class: 'bg-blue-100 text-blue-800' },
  'Completada': { label: 'Completada', class: 'bg-green-100 text-green-800' },
  'Cancelada': { label: 'Cancelada', class: 'bg-red-100 text-red-800' }
}

const priorityBadges = {
  'Baja': { label: 'Prioridad Baja', class: 'bg-green-100 text-green-800' },
  'Media': { label: 'Prioridad Media', class: 'bg-yellow-100 text-yellow-800' },
  'Alta': { label: 'Prioridad Alta', class: 'bg-red-100 text-red-800' }
}

const statusBadgeClass = computed(() => statusBadges[task.value?.status]?.class || 'bg-gray-100 text-gray-800')
const statusLabel = computed(() => statusBadges[task.value?.status]?.label || task.value?.status || 'Desconocido')

const priorityBadgeClass = computed(() => priorityBadges[task.value?.priority]?.class || 'bg-gray-100 text-gray-800')
const priorityLabel = computed(() => priorityBadges[task.value?.priority]?.label || task.value?.priority || 'Desconocido')

const formattedDate = computed(() => {
  if (!task.value) return ''
  const date = new Date(task.value.due_date)
  const dateStr = date.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
  if (task.value.due_time) {
    return `${dateStr} a las ${task.value.due_time}`
  }
  return dateStr
})

const canEdit = computed(() => {
  const role = authStore.userRole
  return role === 'admin' || role === 'supervisor'
})

const canChangeStatus = computed(() => {
  const role = authStore.userRole
  const currentUserId = authStore.currentUser?.id
  const assignedToId = task.value?.assignee?.id
  const isAssigned = assignedToId === currentUserId

  if (role === 'admin' || role === 'supervisor') return true
  if (role === 'operario' && isAssigned) return true
  return false
})

const formatDateTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadTask = async () => {
  loading.value = true
  try {
    const taskData = await taskStore.fetchTask(route.params.id)
    task.value = taskData
    selectedStatus.value = taskData.status
  } catch (error) {
    toast.error('Error al cargar la tarea')
  } finally {
    loading.value = false
  }
}

const handleEdit = () => {
  isEditModalOpen.value = true
}

const handleDelete = async () => {
  if (!confirm('¿Estás seguro de eliminar esta tarea?')) return

  try {
    await taskStore.deleteTask(task.value.id)
    toast.success('Tarea eliminada correctamente')
    router.push('/tasks')
  } catch (error) {
    toast.error('Error al eliminar la tarea')
  }
}

const handleStatusChange = async (newStatus) => {
  try {
    await taskStore.updateTaskStatus(task.value.id, newStatus)
    task.value.status = newStatus
    toast.success('Estado actualizado correctamente')
    // Recargar historial después de cambiar estado
    await loadTaskHistory()
  } catch (error) {
    toast.error('Error al actualizar el estado')
  }
}

const getStatusSelectClass = (status) => {
  const classes = {
    'Pendiente': 'border-gray-300 bg-gray-50',
    'En Progreso': 'border-blue-300 bg-blue-50 text-blue-900',
    'Completada': 'border-green-300 bg-green-50 text-green-900'
  }
  return classes[status] || ''
}

const handleStatusChangeFromSelect = async () => {
  if (selectedStatus.value === task.value.status) return
  await handleStatusChange(selectedStatus.value)
}

const handleSaveEdit = async (taskData) => {
  try {
    await taskStore.updateTask(task.value.id, taskData)
    await loadTask()
    isEditModalOpen.value = false
    toast.success('Tarea actualizada correctamente')
    // Recargar historial después de editar
    await loadTaskHistory()
  } catch (error) {
    toast.error('Error al actualizar la tarea')
  }
}

const handleReassign = () => {
  isReassignModalOpen.value = true
}

const handleReassignTask = async ({ taskId, newAssigneeId, newAssigneeName }) => {
  try {
    await taskStore.reassignTask(taskId, newAssigneeId)
    await loadTask()
    isReassignModalOpen.value = false
    toast.success(`✅ Tarea reasignada a ${newAssigneeName}`)
    // Recargar historial después de reasignar
    await loadTaskHistory()
  } catch (error) {
    toast.error('Error al reasignar la tarea')
  }
}

const loadUsers = async () => {
  try {
    // Obtener todos los usuarios activos para asignación
    const data = await userService.getUsers({ active: true })

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

const loadTaskHistory = async () => {
  if (!task.value?.id) return

  loadingHistory.value = true
  try {
    const history = await taskService.getTaskHistory(task.value.id)
    taskHistory.value = Array.isArray(history) ? history : []
  } catch (error) {
    console.error('Error al cargar historial:', error)
    taskHistory.value = []
  } finally {
    loadingHistory.value = false
  }
}

// Funciones auxiliares para el historial
const getEventBorderClass = (eventType) => {
  const classes = {
    'created': 'border-blue-200',
    'status_changed': 'border-green-200',
    'updated': 'border-yellow-200',
    'reassigned': 'border-purple-200',
    'priority_changed': 'border-orange-200',
    'deleted': 'border-red-200'
  }
  return classes[eventType] || 'border-gray-200'
}

const getEventIconClass = (eventType) => {
  const classes = {
    'created': 'bg-blue-500 text-white',
    'status_changed': 'bg-green-500 text-white',
    'updated': 'bg-yellow-500 text-white',
    'reassigned': 'bg-purple-500 text-white',
    'priority_changed': 'bg-orange-500 text-white',
    'deleted': 'bg-red-500 text-white'
  }
  return classes[eventType] || 'bg-gray-500 text-white'
}

const getEventIconPath = (eventType) => {
  const paths = {
    'created': 'M12 4v16m8-8H4',
    'status_changed': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    'updated': 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    'reassigned': 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
    'priority_changed': 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    'deleted': 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
  }
  return paths[eventType] || 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
}

const getEventTypeClass = (eventType) => {
  const classes = {
    'created': 'bg-blue-100 text-blue-800',
    'status_changed': 'bg-green-100 text-green-800',
    'updated': 'bg-yellow-100 text-yellow-800',
    'reassigned': 'bg-purple-100 text-purple-800',
    'priority_changed': 'bg-orange-100 text-orange-800',
    'deleted': 'bg-red-100 text-red-800'
  }
  return classes[eventType] || 'bg-gray-100 text-gray-800'
}

const getEventTypeLabel = (eventType) => {
  const labels = {
    'created': 'Creada',
    'status_changed': 'Estado',
    'updated': 'Actualizada',
    'reassigned': 'Reasignada',
    'priority_changed': 'Prioridad',
    'deleted': 'Eliminada'
  }
  return labels[eventType] || 'Cambio'
}

const formatEventDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'Hace unos segundos'
  if (minutes < 60) return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`
  if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`
  if (days < 7) return `Hace ${days} día${days > 1 ? 's' : ''}`

  return date.toLocaleString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Formatear valores del historial de manera legible
const formatHistoryValue = (value, eventType) => {
  if (!value) return null

  try {
    // Si es un string, intentar parsearlo como JSON
    const parsedValue = typeof value === 'string' ? JSON.parse(value) : value

    // Si es un objeto, extraer el campo relevante según el tipo de evento
    if (typeof parsedValue === 'object' && parsedValue !== null) {
      switch (eventType) {
        case 'status_changed':
          return parsedValue.status || JSON.stringify(parsedValue)

        case 'priority_changed':
          return parsedValue.priority || JSON.stringify(parsedValue)

        case 'reassigned':
          // Si tiene información del usuario asignado
          if (parsedValue.assignee) {
            return parsedValue.assignee.name || parsedValue.assignee.email || 'Sin asignar'
          }
          if (parsedValue.assignee_id) {
            return 'Usuario asignado'
          }
          return 'Sin asignar'

        case 'updated':
        case 'created':
          // Para actualizaciones/creaciones, mostrar campos clave
          const keyFields = []
          if (parsedValue.title) keyFields.push(`Título: ${parsedValue.title}`)
          if (parsedValue.status) keyFields.push(`Estado: ${parsedValue.status}`)
          if (parsedValue.priority) keyFields.push(`Prioridad: ${parsedValue.priority}`)

          return keyFields.length > 0 ? keyFields.join(', ') : JSON.stringify(parsedValue)

        default:
          // Para otros casos, intentar mostrar de manera legible
          return JSON.stringify(parsedValue, null, 2)
      }
    }

    // Si no es un objeto, retornar el valor tal cual
    return String(parsedValue)
  } catch (error) {
    // Si falla el parseo, retornar el valor original
    return String(value)
  }
}

onMounted(async () => {
  await loadTask()
  await Promise.all([
    loadUsers(),
    loadTaskHistory()
  ])
})
</script>
