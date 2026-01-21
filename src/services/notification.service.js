import api from './api'

/**
 * Servicio para gestión de notificaciones
 *
 * Endpoints del backend:
 * - GET /api/v1/notifications - Lista de notificaciones
 * - GET /api/v1/notifications/unread-count - Contador de no leídas
 * - POST /api/v1/notifications/mark-all-read - Marcar todas como leídas
 * - PATCH /api/v1/notifications/{id}/read - Marcar una como leída
 */
const notificationService = {
  /**
   * Obtener todas las notificaciones del usuario actual
   * @param {Object} params - Parámetros opcionales
   * @param {boolean} params.unread_only - Solo no leídas
   * @param {number} params.per_page - Notificaciones por página (default: 20)
   * @param {number} params.page - Número de página
   * @returns {Promise} Lista de notificaciones con paginación
   */
  async getNotifications(params = {}) {
    try {
      const response = await api.get('v1/notifications', { params })
      // El backend devuelve { success, data: { notifications: [...], unread_count: N, pagination: {...} } }
      const data = response.data.data || response.data
      return {
        notifications: data.notifications || [],
        unread_count: data.unread_count || 0,
        pagination: data.pagination || null
      }
    } catch (error) {
      console.error('Error al obtener notificaciones:', error)
      throw error
    }
  },

  /**
   * Obtener notificaciones no leídas
   * @returns {Promise} Lista de notificaciones no leídas
   */
  async getUnreadNotifications() {
    try {
      // Usar el parámetro unread_only=true
      const response = await api.get('v1/notifications', {
        params: { unread_only: true }
      })
      const data = response.data.data || response.data
      return {
        notifications: data.notifications || [],
        unread_count: data.unread_count || 0,
        pagination: data.pagination || null
      }
    } catch (error) {
      console.error('Error al obtener notificaciones no leídas:', error)
      throw error
    }
  },

  /**
   * Marcar una notificación como leída
   * @param {string} notificationId - ID de la notificación (UUID)
   * @returns {Promise} Notificación actualizada
   */
  async markAsRead(notificationId) {
    try {
      const response = await api.patch(`v1/notifications/${notificationId}/read`)
      return response.data.data || response.data
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error)
      throw error
    }
  },

  /**
   * Marcar todas las notificaciones como leídas
   * @returns {Promise} Resultado de la operación
   */
  async markAllAsRead() {
    try {
      const response = await api.post('v1/notifications/mark-all-read')
      return response.data.data || response.data
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error)
      throw error
    }
  },

  /**
   * Eliminar una notificación
   * @param {string} notificationId - ID de la notificación (UUID)
   * @returns {Promise} Resultado de la operación
   */
  async deleteNotification(notificationId) {
    try {
      const response = await api.delete(`v1/notifications/${notificationId}`)
      return response.data
    } catch (error) {
      console.error('Error al eliminar notificación:', error)
      throw error
    }
  },

  /**
   * Obtener el conteo de notificaciones no leídas
   * Útil para el badge en el sidebar
   * @returns {Promise<number>} Cantidad de notificaciones no leídas
   */
  async getUnreadCount() {
    try {
      const response = await api.get('v1/notifications/unread-count')
      // El backend devuelve { success, data: { unread_count: N } }
      return response.data.data?.unread_count || response.data.unread_count || 0
    } catch (error) {
      console.error('Error al obtener conteo de no leídas:', error)
      return 0
    }
  }
}

export default notificationService
