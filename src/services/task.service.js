import api from './api'

/**
 * Preparar los datos de fecha/hora para enviar al backend
 * Combina due_date y due_time en un formato que el backend pueda interpretar correctamente
 */
const prepareDateTimeData = (taskData) => {
  const data = { ...taskData }

  // Si hay fecha y hora, combinarlas en un formato ISO sin zona horaria
  // para que el backend las interprete como hora local
  if (data.due_date && data.due_time) {
    // Crear datetime local: "2026-01-23T19:50:00" (sin Z al final)
    data.due_time = `${data.due_date}T${data.due_time}:00`
  } else if (data.due_date && !data.due_time) {
    // Si solo hay fecha, usar mediodía para evitar problemas de zona horaria
    data.due_time = `${data.due_date}T12:00:00`
  }

  return data
}

/**
 * Procesar tarea recibida del backend para normalizar fechas
 */
const processTaskDates = (task) => {
  if (!task) return task

  // Si due_time contiene un datetime ISO completo, extraer la fecha y hora locales
  if (task.due_time && task.due_time.includes('T')) {
    const dt = new Date(task.due_time)
    // Extraer fecha en formato local YYYY-MM-DD
    const year = dt.getFullYear()
    const month = String(dt.getMonth() + 1).padStart(2, '0')
    const day = String(dt.getDate()).padStart(2, '0')
    task.due_date = `${year}-${month}-${day}`

    // Extraer hora en formato HH:MM
    const hours = String(dt.getHours()).padStart(2, '0')
    const minutes = String(dt.getMinutes()).padStart(2, '0')
    task.due_time_formatted = `${hours}:${minutes}`
  }

  return task
}

export const taskService = {
  /**
   * Obtener todas las tareas con filtros
   */
  async getTasks(filters = {}) {
    const response = await api.get('v1/tasks/', { params: filters })
    // El backend envuelve la respuesta en { success, message, data }
    const data = response.data.data || response.data
    // Procesar fechas de cada tarea
    if (Array.isArray(data)) {
      return data.map(processTaskDates)
    }
    return data
  },

  /**
   * Obtener una tarea por ID
   */
  async getTask(id) {
    const response = await api.get(`v1/tasks/${id}/`)
    // El backend envuelve la respuesta en { success, message, data }
    const data = response.data.data || response.data
    return processTaskDates(data)
  },

  /**
   * Crear una nueva tarea
   */
  async createTask(taskData) {
    const preparedData = prepareDateTimeData(taskData)
    const response = await api.post('v1/tasks/', preparedData)
    // El backend envuelve la respuesta en { success, message, data }
    const data = response.data.data || response.data
    return processTaskDates(data)
  },

  /**
   * Actualizar una tarea completa
   */
  async updateTask(id, taskData) {
    const preparedData = prepareDateTimeData(taskData)
    const response = await api.put(`v1/tasks/${id}/`, preparedData)
    // El backend envuelve la respuesta en { success, message, data }
    const data = response.data.data || response.data
    return processTaskDates(data)
  },

  /**
   * Actualizar solo el estado de una tarea
   * Usa PATCH /api/v1/tasks/{uuid} con { status }
   * El backend detecta automáticamente cuando solo se envía status
   * y usa updateTaskStatus() que registra el cambio en el historial
   */
  async updateTaskStatus(id, status) {
    const response = await api.patch(`v1/tasks/${id}`, { status })
    // El backend envuelve la respuesta en { success, message, data }
    return response.data.data || response.data
  },

  /**
   * Eliminar una tarea
   */
  async deleteTask(id) {
    const response = await api.delete(`v1/tasks/${id}/`)
    // El backend envuelve la respuesta en { success, message, data }
    return response.data.data || response.data
  },

  /**
   * Obtener tareas por estado
   */
  async getTasksByStatus(status) {
    return this.getTasks({ status })
  },

  /**
   * Obtener tareas por prioridad
   */
  async getTasksByPriority(priority) {
    return this.getTasks({ priority })
  },

  /**
   * Obtener estadísticas de tareas
   */
  async getTaskStats() {
    const response = await api.get('v1/tasks/stats/')
    // El backend envuelve la respuesta en { success, message, data }
    return response.data.data || response.data
  },

  /**
   * Reasignar una tarea a un nuevo operador
   * Solo para Supervisor/Admin
   */
  async reassignTask(taskId, newAssigneeId) {
    const response = await api.post(`v1/tasks/${taskId}/reassign`, {
      assignee_id: newAssigneeId
    })
    // El backend envuelve la respuesta en { success, message, data }
    return response.data.data || response.data
  },

  /**
   * Obtener historial de cambios de una tarea
   * GET /api/v1/tasks/{task_id}/history
   */
  async getTaskHistory(taskId) {
    try {
      const response = await api.get(`v1/tasks/${taskId}/history`)
      // El backend envuelve la respuesta en { success, message, data }
      return response.data.data || response.data
    } catch (error) {
      // Si el endpoint no existe aún, retornar array vacío
      console.warn('Endpoint de historial no disponible:', error)
      return []
    }
  }
}
