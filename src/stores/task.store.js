import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { taskService } from '@/services'

// Helpers para persistencia en localStorage
const STORAGE_KEY = 'task_store_cache'

function loadFromStorage() {
  try {
    const cached = localStorage.getItem(STORAGE_KEY)
    if (cached) {
      const parsed = JSON.parse(cached)
      // Máximo 5 minutos de caché en localStorage
      if (Date.now() - parsed.timestamp < 5 * 60 * 1000) {
        return parsed
      }
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY)
  }
  return null
}

function saveToStorage(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      tasks,
      timestamp: Date.now()
    }))
  } catch { /* localStorage lleno o no disponible */ }
}

export const useTaskStore = defineStore('task', () => {
  // Cargar datos persistidos inmediatamente
  const cached = loadFromStorage()

  // State
  const tasks = ref(cached?.tasks || [])
  const selectedTask = ref(null)
  const currentTask = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const lastFetchTime = ref(cached ? cached.timestamp : 0)
  const CACHE_DURATION = 30 * 1000 // 30 segundos
  const filters = ref({
    search: '',
    status: 'all',
    dateFrom: null,
    dateTo: null
  })

  // Persistir tareas en localStorage cuando cambien
  watch(tasks, (newTasks) => {
    if (newTasks.length > 0) {
      saveToStorage(newTasks)
    }
  }, { deep: true })

  // Getters
  const pendingTasks = computed(() =>
    tasks.value.filter(task => task.status === 'Pendiente')
  )

  const inProgressTasks = computed(() =>
    tasks.value.filter(task => task.status === 'En Progreso')
  )

  const porVerificarTasks = computed(() =>
    tasks.value.filter(task => task.status === 'Por Verificar')
  )

  const completedTasks = computed(() =>
    tasks.value.filter(task => task.status === 'Completada')
  )

  const tasksCount = computed(() => ({
    total: tasks.value.length,
    pending: pendingTasks.value.length,
    inProgress: inProgressTasks.value.length,
    porVerificar: porVerificarTasks.value.length,
    completed: completedTasks.value.length
  }))

  // Actions
  async function fetchTasks(params, { force = false } = {}) {
    const now = Date.now()
    const hasCachedData = tasks.value.length > 0
    const cacheValid = (now - lastFetchTime.value) < CACHE_DURATION

    // Si hay datos en caché y no se fuerza, refrescar en background
    if (hasCachedData && cacheValid && !force) {
      return tasks.value
    }

    // Solo mostrar loading si no hay datos previos
    if (!hasCachedData) {
      loading.value = true
    }
    error.value = null

    try {
      const data = await taskService.getTasks(params)

      // Manejar diferentes estructuras de respuesta del backend
      if (Array.isArray(data)) {
        tasks.value = data
      } else if (data.tasks && Array.isArray(data.tasks)) {
        tasks.value = data.tasks
      } else if (data.data && Array.isArray(data.data)) {
        tasks.value = data.data
      } else {
        console.error('Respuesta inesperada del backend:', data)
        tasks.value = []
      }

      lastFetchTime.value = Date.now()
      return data
    } catch (err) {
      error.value = err.message
      if (!hasCachedData) tasks.value = []
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchTask(id) {
    loading.value = true
    error.value = null

    try {
      const data = await taskService.getTask(id)

      // Extraer la tarea si está envuelta en más niveles
      const task = data.task || data
      currentTask.value = task

      return task
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  function invalidateCache() {
    lastFetchTime.value = 0
  }

  async function createTask(taskData) {
    error.value = null

    try {
      const data = await taskService.createTask(taskData)
      const task = data.task || data
      tasks.value.push(task)
      invalidateCache()
      return task
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  async function updateTask(id, taskData) {
    error.value = null

    try {
      const data = await taskService.updateTask(id, taskData)
      const task = data.task || data

      const index = tasks.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tasks.value[index] = task
      }
      if (currentTask.value?.id === id) {
        currentTask.value = task
      }
      invalidateCache()
      return task
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  async function deleteTask(id) {
    error.value = null

    try {
      await taskService.deleteTask(id)
      tasks.value = tasks.value.filter(task => task.id !== id)
      if (currentTask.value?.id === id) {
        currentTask.value = null
      }
      invalidateCache()
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  async function updateTaskStatus(id, status) {
    error.value = null

    try {
      const data = await taskService.updateTaskStatus(id, status)
      const task = data.task || data

      const index = tasks.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tasks.value[index] = task
      }
      if (currentTask.value?.id === id) {
        currentTask.value = task
      }
      invalidateCache()
      return task
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  async function reassignTask(taskId, newAssigneeId) {
    error.value = null

    try {
      const data = await taskService.reassignTask(taskId, newAssigneeId)
      const task = data.task || data

      const index = tasks.value.findIndex(t => t.id === taskId)
      if (index !== -1) {
        tasks.value[index] = task
      }
      if (currentTask.value?.id === taskId) {
        currentTask.value = task
      }
      invalidateCache()
      return task
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  function setFilters(newFilters) {
    filters.value = { ...filters.value, ...newFilters }
  }

  function clearFilters() {
    filters.value = {
      search: '',
      status: 'all',
      dateFrom: null,
      dateTo: null
    }
  }

  function setSelectedTask(task) {
    selectedTask.value = task
  }

  function clearError() {
    error.value = null
  }

  function clearCurrentTask() {
    currentTask.value = null
  }

  return {
    // State
    tasks,
    selectedTask,
    currentTask,
    loading,
    error,
    filters,
    // Getters
    pendingTasks,
    inProgressTasks,
    porVerificarTasks,
    completedTasks,
    tasksCount,
    // Actions
    fetchTasks,
    fetchTask,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    reassignTask,
    setFilters,
    clearFilters,
    setSelectedTask,
    clearError,
    clearCurrentTask
  }
})
