<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Resumen del Equipo</h1>
      <p class="text-sm text-gray-600 mt-1">Monitorea el rendimiento y tareas de tu equipo</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <div v-else>
      <!-- Métricas generales -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <!-- Total operadores -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-blue-100 rounded-lg p-3">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Operadores</p>
              <p class="text-2xl font-bold text-gray-900">{{ metrics.totalOperators }}</p>
            </div>
          </div>
        </div>

        <!-- Tareas totales -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-purple-100 rounded-lg p-3">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Tareas Totales</p>
              <p class="text-2xl font-bold text-gray-900">{{ metrics.totalTasks }}</p>
            </div>
          </div>
        </div>

        <!-- Tareas pendientes -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Pendientes</p>
              <p class="text-2xl font-bold text-gray-900">{{ metrics.pendingTasks }}</p>
            </div>
          </div>
        </div>

        <!-- Tasa de completación -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-green-100 rounded-lg p-3">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Completadas</p>
              <p class="text-2xl font-bold text-gray-900">{{ metrics.completionRate }}%</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Alertas -->
      <div v-if="alerts.length > 0" class="mb-6 space-y-3">
        <div
          v-for="alert in alerts"
          :key="alert.id"
          :class="getAlertClass(alert.type)"
          class="rounded-lg p-4 flex items-start"
        >
          <svg class="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <div class="flex-1">
            <p class="text-sm font-medium">{{ alert.title }}</p>
            <p class="text-sm mt-1">{{ alert.message }}</p>
          </div>
        </div>
      </div>

      <!-- Lista de operadores con sus estadísticas -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">Operadores del Equipo</h2>
            <p class="text-sm text-gray-600 mt-1">Rendimiento individual de cada operador</p>
          </div>
          <BaseButton variant="secondary" size="sm" @click="goToAllTasks">
            Ver todas las tareas
            <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </BaseButton>
        </div>

        <div class="divide-y divide-gray-200">
          <!-- Empty state -->
          <div v-if="teamMembers.length === 0" class="p-12 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p class="mt-4 text-sm text-gray-600">No hay operadores en el equipo</p>
          </div>

          <!-- Operadores -->
          <div
            v-for="member in teamMembers"
            :key="member.id"
            @click="viewMember(member)"
            class="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4 flex-1">
                <!-- Avatar -->
                <div class="flex-shrink-0">
                  <div class="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <span class="text-lg font-semibold text-primary-600">
                      {{ getMemberInitials(member) }}
                    </span>
                  </div>
                </div>

                <!-- Info -->
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">
                    {{ member.name }}
                  </p>
                  <p class="text-sm text-gray-500">
                    {{ member.phone }}
                  </p>
                </div>

                <!-- Estadísticas -->
                <div class="hidden sm:flex items-center space-x-6">
                  <div class="text-center">
                    <p class="text-xs text-gray-500">Total</p>
                    <p class="text-lg font-semibold text-gray-900">{{ member.stats.total }}</p>
                  </div>
                  <div class="text-center">
                    <p class="text-xs text-gray-500">Pendientes</p>
                    <p class="text-lg font-semibold text-yellow-600">{{ member.stats.pending }}</p>
                  </div>
                  <div class="text-center">
                    <p class="text-xs text-gray-500">Completadas</p>
                    <p class="text-lg font-semibold text-green-600">{{ member.stats.completed }}</p>
                  </div>
                  <div class="text-center">
                    <p class="text-xs text-gray-500">Vencidas</p>
                    <p class="text-lg font-semibold text-red-600">{{ member.stats.overdue }}</p>
                  </div>
                </div>

                <!-- Indicador de rendimiento -->
                <div class="hidden lg:block">
                  <div
                    :class="getPerformanceBadgeClass(member.stats.completionRate)"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  >
                    {{ member.stats.completionRate }}% efectividad
                  </div>
                </div>
              </div>

              <!-- Chevron -->
              <svg class="w-5 h-5 text-gray-400 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTaskStore } from '@/stores'
import { userService } from '@/services'
import { useToast } from '@/composables/useToast'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()
const taskStore = useTaskStore()
const toast = useToast()

const loading = ref(false)
const operators = ref([])

