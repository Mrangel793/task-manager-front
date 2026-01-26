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
  },

  /**
   * Crear un nuevo usuario
   */
  async createUser(userData) {
    const response = await api.post('v1/users/', userData)
    return response.data.data || response.data
  },

  /**
   * Actualizar un usuario existente
   */
  async updateUser(id, userData) {
    const response = await api.patch(`v1/users/${id}/`, userData)
    return response.data.data || response.data
  },

  /**
   * Eliminar un usuario
   */
  async deleteUser(id) {
    const response = await api.delete(`v1/users/${id}/`)
    return response.data
  }
}
