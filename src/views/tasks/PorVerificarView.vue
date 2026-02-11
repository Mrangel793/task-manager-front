<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Tareas Completadas</h1>
        <p class="text-sm text-gray-600 mt-1">
          {{ completedTasks.length }} {{ completedTasks.length === 1 ? 'tarea completada' : 'tareas completadas' }}
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          v-if="completedTasks.length > 0"
          @click="handleDeleteAll"
          :disabled="deleting"
          class="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
        >
          <svg v-if="deleting" class="w-4 h-4 mr-1.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <svg v-else class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          {{ deleting ? 'Eliminando...' : 'Eliminar todas' }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white rounded-lg shadow p-12">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600"></div>
        <p class="mt-4 text-sm text-gray-600">Cargando tareas...</p>
      </div>
    </div>

    <!-- Task list -->
    <div v-else-if="completedTasks.length > 0" class="bg-white rounded-lg shadow overflow-hidden">
      <div class="divide-y divide-gray-200">
        <div
          v-for="task in completedTasks"
          :key="task.id"
          class="relative group"
        >
          <router-link
            :to="`/tasks/${task.id}`"
            class="block px-4 py-4 pr-12 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center gap-4">
              <!-- Check icon -->
              <div class="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <!-- Task info -->
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-500 line-through truncate">{{ task.title }}</p>
                <div class="flex items-center gap-3 mt-1">
                  <span class="text-xs text-gray-400 flex items-center">
                    <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {{ getAssigneeName(task) }}
                  </span>
                  <span v-if="task.due_date" class="text-xs text-gray-400 flex items-center">
                    <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {{ formatDueDate(task.due_date) }}
                  </span>
                </div>
              </div>

              <!-- Arrow -->
              <svg class="w-5 h-5 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </router-link>

          <!-- Delete individual button -->
          <button
            @click.prevent="handleDeleteOne(task)"
            class="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
            title="Eliminar tarea"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="bg-white rounded-lg shadow p-12">
      <div class="text-center">
        <svg class="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-900">No hay tareas completadas</h3>
        <p class="mt-2 text-sm text-gray-500">
          Las tareas verificadas aparecerán aquí
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useTaskStore } from '@/stores'
import { useToast } from '@/composables/useToast'

const taskStore = useTaskStore()
const toast = useToast()
const { completedTasks } = storeToRefs(taskStore)

const loading = ref(false)
const deleting = ref(false)

const getAssigneeName = (task) => {
  return task.assignee?.name || task.assignee_name || 'Sin asignar'
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

const handleDeleteOne = async (task) => {
  try {
    await taskStore.deleteTask(task.id)
    toast.success('Tarea eliminada')
  } catch (error) {
    toast.error('Error al eliminar la tarea')
  }
}

const handleDeleteAll = async () => {
  if (!confirm(`¿Estás seguro de eliminar las ${completedTasks.value.length} tareas completadas? Esta acción no se puede deshacer.`)) {
    return
  }

  deleting.value = true
  try {
    const ids = completedTasks.value.map(t => t.id)
    await Promise.all(ids.map(id => taskStore.deleteTask(id)))
    toast.success('Todas las tareas completadas fueron eliminadas')
  } catch (error) {
    toast.error('Error al eliminar algunas tareas')
    await taskStore.fetchTasks()
  } finally {
    deleting.value = false
  }
}

onMounted(async () => {
  if (taskStore.tasks.length === 0) {
    loading.value = true
    try {
      await taskStore.fetchTasks()
    } catch (error) {
      toast.error('Error al cargar las tareas')
    } finally {
      loading.value = false
    }
  }
})
</script>
