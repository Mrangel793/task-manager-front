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

      // Preservar tareas optimistas que aún no se sincronizaron
      const pendingOptimistic = tasks.value.filter(t => t._isPending)

      // Manejar diferentes estructuras de respuesta del backend
      let serverTasks
      if (Array.isArray(data)) {
        serverTasks = data
      } else if (data.tasks && Array.isArray(data.tasks)) {
        serverTasks = data.tasks
      } else if (data.data && Array.isArray(data.data)) {
        serverTasks = data.data
      } else {
        console.error('Respuesta inesperada del backend:', data)
        serverTasks = []
      }

      tasks.value = [...serverTasks, ...pendingOptimistic]

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

    // 1. Crear tarea temporal con ID único
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2)}`
    const optimisticTask = {
      ...taskData,
      id: tempId,
      status: 'Pendiente',
      created_at: new Date().toISOString(),
      _isPending: true,
      _originalData: taskData
    }

    // 2. Agregar inmediatamente a la lista (UI instantánea)
    tasks.value.push(optimisticTask)

    // 3. Sincronizar con backend en segundo plano
    try {
      const data = await taskService.createTask(taskData)
      const serverTask = data.task || data
      const index = tasks.value.findIndex(t => t.id === tempId)
      if (index !== -1) {
        tasks.value[index] = serverTask
      }
      invalidateCache()
      return serverTask
    } catch (err) {
      const index = tasks.value.findIndex(t => t.id === tempId)
      if (index !== -1) {
        tasks.value[index] = {
          ...optimisticTask,
          _syncError: true,
          _errorMessage: err.message
        }
      }
      error.value = err.message
      throw err
    }
  }

  async function retrySyncTask(tempId) {
    const index = tasks.value.findIndex(t => t.id === tempId)
    if (index === -1) return

    const task = tasks.value[index]
    if (!task._originalData) return

    tasks.value[index] = { ...task, _syncError: false, _isPending: true }

    try {
      const data = await taskService.createTask(task._originalData)
      const serverTask = data.task || data
      const idx = tasks.value.findIndex(t => t.id === tempId)
      if (idx !== -1) {
        tasks.value[idx] = serverTask
      }
      invalidateCache()
      return serverTask
    } catch (err) {
      const idx = tasks.value.findIndex(t => t.id === tempId)
      if (idx !== -1) {
        tasks.value[idx] = { ...tasks.value[idx], _syncError: true, _errorMessage: err.message }
      }
      throw err
    }
  }

  function removePendingTask(tempId) {
    tasks.value = tasks.value.filter(t => t.id !== tempId)
  }

  // Re-sincronizar tareas pendientes de sesiones anteriores
  function retrySyncPendingTasks() {
    const pending = tasks.value.filter(t => t._isPending && !t._syncError)
    pending.forEach(t => retrySyncTask(t.id).catch(() => {}))
  }
  retrySyncPendingTasks()

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
    clearCurrentTask,
    retrySyncTask,
    removePendingTask
  }
})
