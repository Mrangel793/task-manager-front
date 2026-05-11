<template>
  <div class="max-w-3xl mx-auto">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Google Calendar</h1>
      <p class="text-gray-600 mt-1">Sincroniza tus tareas con tu calendario de Google</p>
    </div>

    <!-- Estado de conexión -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Estado de la Conexión</h2>

      <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div class="flex items-center gap-3">
          <!-- Ícono Google Calendar -->
          <div
            :class="isConnected ? 'bg-green-100' : 'bg-gray-100'"
            class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          >
            <svg class="w-6 h-6" :class="isConnected ? 'text-green-600' : 'text-gray-400'" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zM8 17H6v-7h2v7zm-1-8a1 1 0 110-2 1 1 0 010 2zm10 8h-2v-3.5c0-.83-.67-1.5-1.5-1.5S12 12.67 12 13.5V17h-2v-7h2v1.07A3.5 3.5 0 0117 14.5V17z"/>
            </svg>
          </div>
          <div>
            <p class="font-medium text-gray-900">Google Calendar</p>
            <p class="text-sm text-gray-600">
              {{ isConnected ? 'Conectado — las tareas se sincronizan automáticamente' : 'No conectado' }}
            </p>
          </div>
        </div>
        <span
          :class="isConnected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'"
          class="px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0"
        >
          {{ isConnected ? 'Conectado' : 'Desconectado' }}
        </span>
      </div>
    </div>

    <!-- Qué se sincroniza -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Qué se sincroniza</h2>
      <ul class="space-y-2 text-sm text-gray-700">
        <li class="flex items-start gap-2">
          <svg class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
          Tareas asignadas a ti — aparecen en tu calendario como eventos
        </li>
        <li class="flex items-start gap-2">
          <svg class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
          Tareas que tú creaste y asignaste a otros (si eres Admin)
        </li>
        <li class="flex items-start gap-2">
          <svg class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
          Cambios de título, descripción y fechas se reflejan en tiempo real
        </li>
        <li class="flex items-start gap-2">
          <svg class="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
          </svg>
          Las tareas completadas o canceladas se eliminan del calendario
        </li>
      </ul>
    </div>

    <!-- Acciones -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Acciones</h2>

      <div class="space-y-3">
        <!-- Conectar -->
        <div v-if="!isConnected" class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <p class="font-medium text-gray-900">Conectar Google Calendar</p>
            <p class="text-sm text-gray-600">Autoriza el acceso para sincronizar tus tareas</p>
          </div>
          <BaseButton @click="handleConnect" :loading="isLoading" variant="primary">
            <svg class="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Conectar con Google
          </BaseButton>
        </div>

        <!-- Desconectar -->
        <div v-if="isConnected" class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <p class="font-medium text-gray-900">Desconectar Google Calendar</p>
            <p class="text-sm text-gray-600">Las tareas existentes en tu calendario no serán eliminadas</p>
          </div>
          <BaseButton @click="showConfirmDisconnect = true" variant="secondary">
            Desconectar
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Modal confirmación desconexión -->
    <div v-if="showConfirmDisconnect" class="fixed inset-0 z-50 overflow-y-auto" @click.self="showConfirmDisconnect = false">
      <div class="flex min-h-screen items-center justify-center p-4">
        <div class="fixed inset-0 bg-black bg-opacity-50"></div>
        <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 class="text-lg font-bold text-gray-900 mb-2">¿Desconectar Google Calendar?</h3>
          <p class="text-sm text-gray-600 mb-6">
            Se detendrá la sincronización de nuevas tareas. Los eventos ya creados en tu calendario no serán eliminados.
          </p>
          <div class="flex justify-end gap-3">
            <button
              @click="showConfirmDisconnect = false"
              class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="handleDisconnect"
              :disabled="isLoading"
              class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {{ isLoading ? 'Desconectando...' : 'Sí, desconectar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { googleCalendarService } from '@/services'
import { useToast } from '@/composables/useToast'
import BaseButton from '@/components/common/BaseButton.vue'

const route = useRoute()
const toast = useToast()

const isConnected = ref(false)
const isLoading = ref(false)
const showConfirmDisconnect = ref(false)

const fetchStatus = async () => {
  try {
    const data = await googleCalendarService.getStatus()
    isConnected.value = data.connected
  } catch {
    // silencioso — si falla, se muestra como desconectado
  }
}

const handleConnect = async () => {
  isLoading.value = true
  try {
    const url = await googleCalendarService.getConnectUrl()
    window.open(url, '_blank', 'width=600,height=700,noopener')
    toast.success('Ventana de autorización abierta. Una vez que autorices, recarga esta página.')
  } catch {
    toast.error('No se pudo obtener la URL de conexión. Intenta de nuevo.')
  } finally {
    isLoading.value = false
  }
}

const handleDisconnect = async () => {
  isLoading.value = true
  try {
    await googleCalendarService.disconnect()
    isConnected.value = false
    showConfirmDisconnect.value = false
    toast.success('Google Calendar desconectado correctamente.')
  } catch {
    toast.error('No se pudo desconectar. Intenta de nuevo.')
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await fetchStatus()

  // Detectar retorno del flujo OAuth
  if (route.query.google === 'connected') {
    isConnected.value = true
    toast.success('¡Google Calendar conectado exitosamente!')
  } else if (route.query.google === 'error') {
    const reason = route.query.reason ? `: ${route.query.reason}` : ''
    toast.error(`Error al conectar Google Calendar${reason}`)
  }
})
</script>
