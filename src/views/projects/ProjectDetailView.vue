<template>
  <div>
    <!-- Loading -->
    <div v-if="loading && !project" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>

    <template v-else-if="project">
      <!-- Header -->
      <div class="mb-6">
        <div class="flex items-center gap-2 mb-3">
          <button
            @click="router.push('/projects')"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div
            class="w-3 h-3 rounded-full flex-shrink-0"
            :style="{ backgroundColor: project.color || '#3B82F6' }"
          ></div>
          <h1 class="text-2xl font-bold text-gray-900">{{ project.name }}</h1>
          <span :class="healthBadgeClass" class="text-xs font-semibold px-2 py-1 rounded-full ml-2">
            {{ healthLabel }}
          </span>
        </div>
        <p v-if="project.description" class="text-sm text-gray-500 ml-10">{{ project.description }}</p>

        <!-- Progress bar -->
        <div class="mt-4 ml-10 max-w-xl">
          <div class="flex items-center justify-between mb-1">
            <span class="text-sm font-medium text-gray-700">
              {{ progress.completed }} de {{ progress.total - progress.cancelled }} tareas completadas
            </span>
            <span class="text-sm font-bold" :style="{ color: project.color || '#3B82F6' }">
              {{ progress.percentage }}%
            </span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-3">
            <div
              class="h-3 rounded-full transition-all duration-500"
              :style="{ width: progress.percentage + '%', backgroundColor: project.color || '#3B82F6' }"
            ></div>
          </div>
        </div>

        <!-- Actions -->
        <div class="mt-4 ml-10 flex items-center gap-3">
          <select
            :value="project.status"
            @change="handleStatusChange($event.target.value)"
            class="text-sm px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="Activo">Activo</option>
            <option value="Pausado">Pausado</option>
            <option value="Completado">Completado</option>
            <option value="Archivado">Archivado</option>
          </select>
          <button
            @click="openEditModal"
            class="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar
          </button>
        </div>
      </div>

      <!-- View toggle -->
      <div class="mb-4 flex items-center justify-between">
        <div class="flex border border-gray-300 rounded-lg overflow-hidden">
          <button
            @click="viewMode = 'kanban'"
            class="px-4 py-2 text-sm font-medium transition-colors"
            :class="viewMode === 'kanban' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'"
          >
            Tablero
          </button>
          <button
            @click="viewMode = 'list'"
            class="px-4 py-2 text-sm font-medium transition-colors"
            :class="viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'"
          >
            Lista
          </button>
        </div>
        <button
          @click="openCreateTaskModal"
          class="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm font-medium"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Agregar tarea
        </button>
      </div>

      <!-- Kanban View -->
      <div v-if="viewMode === 'kanban'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div
          v-for="column in kanbanColumns"
          :key="column.status"
          class="bg-gray-50 rounded-lg p-3"
        >
          <!-- Column header -->
          <div class="flex items-center justify-between mb-3 px-1">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full" :class="column.dotClass"></span>
              <h3 class="text-sm font-semibold text-gray-700">{{ column.label }}</h3>
            </div>
            <span class="text-xs font-bold text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">
              {{ column.tasks.length }}
            </span>
          </div>

          <!-- Tasks -->
          <div class="space-y-2">
            <div
              v-for="task in column.tasks"
              :key="task.id"
              class="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
              @click="goToTask(task)"
            >
              <p class="text-sm font-medium text-gray-900 mb-2">{{ task.title }}</p>
              <div class="flex items-center justify-between">
                <div v-if="task.due_date" class="flex items-center gap-1 text-xs" :class="getTaskDueDateColor(task)">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {{ formatDate(task.due_date) }}
                </div>
                <div
                  v-if="task.assignee"
                  class="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-xs font-semibold text-primary-700"
                  :title="task.assignee.name"
                >
                  {{ getInitials(task.assignee.name) }}
                </div>
              </div>
            </div>

            <!-- Empty column -->
            <div v-if="column.tasks.length === 0" class="text-center py-6 text-xs text-gray-400">
              Sin tareas
            </div>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-else class="bg-white rounded-lg shadow overflow-hidden">
        <div class="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div class="col-span-5">Tarea</div>
          <div class="col-span-2">Asignado</div>
          <div class="col-span-2">Estado</div>
          <div class="col-span-2">Fecha</div>
          <div class="col-span-1"></div>
        </div>
        <div class="divide-y divide-gray-100">
          <div
            v-for="task in tasks"
            :key="task.id"
            class="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-gray-50 cursor-pointer"
            @click="goToTask(task)"
          >
            <div class="col-span-5">
              <span class="text-sm font-medium text-gray-900">{{ task.title }}</span>
            </div>
            <div class="col-span-2 text-sm text-gray-600">
              {{ task.assignee?.name || 'Sin asignar' }}
            </div>
            <div class="col-span-2">
              <span :class="getStatusClass(task.status)" class="text-xs font-medium px-2 py-1 rounded">
                {{ task.status }}
              </span>
            </div>
            <div class="col-span-2 text-xs" :class="getTaskDueDateColor(task)">
              {{ task.due_date ? formatDate(task.due_date) : 'Sin fecha' }}
            </div>
            <div class="col-span-1 text-right">
              <svg class="w-4 h-4 text-gray-400 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
        <div v-if="tasks.length === 0" class="text-center py-12 text-gray-500">
          <p class="text-sm">Este proyecto aun no tiene tareas</p>
        </div>
      </div>
    </template>

    <!-- Edit Project Modal -->
    <ProjectModal
      :is-open="isEditModalOpen"
      :project="project"
      @save="handleEditSave"
      @cancel="isEditModalOpen = false"
    />

    <!-- Create Task Modal -->
    <TaskModal
      :is-open="isTaskModalOpen"
      :users="users"
      :on-save="handleCreateTask"
      :default-project-id="projectId"
      @cancel="isTaskModalOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectStore } from '@/stores/project.store'
