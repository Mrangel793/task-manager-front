import { ref, computed, onMounted } from 'vue'
import { pushService } from '@/services'

const permission = ref(typeof Notification !== 'undefined' ? Notification.permission : 'denied')
const isSubscribed = ref(false)
const isLoading = ref(false)

export function usePushNotifications() {
  const canAskPermission = computed(() => permission.value === 'default')
  const isGranted = computed(() => permission.value === 'granted')
  const isDenied = computed(() => permission.value === 'denied')

  // Verificar estado de suscripción al montar
  onMounted(async () => {
    const subscribed = await pushService.isSubscribed()
    isSubscribed.value = subscribed
  })

  /**
   * Suscribirse a notificaciones push
   */
  const subscribe = async () => {
    if (isLoading.value) return false

    isLoading.value = true

    try {
      // Solicitar permiso al usuario
      const granted = await pushService.requestPermission()
      permission.value = Notification.permission

      if (!granted) {
        throw new Error('Permiso de notificaciones denegado')
      }

      // Obtener la clave pública VAPID desde las variables de entorno
      const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY

      if (!vapidKey) {
        throw new Error('La clave VAPID no está configurada')
      }

      // Suscribirse a notificaciones push
      const subscription = await pushService.subscribe(vapidKey)

      // Enviar suscripción al servidor
      await pushService.sendSubscriptionToServer(subscription)

      // Actualizar estado
      isSubscribed.value = true
      localStorage.setItem('push_subscribed', 'true')

      return true
    } catch (error) {
      console.error('Error al suscribirse a notificaciones:', error)
      isSubscribed.value = false
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Cancelar suscripción a notificaciones push
   */
  const unsubscribe = async () => {
    if (isLoading.value) return false

    isLoading.value = true

    try {
      await pushService.unsubscribe()

      // Actualizar estado
      isSubscribed.value = false
      localStorage.removeItem('push_subscribed')

      return true
    } catch (error) {
      console.error('Error al cancelar suscripción:', error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Verificar soporte de notificaciones
   */
  const isSupported = computed(() => {
    return 'Notification' in window &&
           'serviceWorker' in navigator &&
           'PushManager' in window
  })

  return {
    // Estado
    permission,
    isSubscribed,
    isLoading,
    // Computed
    canAskPermission,
    isGranted,
    isDenied,
    isSupported,
    // Métodos
    subscribe,
    unsubscribe
  }
}
