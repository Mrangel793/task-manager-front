<template>
  <div>
    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <div v-else-if="member">
      <!-- Header with back button -->
      <div class="mb-6">
        <button
          @click="goBack"
          class="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Volver al equipo
        </button>
      </div>

      <!-- Member profile card -->
      <div class="bg-white rounded-lg shadow mb-6">
        <div class="h-24 bg-gradient-to-r from-primary-500 to-primary-600 rounded-t-lg"></div>
        <div class="px-6 pb-6">
          <div class="flex flex-col sm:flex-row sm:items-end sm:space-x-5 -mt-12">
            <!-- Avatar -->
            <div class="flex">
              <div class="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white border-4 border-white shadow-lg">
                <div class="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
                  <span class="text-3xl font-bold text-primary-600">
                    {{ getMemberInitials }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Info -->
            <div class="mt-6 sm:mt-0 sm:flex-1 sm:min-w-0 sm:flex sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
              <div class="flex-1 min-w-0">
                <h1 class="text-2xl font-bold text-gray-900 truncate">
                  {{ member.name }}
                </h1>
                <div class="mt-1 flex items-center space-x-3">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Operador
                  </span>
                  <span class="text-sm text-gray-500">{{ member.phone }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Métricas del operador -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-purple-100 rounded-lg p-3">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total</p>
              <p class="text-2xl font-bold text-gray-900">{{ memberStats.total }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Pendientes</p>
              <p class="text-2xl font-bold text-gray-900">{{ memberStats.pending }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-green-100 rounded-lg p-3">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Completadas</p>
              <p class="text-2xl font-bold text-gray-900">{{ memberStats.completed }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 rounded-lg p-3" :class="memberStats.overdue > 0 ? 'bg-red-100' : 'bg-gray-100'">
              <svg class="w-6 h-6" :class="memberStats.overdue > 0 ? 'text-red-600' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Vencidas</p>
              <p class="text-2xl font-bold text-gray-900">{{ memberStats.overdue }}</p>
            </div>
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

      <!-- Tasks list -->
      <div>
        <!-- Empty state -->
        <div v-if="filteredMemberTasks.length === 0" class="text-center py-12 bg-white rounded-lg shadow">
          <svg class="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900">No hay tareas</h3>
          <p class="mt-2 text-sm text-gray-500">
            Este operador no tiene tareas {{ currentTab === 'pending' ? 'pendientes' : currentTab === 'completed' ? 'completadas' : '' }}
          </p>
        </div>

        <!-- Tasks grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <TaskCard
            v-for="task in filteredMemberTasks"
            :key="task.id"
            :task="task"
            :users="users"
            @click="viewTask"
            @status-change="handleStatusChange"
          />
        </div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else class="text-center py-12 bg-white rounded-lg shadow">
      <svg class="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <h3 class="mt-4 text-lg font-medium text-gray-900">Operador no encontrado</h3>
      <p class="mt-2 text-sm text-gray-500">
        No se pudo cargar la información del operador
      </p>
      <BaseButton variant="primary" class="mt-4" @click="goBack">
        Volver al equipo
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTaskStore } from '@/stores'
import { userService } from '@/services'
import { useToast } from '@/composables/useToast'
import TaskCard from '@/components/tasks/TaskCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()
const route = useRoute()
const taskStore = useTaskStore()
const toast = useToast()

const loading = ref(false)
const member = ref(null)
const currentTab = ref('all')
const users = ref([])

const memberId = route.params.id

// Tareas del miembro
const memberTasks = computed(() => {
  if (!member.value) return []

  return taskStore.tasks.filter(
    task => task.assignee_id === member.value.id || task.assigned_to === member.value.id
  )
})

// Estadísticas del miembro
const memberStats = computed(() => {
  const tasks = memberTasks.value
  const completed = tasks.filter(t => t.status === 'Completada').length
  const pending = tasks.filter(t => t.status !== 'Completada').length

  // Tareas vencidas
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const overdue = tasks.filter(t => {
    if (!t.due_date || t.status === 'Completada') return false
    return new Date(t.due_date) < today
  }).length

  return {
    total: tasks.length,
    pending,
    completed,
    overdue
  }
})

// Tabs
const tabs = computed(() => [
  { value: 'all', label: 'Todas', count: memberStats.value.total },
  { value: 'pending', label: 'Pendientes', count: memberStats.value.pending },
  { value: 'completed', label: 'Completadas', count: memberStats.value.completed }
])

// Tareas filtradas
const filteredMemberTasks = computed(() => {
  let tasks = memberTasks.value

  if (currentTab.value === 'pending') {
    tasks = tasks.filter(t => t.status !== 'Completada')
  } else if (currentTab.value === 'completed') {
    tasks = tasks.filter(t => t.status === 'Completada')
  }

  return tasks
})

const getMemberInitials = computed(() => {
  if (!member.value?.name) return 'U'
  const names = member.value.name.trim().split(' ')
  if (names.length === 1) {
    return names[0].substring(0, 2).toUpperCase()
  }
  return (names[0][0] + names[names.length - 1][0]).toUpperCase()
})

const goBack = () => {
  router.push('/team/overview')
}

const viewTask = (task) => {
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

const loadData = async () => {
  loading.value = true
  try {
    await Promise.all([
      taskStore.fetchTasks(),
      loadMember()
    ])
  } catch (error) {
    toast.error('Error al cargar los datos')
  } finally {
    loading.value = false
  }
}

const loadMember = async () => {
  try {
    // TODO: Crear endpoint específico para obtener un usuario por ID
    // Por ahora, obtenemos todos los operadores y buscamos el que coincide
    const data = await userService.getOperators()
    let operators = []

    if (Array.isArray(data)) {
      operators = data
    } else if (data.users) {
      operators = data.users
    } else if (data.data) {
      operators = data.data
    }

    users.value = operators
    member.value = operators.find(op => op.id === memberId)
  } catch (error) {
    console.error('Error loading member:', error)
  }
}

onMounted(async () => {
  await loadData()
})
</script>
