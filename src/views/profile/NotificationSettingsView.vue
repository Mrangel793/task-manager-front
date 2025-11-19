<template>
  <div class="max-w-3xl mx-auto">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Configuración de Notificaciones</h1>
      <p class="text-gray-600 mt-1">Administra cómo y cuándo recibes notificaciones</p>
    </div>

    <!-- Estado del sistema -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Estado del Sistema</h2>

      <div class="space-y-4">
        <!-- Soporte del navegador -->
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center gap-3">
            <div :class="isSupported ? 'bg-green-100' : 'bg-red-100'" class="w-10 h-10 rounded-full flex items-center justify-center">
              <svg v-if="isSupported" class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <svg v-else class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <p class="font-medium text-gray-900">Soporte del navegador</p>
              <p class="text-sm text-gray-600">{{ isSupported ? 'Compatible' : 'No compatible' }}</p>
            </div>
          </div>
        </div>

        <!-- Permiso de notificaciones -->
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center gap-3">
            <div :class="permissionBgClass" class="w-10 h-10 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6" :class="permissionTextClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div>
              <p class="font-medium text-gray-900">Permiso de notificaciones</p>
              <p class="text-sm text-gray-600">{{ permissionText }}</p>
            </div>
          </div>
          <span :class="permissionBadgeClass" class="px-3 py-1 rounded-full text-xs font-semibold">
            {{ permission }}
          </span>
        </div>

        <!-- Estado de suscripción -->
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center gap-3">
            <div :class="isSubscribed ? 'bg-green-100' : 'bg-gray-100'" class="w-10 h-10 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6" :class="isSubscribed ? 'text-green-600' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="font-medium text-gray-900">Suscripción</p>
              <p class="text-sm text-gray-600">{{ isSubscribed ? 'Activa' : 'Inactiva' }}</p>
            </div>
          </div>
        </div>

        <!-- Clave VAPID configurada -->
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center gap-3">
            <div :class="vapidConfigured ? 'bg-green-100' : 'bg-yellow-100'" class="w-10 h-10 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6" :class="vapidConfigured ? 'text-green-600' : 'text-yellow-600'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <div>
              <p class="font-medium text-gray-900">Clave VAPID</p>
              <p class="text-sm text-gray-600">{{ vapidConfigured ? 'Configurada' : 'No configurada' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Acciones -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Acciones</h2>

      <div class="space-y-3">
        <!-- Activar notificaciones -->
        <div v-if="!isSubscribed && isSupported" class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <p class="font-medium text-gray-900">Activar notificaciones</p>
            <p class="text-sm text-gray-600">Recibe avisos sobre tus tareas</p>
          </div>
          <BaseButton
            @click="handleSubscribe"
            :loading="isLoading"
            variant="primary"
          >
            Activar
          </BaseButton>
        </div>

        <!-- Desactivar notificaciones -->
        <div v-if="isSubscribed" class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <p class="font-medium text-gray-900">Desactivar notificaciones</p>
            <p class="text-sm text-gray-600">Deja de recibir notificaciones push</p>
          </div>
          <BaseButton
            @click="handleUnsubscribe"
            :loading="isLoading"
            variant="secondary"
          >
            Desactivar
          </BaseButton>
        </div>

        <!-- Probar notificación -->
        <div v-if="isSubscribed" class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <p class="font-medium text-gray-900">Probar notificación</p>
            <p class="text-sm text-gray-600">Envía una notificación de prueba</p>
          </div>
          <BaseButton
            @click="testNotification"
            :loading="testingNotification"
            variant="primary"
          >
            Probar
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Información de depuración -->
    <div v-if="debugInfo" class="bg-gray-800 rounded-lg shadow-md p-6">
      <h2 class="text-lg font-semibold text-white mb-4">Información de Depuración</h2>
      <pre class="text-xs text-green-400 overflow-x-auto">{{ debugInfo }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePushNotifications } from '@/composables/usePushNotifications'
import { useToast } from '@/composables/useToast'
import BaseButton from '@/components/common/BaseButton.vue'

const {
  permission,
  isSubscribed,
  isSupported,
  isLoading,
  subscribe,
  unsubscribe
} = usePushNotifications()

const toast = useToast()
const testingNotification = ref(false)
const debugInfo = ref('')

// Verificar si la clave VAPID está configurada
const vapidConfigured = computed(() => {
  return !!import.meta.env.VITE_VAPID_PUBLIC_KEY
})

const permissionText = computed(() => {
  switch (permission.value) {
    case 'granted':
      return 'Concedido - Recibirás notificaciones'
    case 'denied':
      return 'Denegado - No se pueden enviar notificaciones'
    case 'default':
      return 'Pendiente - No has respondido aún'
    default:
      return 'Desconocido'
  }
})

const permissionBgClass = computed(() => {
  switch (permission.value) {
    case 'granted':
      return 'bg-green-100'
    case 'denied':
      return 'bg-red-100'
    default:
      return 'bg-gray-100'
  }
})

const permissionTextClass = computed(() => {
  switch (permission.value) {
    case 'granted':
      return 'text-green-600'
    case 'denied':
      return 'text-red-600'
    default:
      return 'text-gray-400'
  }
})

const permissionBadgeClass = computed(() => {
  switch (permission.value) {
    case 'granted':
      return 'bg-green-100 text-green-700'
    case 'denied':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
})

const handleSubscribe = async () => {
  const success = await subscribe()

  if (success) {
    toast.success('Notificaciones activadas correctamente')
    await updateDebugInfo()
  } else {
    toast.error('No se pudieron activar las notificaciones')
  }
}

const handleUnsubscribe = async () => {
  const success = await unsubscribe()

  if (success) {
    toast.success('Notificaciones desactivadas')
    debugInfo.value = ''
  } else {
    toast.error('No se pudo desactivar las notificaciones')
  }
}

const testNotification = async () => {
  testingNotification.value = true

  try {
    // Mostrar notificación local de prueba
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('Notificación de Prueba', {
        body: 'Esta es una notificación de prueba desde Task Manager',
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: 'test',
        data: {
          url: '/profile/notifications'
        }
      })

      notification.onclick = () => {
        window.focus()
        notification.close()
      }

      toast.success('Notificación de prueba enviada')
    } else {
      toast.error('No tienes permisos de notificación')
    }
  } catch (error) {
    console.error('Error al probar notificación:', error)
    toast.error('Error al enviar notificación de prueba')
  } finally {
    testingNotification.value = false
  }
}

const updateDebugInfo = async () => {
  if (!isSubscribed.value) return

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (subscription) {
      debugInfo.value = JSON.stringify({
        endpoint: subscription.endpoint,
        expirationTime: subscription.expirationTime,
        keys: {
          p256dh: subscription.toJSON().keys.p256dh?.substring(0, 20) + '...',
          auth: subscription.toJSON().keys.auth?.substring(0, 20) + '...'
        }
      }, null, 2)
    }
  } catch (error) {
    console.error('Error obteniendo info de suscripción:', error)
  }
}

onMounted(() => {
  if (isSubscribed.value) {
    updateDebugInfo()
  }
})
</script>
