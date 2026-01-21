import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import notificationService from '@/services/notification.service'

export const useNotificationStore = defineStore('notification', () => {
  // State
  const notifications = ref([])
  const loading = ref(false)
  const error = ref(null)
  const pagination = ref(null)
  const pollingInterval = ref(null)
  const serverUnreadCount = ref(0) // Conteo del servidor

  // Getters
  const unreadCount = computed(() => {
    // Preferir el conteo del servidor si está disponible
    if (serverUnreadCount.value > 0) return serverUnreadCount.value
    return notifications.value.filter(n => !n.is_read).length
  })

  const unreadNotifications = computed(() =>
    notifications.value.filter(n => !n.is_read)
  )

  const readNotifications = computed(() =>
    notifications.value.filter(n => n.is_read)
  )

  /**
   * Agrupar notificaciones por fecha
   */
  const groupedNotifications = computed(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    const groups = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: []
    }

    notifications.value.forEach(notification => {
      const notifDate = new Date(notification.created_at)

      // Calcular tiempo relativo
      const diffMs = now - notifDate
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)

      let timeAgo
      if (diffMins < 1) {
        timeAgo = 'Justo ahora'
      } else if (diffMins < 60) {
        timeAgo = `Hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`
      } else if (diffHours < 24) {
        timeAgo = `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`
      } else if (diffDays < 7) {
        timeAgo = `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`
      } else {
        timeAgo = notifDate.toLocaleDateString('es-CO')
      }

      const enrichedNotification = {
        ...notification,
        timeAgo,
        // Normalizar campos para compatibilidad con la vista
        read: notification.is_read,
        timestamp: notification.created_at
      }

      if (notifDate >= today) {
        groups.today.push(enrichedNotification)
      } else if (notifDate >= yesterday) {
        groups.yesterday.push(enrichedNotification)
      } else if (notifDate >= weekAgo) {
        groups.thisWeek.push(enrichedNotification)
      } else {
        groups.older.push(enrichedNotification)
      }
    })

    const result = []
    if (groups.today.length) result.push({ title: 'Hoy', notifications: groups.today })
    if (groups.yesterday.length) result.push({ title: 'Ayer', notifications: groups.yesterday })
    if (groups.thisWeek.length) result.push({ title: 'Esta semana', notifications: groups.thisWeek })
    if (groups.older.length) result.push({ title: 'Anteriores', notifications: groups.older })

    return result
  })

  // Actions
  /**
   * Cargar todas las notificaciones
   * @param {Object} params - Parámetros opcionales (page, per_page, unread_only)
   */
  async function fetchNotifications(params = {}) {
    loading.value = true
    error.value = null

    try {
      const data = await notificationService.getNotifications(params)
      // data = { notifications: [...], unread_count: N, pagination: {...} }
      notifications.value = data.notifications || []
      serverUnreadCount.value = data.unread_count || 0
      pagination.value = data.pagination || null
      return data.notifications
    } catch (err) {
      error.value = err.message || 'Error al cargar notificaciones'
      console.error('Error fetching notifications:', err)
      // En caso de error, inicializar como array vacío
      notifications.value = []
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Cargar solo notificaciones no leídas
   */
  async function fetchUnreadNotifications() {
    loading.value = true
    error.value = null

    try {
      const data = await notificationService.getUnreadNotifications()
      // data = { notifications: [...], unread_count: N, pagination: {...} }
      const unreadNotifs = data.notifications || []
      serverUnreadCount.value = data.unread_count || 0
      // Actualizar solo las no leídas manteniendo las leídas existentes
      const readNotifs = notifications.value.filter(n => n.is_read)
      notifications.value = [...unreadNotifs, ...readNotifs]
      return unreadNotifs
    } catch (err) {
      error.value = err.message || 'Error al cargar notificaciones no leídas'
      console.error('Error fetching unread notifications:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Marcar una notificación como leída
   */
  async function markAsRead(notificationId) {
    try {
      await notificationService.markAsRead(notificationId)

      // Actualizar en el estado local
      const notification = notifications.value.find(n => n.id === notificationId)
      if (notification && !notification.is_read) {
        notification.is_read = true
        notification.read = true
        notification.read_at = new Date().toISOString()
        // Decrementar el contador
        if (serverUnreadCount.value > 0) {
          serverUnreadCount.value--
        }
      }
    } catch (err) {
      error.value = err.message || 'Error al marcar como leída'
      console.error('Error marking notification as read:', err)
      throw err
    }
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  async function markAllAsRead() {
    try {
      await notificationService.markAllAsRead()

      // Actualizar en el estado local
      const now = new Date().toISOString()
      notifications.value.forEach(n => {
        n.is_read = true
        n.read = true
        n.read_at = now
      })
      serverUnreadCount.value = 0
    } catch (err) {
      error.value = err.message || 'Error al marcar todas como leídas'
      console.error('Error marking all as read:', err)
      throw err
    }
  }

  /**
   * Eliminar una notificación
   */
  async function deleteNotification(notificationId) {
    try {
      await notificationService.deleteNotification(notificationId)

      // Eliminar del estado local
      const index = notifications.value.findIndex(n => n.id === notificationId)
      if (index !== -1) {
        notifications.value.splice(index, 1)
      }
    } catch (err) {
      error.value = err.message || 'Error al eliminar notificación'
      console.error('Error deleting notification:', err)
      throw err
    }
  }

  /**
   * Obtener el conteo de notificaciones no leídas
   */
  async function fetchUnreadCount() {
    try {
      return await notificationService.getUnreadCount()
    } catch (err) {
      console.error('Error fetching unread count:', err)
      return 0
    }
  }

  /**
   * Agregar una nueva notificación (para WebSocket/Push)
   */
  function addNotification(notification) {
    notifications.value.unshift({
      ...notification,
      is_read: false,
      read: false
    })
  }

  /**
   * Limpiar el store
   */
  function clear() {
    notifications.value = []
    error.value = null
    serverUnreadCount.value = 0
    pagination.value = null
    stopPolling()
  }

  /**
   * Iniciar polling para actualizar el contador de notificaciones
   * @param {number} intervalMs - Intervalo en milisegundos (default: 30000 = 30 segundos)
   */
  function startPolling(intervalMs = 30000) {
    // Detener polling existente si lo hay
    stopPolling()

    // Hacer una primera consulta inmediata
    fetchUnreadCount()

    // Configurar el intervalo
    pollingInterval.value = setInterval(async () => {
      try {
        const count = await notificationService.getUnreadCount()
        serverUnreadCount.value = count
      } catch (err) {
        console.error('Error en polling de notificaciones:', err)
      }
    }, intervalMs)
  }

  /**
   * Detener polling
   */
  function stopPolling() {
    if (pollingInterval.value) {
      clearInterval(pollingInterval.value)
      pollingInterval.value = null
    }
  }

  return {
    // State
    notifications,
    loading,
    error,
    pagination,

    // Getters
    unreadCount,
    unreadNotifications,
    readNotifications,
    groupedNotifications,

    // Actions
    fetchNotifications,
    fetchUnreadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchUnreadCount,
    addNotification,
    clear,
    startPolling,
    stopPolling
  }
})
