import api from './api'

// Cache para operadores (se invalida cada 2 minutos o manualmente)
let operatorsCache = null
let operatorsCacheTime = 0
const CACHE_DURATION = 2 * 60 * 1000 // 2 minutos

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
   * Usa caché para evitar llamadas repetidas
   */
  async getOperators(forceRefresh = false) {
    const now = Date.now()

    // Retornar caché si es válido
    if (!forceRefresh && operatorsCache && (now - operatorsCacheTime) < CACHE_DURATION) {
      return operatorsCache
    }

    const response = await api.get('v1/users/', {
      params: { role: 'operador' }
    })
    const data = response.data.data || response.data

    // Guardar en caché
    operatorsCache = data
    operatorsCacheTime = now

    return data
  },

  /**
   * Invalidar caché de operadores (llamar después de crear/editar usuarios)
   */
  clearOperatorsCache() {
    operatorsCache = null
    operatorsCacheTime = 0
  },

  /**
   * Crear un nuevo usuario
   */
  async createUser(userData) {
    const response = await api.post('v1/users/', userData)
    this.clearOperatorsCache() // Invalidar caché
    return response.data.data || response.data
  },

  /**
   * Actualizar un usuario existente
   */
  async updateUser(id, userData) {
    const response = await api.patch(`v1/users/${id}/`, userData)
    this.clearOperatorsCache() // Invalidar caché
    return response.data.data || response.data
  },

  /**
   * Eliminar un usuario
   */
  async deleteUser(id) {
    const response = await api.delete(`v1/users/${id}`)
    this.clearOperatorsCache() // Invalidar caché
    return response.data
  }
}
