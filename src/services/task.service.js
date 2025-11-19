import api from './api'

export const taskService = {
  /**
   * Obtener todas las tareas con filtros
   */
  async getTasks(filters = {}) {
    const response = await api.get('v1/tasks/', { params: filters })
    // El backend envuelve la respuesta en { success, message, data }
    return response.data.data || response.data
  },

  /**
   * Obtener una tarea por ID
   */
  async getTask(id) {
    const response = await api.get(`v1/tasks/${id}/`)
    // El backend envuelve la respuesta en { success, message, data }
    return response.data.data || response.data
  },

  /**
   * Crear una nueva tarea
   */
  async createTask(taskData) {
    const response = await api.post('v1/tasks/', taskData)
    // El backend envuelve la respuesta en { success, message, data }
    return response.data.data || response.data
  },

  /**
   * Actualizar una tarea completa
   */
  async updateTask(id, taskData) {
    const response = await api.put(`v1/tasks/${id}/`, taskData)
    // El backend envuelve la respuesta en { success, message, data }
    return response.data.data || response.data
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
