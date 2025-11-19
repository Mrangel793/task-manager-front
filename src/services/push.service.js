import api from './api'

/**
 * Convierte una clave VAPID en formato base64 a Uint8Array
 */
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export const pushService = {
  /**
   * Solicitar permiso de notificaciones al usuario
   */
  async requestPermission() {
    if (!('Notification' in window)) {
      throw new Error('Las notificaciones no están soportadas en este navegador')
    }

    const permission = await Notification.requestPermission()
    return permission === 'granted'
  },

  /**
   * Suscribirse a notificaciones push
   */
  async subscribe(vapidPublicKey) {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker no está soportado en este navegador')
    }

    if (!('PushManager' in window)) {
      throw new Error('Push notifications no están soportadas en este navegador')
    }

    try {
      // Esperar a que el service worker esté listo
      const registration = await navigator.serviceWorker.ready

      // Verificar si ya existe una suscripción
      let subscription = await registration.pushManager.getSubscription()

      // Si no existe, crear una nueva
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
        })
      }

      return subscription
    } catch (error) {
      console.error('Error al suscribirse a push notifications:', error)
      throw error
    }
  },

  /**
   * Enviar suscripción al servidor
   */
  async sendSubscriptionToServer(subscription) {
    try {
      const response = await api.post('v1/push/subscribe', subscription)
      return response.data
    } catch (error) {
      console.error('Error al enviar suscripción al servidor:', error)
      throw error
    }
  },

  /**
   * Cancelar suscripción
   */
  async unsubscribe() {
    if (!('serviceWorker' in navigator)) {
      return
    }

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        // Notificar al servidor
        await api.post('v1/push/unsubscribe', {
          endpoint: subscription.endpoint
        })

        // Cancelar suscripción local
        await subscription.unsubscribe()
      }
    } catch (error) {
      console.error('Error al cancelar suscripción:', error)
      throw error
    }
  },

  /**
   * Verificar si hay una suscripción activa
   */
  async isSubscribed() {
    if (!('serviceWorker' in navigator)) {
      return false
    }

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      return subscription !== null
    } catch (error) {
      console.error('Error al verificar suscripción:', error)
      return false
    }
  }
}