import { useTaskStore, useAuthStore } from '@/stores'
import { projectService } from '@/services/project.service'
import { userService } from '@/services'
import { useToast } from '@/composables/useToast'
import ProjectModal from '@/components/projects/ProjectModal.vue'
import TaskModal from '@/components/tasks/TaskModal.vue'

const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()
const taskStore = useTaskStore()
const toast = useToast()

const projectId = computed(() => route.params.id)
const project = computed(() => projectStore.currentProject)
const loading = ref(false)
const viewMode = ref('kanban')
const tasks = ref([])
const users = ref([])
const isEditModalOpen = ref(false)
const isTaskModalOpen = ref(false)

const progress = computed(() => project.value?.progress || {
  total: 0, completed: 0, pending: 0, in_progress: 0, to_verify: 0, cancelled: 0, percentage: 0
})

const healthLabel = computed(() => {
  const labels = { on_track: 'En curso', at_risk: 'En riesgo', completed: 'Completado', paused: 'Pausado' }
  return labels[project.value?.health] || 'En curso'
})

const healthBadgeClass = computed(() => {
  const classes = {
    on_track: 'bg-green-100 text-green-700',
    at_risk: 'bg-red-100 text-red-700',
    completed: 'bg-blue-100 text-blue-700',
    paused: 'bg-gray-100 text-gray-600'
  }
  return classes[project.value?.health] || 'bg-green-100 text-green-700'
})

const kanbanColumns = computed(() => [
  {
    status: 'Pendiente',
    label: 'Pendiente',
    dotClass: 'bg-yellow-400',
    tasks: tasks.value.filter(t => t.status === 'Pendiente')
  },
  {
    status: 'En Progreso',
    label: 'En Progreso',
    dotClass: 'bg-blue-400',
    tasks: tasks.value.filter(t => t.status === 'En Progreso')
  },
  {
    status: 'Por Verificar',
    label: 'Por Verificar',
    dotClass: 'bg-purple-400',
    tasks: tasks.value.filter(t => t.status === 'Por Verificar')
  },
  {
    status: 'Completada',
    label: 'Completada',
    dotClass: 'bg-green-400',
    tasks: tasks.value.filter(t => t.status === 'Completada')
  }
])

const getInitials = (name) => {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  return parts.length === 1
    ? parts[0].substring(0, 2).toUpperCase()
    : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const formatDate = (date) => {
  if (!date) return ''
  const parts = date.split('-')
  if (parts.length !== 3) return date
  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today.getTime() + 86400000)
  if (d.getTime() === today.getTime()) return 'Hoy'
  if (d.getTime() === tomorrow.getTime()) return 'Manana'
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
}

const getTaskDueDateColor = (task) => {
  if (!task.due_date || task.status === 'Completada') return 'text-gray-400'
  const parts = task.due_date.split('-')
  if (parts.length !== 3) return 'text-gray-600'
  const dueDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (dueDate < today) return 'text-red-600'
  if (dueDate.getTime() === today.getTime()) return 'text-orange-600'
  return 'text-gray-500'
}

const getStatusClass = (status) => {
  const classes = {
    'Pendiente': 'bg-yellow-100 text-yellow-800',
    'En Progreso': 'bg-blue-100 text-blue-800',
    'Por Verificar': 'bg-purple-100 text-purple-800',
    'Completada': 'bg-green-100 text-green-800',
    'Cancelada': 'bg-gray-100 text-gray-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const goToTask = (task) => {
  router.push(`/tasks/${task.id}`)
}

const openEditModal = () => {
  isEditModalOpen.value = true
}

const openCreateTaskModal = () => {
  isTaskModalOpen.value = true
}

const handleEditSave = async (data) => {
  try {
    await projectStore.updateProject(projectId.value, data)
    toast.success('Proyecto actualizado')
    isEditModalOpen.value = false
    await loadProjectData()
  } catch (error) {
    toast.error(error.message || 'Error al actualizar')
  }
}

const handleStatusChange = async (status) => {
  try {
    await projectStore.updateProject(projectId.value, { status })
    toast.success('Estado actualizado')
    await loadProjectData()
  } catch (error) {
    toast.error('Error al cambiar estado')
  }
}

const handleCreateTask = async (taskData) => {
  try {
    taskData.project_id = projectId.value
    await taskStore.createTask(taskData)
    toast.success('Tarea creada')
    isTaskModalOpen.value = false
    await loadTasks()
  } catch (error) {
    toast.error(error.message || 'Error al crear tarea')
  }
}

const loadTasks = async () => {
  try {
    tasks.value = await projectService.getProjectTasks(projectId.value)
  } catch (error) {
    console.error('Error al cargar tareas:', error)
  }
}

const loadProjectData = async () => {
  loading.value = true
  try {
    await projectStore.fetchProject(projectId.value)
    await loadTasks()
  } catch {
    toast.error('Error al cargar el proyecto')
    router.push('/projects')
  } finally {
    loading.value = false
  }
}

const loadUsers = async () => {
  try {
    const data = await userService.getUsers({ active: true })
    if (Array.isArray(data)) users.value = data
    else if (data.data) users.value = data.data
    else if (data.users) users.value = data.users
    else users.value = []
  } catch {
    users.value = []
  }
}

onMounted(async () => {
  await loadProjectData()
  loadUsers()
})
</script>
