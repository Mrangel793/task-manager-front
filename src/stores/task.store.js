import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { taskService } from '@/services'

export const useTaskStore = defineStore('task', () => {
  // State
  const tasks = ref([])
  const selectedTask = ref(null)
  const currentTask = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const filters = ref({
    search: '',
    status: 'all',
    priority: 'all',
    dateFrom: null,
    dateTo: null
  })

  // Getters
  const pendingTasks = computed(() =>
    tasks.value.filter(task => task.status === 'Pendiente')
  )

  const inProgressTasks = computed(() =>
    tasks.value.filter(task => task.status === 'En Progreso')
  )

  const completedTasks = computed(() =>
    tasks.value.filter(task => task.status === 'Completada')
  )

  const tasksByPriority = computed(() => {
    const grouped = {
      high: [],
      medium: [],
      low: []
    }

    tasks.value.forEach(task => {
      if (task.priority && grouped[task.priority]) {
        grouped[task.priority].push(task)
      }
    })

    return grouped
  })

  const tasksCount = computed(() => ({
    total: tasks.value.length,
    pending: pendingTasks.value.length,
    inProgress: inProgressTasks.value.length,
    completed: completedTasks.value.length
  }))

  // Actions
  async function fetchTasks(params) {
    loading.value = true
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

      return data
    } catch (err) {
      error.value = err.message
      tasks.value = [] // Asegurar que siempre sea un array
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

  async function createTask(taskData) {
    loading.value = true
    error.value = null

    try {
      const data = await taskService.createTask(taskData)

      // Extraer la tarea si está envuelta
      const task = data.task || data

      tasks.value.push(task)
      return task
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateTask(id, taskData) {
    loading.value = true
    error.value = null

    try {
      const data = await taskService.updateTask(id, taskData)

      // Extraer la tarea si está envuelta
      const task = data.task || data

      const index = tasks.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tasks.value[index] = task
      }
      if (currentTask.value?.id === id) {
        currentTask.value = task
      }
      return task
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteTask(id) {
    loading.value = true
    error.value = null

    try {
      await taskService.deleteTask(id)
      tasks.value = tasks.value.filter(task => task.id !== id)
      if (currentTask.value?.id === id) {
        currentTask.value = null
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateTaskStatus(id, status) {
    loading.value = true
    error.value = null

    try {
      const data = await taskService.updateTaskStatus(id, status)

      // Extraer la tarea si está envuelta
      const task = data.task || data

      const index = tasks.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tasks.value[index] = task
      }
      if (currentTask.value?.id === id) {
        currentTask.value = task
      }
      return task
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function reassignTask(taskId, newAssigneeId) {
    loading.value = true
    error.value = null

    try {
      const data = await taskService.reassignTask(taskId, newAssigneeId)

      // Extraer la tarea si está envuelta
      const task = data.task || data

      // Actualizar tarea en el array de tareas
      const index = tasks.value.findIndex(t => t.id === taskId)
      if (index !== -1) {
        tasks.value[index] = task
      }
      // Actualizar tarea actual si es la misma
      if (currentTask.value?.id === taskId) {
        currentTask.value = task
      }
      return task
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  function setFilters(newFilters) {
    filters.value = { ...filters.value, ...newFilters }
  }

  function clearFilters() {
    filters.value = {
      search: '',
      status: 'all',
      priority: 'all',
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
    completedTasks,
    tasksByPriority,
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
