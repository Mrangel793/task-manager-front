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
          <!-- Visibility badge -->
          <span
            class="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
            :class="project.visibility === 'miembros' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="project.visibility === 'miembros'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {{ project.visibility === 'miembros' ? 'Solo miembros' : 'Toda la organización' }}
          </span>
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
          <button
            v-if="canManageMembers"
            @click="showMembersPanel = !showMembersPanel"
            class="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Miembros
          </button>
        </div>

        <!-- Members panel -->
        <div v-if="showMembersPanel && canManageMembers" class="mt-4 ml-10 bg-gray-50 rounded-lg p-4 max-w-md">
          <h4 class="text-sm font-semibold text-gray-700 mb-3">Miembros con acceso</h4>

          <!-- Current members -->
          <div class="space-y-2 mb-3">
            <!-- Creator -->
            <div class="flex items-center justify-between py-1.5">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-xs font-semibold text-primary-700">
                  {{ getInitials(project.creator?.name) }}
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-800">{{ project.creator?.name }}</p>
                  <p class="text-xs text-gray-400">Creador</p>
                </div>
              </div>
            </div>

            <!-- Added members -->
            <div v-for="member in projectStore.currentProjectMembers" :key="member.id" class="flex items-center justify-between py-1.5">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                  {{ getInitials(member.name) }}
                </div>
                <p class="text-sm text-gray-700">{{ member.name }}</p>
              </div>
              <button
                @click="handleRemoveMember(member)"
                class="text-xs text-red-500 hover:text-red-700 transition-colors"
              >
                Quitar
              </button>
            </div>

            <p v-if="projectStore.currentProjectMembers.length === 0" class="text-xs text-gray-400 italic py-1">
              Sin miembros adicionales
            </p>
          </div>

          <!-- Add member -->
          <div class="border-t border-gray-200 pt-3">
            <p class="text-xs font-medium text-gray-500 mb-2">Agregar miembro</p>
            <div class="flex gap-2">
              <select
                v-model="selectedUserToAdd"
                class="flex-1 text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="">Seleccionar usuario...</option>
                <option
                  v-for="u in availableUsersToAdd"
                  :key="u.id"
                  :value="u.id"
                >{{ u.name }}</option>
              </select>
              <button
                @click="handleAddMember"
                :disabled="!selectedUserToAdd || addingMember"
                class="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
              >
                Agregar
              </button>
            </div>
          </div>
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
const authStore = useAuthStore()
const toast = useToast()

const projectId = computed(() => route.params.id)
const project = computed(() => projectStore.currentProject)
const loading = ref(false)
const viewMode = ref('kanban')
const tasks = ref([])
const users = ref([])
const isEditModalOpen = ref(false)
const isTaskModalOpen = ref(false)
const showMembersPanel = ref(false)
const selectedUserToAdd = ref('')
const addingMember = ref(false)

const canManageMembers = computed(() => {
  const currentUserId = authStore.currentUser?.id
  const role = authStore.userRole
  return (
    (currentUserId && project.value?.creator?.id &&
      String(currentUserId) === String(project.value.creator.id)) ||
    role === 'admin'
  )
})

const availableUsersToAdd = computed(() => {
  const memberIds = new Set(projectStore.currentProjectMembers.map(m => m.id))
  const creatorId = project.value?.creator?.id
  return users.value.filter(u => !memberIds.has(u.id) && String(u.id) !== String(creatorId))
})

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
    await Promise.all([loadTasks(), projectStore.fetchMembers(projectId.value)])
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

const handleAddMember = async () => {
  if (!selectedUserToAdd.value) return
  addingMember.value = true
  try {
    await projectStore.addMember(projectId.value, selectedUserToAdd.value)
    selectedUserToAdd.value = ''
    toast.success('Miembro agregado')
  } catch (error) {
    toast.error(error.message || 'Error al agregar miembro')
  } finally {
    addingMember.value = false
  }
}

const handleRemoveMember = async (member) => {
  try {
    await projectStore.removeMember(projectId.value, member.id)
    toast.success(`${member.name} removido del proyecto`)
  } catch (error) {
    toast.error(error.message || 'Error al quitar miembro')
  }
}

onMounted(async () => {
  await loadProjectData()
  loadUsers()
})
</script>
