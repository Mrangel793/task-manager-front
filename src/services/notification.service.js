import api from './api'

/**
 * Servicio para gestión de notificaciones
 */
const notificationService = {
  /**
   * Obtener todas las notificaciones del usuario actual
   * @returns {Promise} Lista de notificaciones
   */
  async getNotifications() {
    try {
      const response = await api.get('v1/notifications/')
      // El backend devuelve { success, data: { notifications: [...], unread_count: N } }
      const data = response.data.data || response.data
      return {
        notifications: data.notifications || [],
        unread_count: data.unread_count || 0
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
      const response = await api.get('v1/notifications/unread/')
      const data = response.data.data || response.data
      return {
        notifications: data.notifications || [],
        unread_count: data.unread_count || 0
      }
    } catch (error) {
      console.error('Error al obtener notificaciones no leídas:', error)
      throw error
    }
  },

  /**
   * Marcar una notificación como leída
   * @param {string|number} notificationId - ID de la notificación
   * @returns {Promise} Notificación actualizada
   */
  async markAsRead(notificationId) {
    try {
      const response = await api.patch(`v1/notifications/${notificationId}/read/`)
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
      const response = await api.post('v1/notifications/mark-all-read/')
      return response.data.data || response.data
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error)
      throw error
    }
  },

  /**
   * Eliminar una notificación
   * @param {string|number} notificationId - ID de la notificación
   * @returns {Promise} Resultado de la operación
   */
  async deleteNotification(notificationId) {
    try {
      const response = await api.delete(`v1/notifications/${notificationId}/`)
      return response.data
    } catch (error) {
      console.error('Error al eliminar notificación:', error)
      throw error
    }
  },

  /**
   * Obtener el conteo de notificaciones no leídas
   * @returns {Promise<number>} Cantidad de notificaciones no leídas
   */
  async getUnreadCount() {
    try {
      const response = await api.get('v1/notifications/unread-count/')
      return response.data.data?.count || response.data.count || 0
    } catch (error) {
      console.error('Error al obtener conteo de no leídas:', error)
      return 0
    }
  }
}

export default notificationService
