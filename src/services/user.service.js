import api from './api'

export const userService = {
  /**
   * Obtener todos los usuarios
   */
  async getUsers(params = {}) {
    const response = await api.get('v1/users/', { params })
    // El backend envuelve la respuesta en { success, message, data }
    return response.data.data || response.data
  },

  /**
   * Obtener un usuario por ID
   */
  async getUser(id) {
    const response = await api.get(`v1/users/${id}/`)
    return response.data.data || response.data
  },

  /**
   * Obtener solo operadores (para asignación de tareas)
   */
  async getOperators() {
    const response = await api.get('v1/users/', {
      params: { role: 'operador' }
    })
    return response.data.data || response.data
  }
}
