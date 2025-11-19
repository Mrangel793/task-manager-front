<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-4"
    >
      <div
        v-if="showPrompt"
        class="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-lg shadow-xl p-4 z-50 border border-gray-200"
      >
        <div class="flex items-start gap-3">
          <!-- Icon -->
          <div class="flex-shrink-0">
            <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
          </div>

          <!-- Content -->
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900">Recibe avisos de tareas</h3>
            <p class="text-sm text-gray-600 mt-1">
              Te notificaremos cuando te asignen tareas o estén por vencer
            </p>
          </div>

          <!-- Close button -->
          <button
            @click="dismiss"
            class="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Actions -->
        <div class="flex gap-2 mt-4">
          <button
            @click="enableNotifications"
            :disabled="isLoading"
            class="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <span v-if="!isLoading">Activar</span>
            <span v-else class="flex items-center justify-center">
              <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
          </button>
          <button
            @click="dismiss"
            :disabled="isLoading"
            class="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Ahora no
          </button>
        </div>

        <!-- Not supported message -->
        <div v-if="!isSupported" class="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
          Las notificaciones no están disponibles en este navegador
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePushNotifications } from '@/composables/usePushNotifications'
import { useToast } from '@/composables/useToast'

const { canAskPermission, subscribe, isSupported, isLoading } = usePushNotifications()
const toast = useToast()
const showPrompt = ref(false)

onMounted(() => {
  // No mostrar si el usuario ya descartó el prompt o ya está suscrito
  const dismissed = localStorage.getItem('push_prompt_dismissed')
  const subscribed = localStorage.getItem('push_subscribed')

  // Solo mostrar si:
  // 1. No se ha descartado antes
  // 2. No está suscrito
  // 3. Puede pedir permiso (permiso está en "default")
  // 4. Las notificaciones están soportadas
  if (!dismissed && !subscribed && canAskPermission.value && isSupported.value) {
    // Mostrar después de 3 segundos para no interrumpir la experiencia inicial
    setTimeout(() => {
      showPrompt.value = true
    }, 3000)
  }
})

const enableNotifications = async () => {
  try {
    const success = await subscribe()

    if (success) {
      showPrompt.value = false
      toast.success('Notificaciones activadas correctamente')
    } else {
      toast.error('No se pudieron activar las notificaciones')
    }
  } catch (error) {
    console.error('Error al activar notificaciones:', error)
    toast.error('Error al activar las notificaciones')
  }
}

const dismiss = () => {
  showPrompt.value = false
  // Guardar que el usuario descartó el prompt (se volverá a mostrar en 7 días)
  const dismissedUntil = Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 días
  localStorage.setItem('push_prompt_dismissed', dismissedUntil.toString())
}
</script>