// Métricas generales
const metrics = computed(() => {
  const tasks = taskStore.tasks
  const pending = tasks.filter(t => t.status !== 'Completada').length
  const completed = tasks.filter(t => t.status === 'Completada').length
  const total = tasks.length
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

  return {
    totalOperators: operators.value.length,
    totalTasks: total,
    pendingTasks: pending,
    completionRate
  }
})

// Alertas
const alerts = computed(() => {
  const alertList = []
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  // Tareas vencidas
  const overdueTasks = taskStore.tasks.filter(t => {
    if (!t.due_date || t.status === 'Completada') return false
    return new Date(t.due_date) < today
  })

  if (overdueTasks.length > 0) {
    alertList.push({
      id: 'overdue',
      type: 'error',
      title: `${overdueTasks.length} tarea${overdueTasks.length > 1 ? 's' : ''} vencida${overdueTasks.length > 1 ? 's' : ''}`,
      message: 'Hay tareas que han superado su fecha límite'
    })
  }

  // Tareas que vencen hoy
  const dueTodayTasks = taskStore.tasks.filter(t => {
    if (!t.due_date || t.status === 'Completada') return false
    const dueDate = new Date(t.due_date)
    return dueDate >= today && dueDate < new Date(today.getTime() + 24 * 60 * 60 * 1000)
  })

  if (dueTodayTasks.length > 0) {
    alertList.push({
      id: 'due-today',
      type: 'warning',
      title: `${dueTodayTasks.length} tarea${dueTodayTasks.length > 1 ? 's' : ''} vence${dueTodayTasks.length > 1 ? 'n' : ''} hoy`,
      message: 'Asegúrate de que el equipo las complete a tiempo'
    })
  }

  return alertList
})

// Miembros del equipo con estadísticas
const teamMembers = computed(() => {
  return operators.value.map(operator => {
    // Soportar diferentes estructuras de datos del backend
    const operatorTasks = taskStore.tasks.filter(
      t => t.assignee?.id === operator.id || t.assignee_id === operator.id || t.assigned_to === operator.id
    )

    const completed = operatorTasks.filter(t => t.status === 'Completada').length
    const inProgress = operatorTasks.filter(t => t.status === 'En Progreso').length
    const pending = operatorTasks.filter(t => t.status === 'Pendiente').length
    const total = operatorTasks.length

    // Tareas vencidas
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const overdue = operatorTasks.filter(t => {
      if (!t.due_date || t.status === 'Completada') return false
      return new Date(t.due_date) < today
    }).length

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    return {
      ...operator,
      stats: {
        total,
        pending,
        completed,
        inProgress,
        overdue,
        completionRate
      }
    }
  })
})

const getMemberInitials = (member) => {
  if (!member.name) return 'U'
  const names = member.name.trim().split(' ')
  if (names.length === 1) {
    return names[0].substring(0, 2).toUpperCase()
  }
  return (names[0][0] + names[names.length - 1][0]).toUpperCase()
}

const getAlertClass = (type) => {
  const classes = {
    error: 'bg-red-50 text-red-800',
    warning: 'bg-yellow-50 text-yellow-800',
    info: 'bg-blue-50 text-blue-800'
  }
  return classes[type] || classes.info
}

const getPerformanceBadgeClass = (rate) => {
  if (rate >= 80) return 'bg-green-100 text-green-800'
  if (rate >= 60) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

const viewMember = (member) => {
  router.push(`/team/member/${member.id}`)
}

const goToAllTasks = () => {
  router.push('/team/tasks')
}

const loadData = async () => {
  loading.value = true
  try {
    await Promise.all([
      taskStore.fetchTasks(),
      loadOperators()
    ])
  } catch (error) {
    toast.error('Error al cargar los datos del equipo')
  } finally {
    loading.value = false
  }
}

const loadOperators = async () => {
  try {
    const data = await userService.getOperators()
    if (Array.isArray(data)) {
      operators.value = data
    } else if (data.users) {
      operators.value = data.users
    } else if (data.data) {
      operators.value = data.data
    }
  } catch (error) {
    console.error('Error loading operators:', error)
  }
}

onMounted(async () => {
  await loadData()
})
</script>
