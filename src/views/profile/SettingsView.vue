<template>
  <div class="max-w-3xl mx-auto">
    <!-- Header -->
    <div class="mb-6">
      <button
        @click="goBack"
        class="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
      >
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Volver
      </button>
      <h1 class="text-2xl font-bold text-gray-900">Configuración</h1>
      <p class="text-sm text-gray-600 mt-1">Preferencias de notificaciones y aplicación</p>
    </div>

    <!-- Success message -->
    <div v-if="successMessage" class="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
      <p class="text-sm">{{ successMessage }}</p>
    </div>

    <!-- Notificaciones -->
    <div class="bg-white rounded-lg shadow mb-6">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Notificaciones</h2>
        <p class="text-sm text-gray-600 mt-1">Gestiona cómo y cuándo recibes notificaciones</p>
      </div>

      <div class="p-6 space-y-6">
        <!-- Push notifications -->
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h3 class="text-sm font-medium text-gray-900">Notificaciones push</h3>
            <p class="text-sm text-gray-600 mt-1">
              Recibe notificaciones en tu dispositivo
            </p>
          </div>
          <button
            @click="toggleSetting('pushNotifications')"
            :class="settings.pushNotifications ? 'bg-primary-600' : 'bg-gray-200'"
            class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <span
              :class="settings.pushNotifications ? 'translate-x-5' : 'translate-x-0'"
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
            ></span>
          </button>
        </div>

        <!-- Email notifications -->
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h3 class="text-sm font-medium text-gray-900">Notificaciones por email</h3>
            <p class="text-sm text-gray-600 mt-1">
              Recibe resúmenes diarios por correo electrónico
            </p>
          </div>
          <button
            @click="toggleSetting('emailNotifications')"
            :class="settings.emailNotifications ? 'bg-primary-600' : 'bg-gray-200'"
            class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <span
              :class="settings.emailNotifications ? 'translate-x-5' : 'translate-x-0'"
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
            ></span>
          </button>
        </div>

        <!-- WhatsApp notifications -->
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h3 class="text-sm font-medium text-gray-900">Notificaciones por WhatsApp</h3>
            <p class="text-sm text-gray-600 mt-1">
              Recibe alertas importantes por WhatsApp
            </p>
          </div>
          <button
            @click="toggleSetting('whatsappNotifications')"
            :class="settings.whatsappNotifications ? 'bg-primary-600' : 'bg-gray-200'"
            class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <span
              :class="settings.whatsappNotifications ? 'translate-x-5' : 'translate-x-0'"
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
            ></span>
          </button>
        </div>

        <div class="border-t border-gray-200 pt-6">
          <h3 class="text-sm font-medium text-gray-900 mb-4">Tipos de notificaciones</h3>

          <div class="space-y-4">
            <label class="flex items-start">
              <input
                v-model="settings.notifyNewTask"
                type="checkbox"
                class="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              >
              <span class="ml-3">
                <span class="text-sm text-gray-900 block">Nueva tarea asignada</span>
                <span class="text-sm text-gray-500">Cuando se te asigne una nueva tarea</span>
              </span>
            </label>

            <label class="flex items-start">
              <input
                v-model="settings.notifyTaskDue"
                type="checkbox"
                class="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              >
              <span class="ml-3">
                <span class="text-sm text-gray-900 block">Tareas próximas a vencer</span>
                <span class="text-sm text-gray-500">Recordatorios antes de la fecha límite</span>
              </span>
            </label>

            <label class="flex items-start">
              <input
                v-model="settings.notifyTaskStatusChange"
                type="checkbox"
                class="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              >
              <span class="ml-3">
                <span class="text-sm text-gray-900 block">Cambios de estado</span>
                <span class="text-sm text-gray-500">Cuando una tarea cambia de estado</span>
              </span>
            </label>

            <label class="flex items-start">
              <input
                v-model="settings.notifyComments"
                type="checkbox"
                class="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              >
              <span class="ml-3">
                <span class="text-sm text-gray-900 block">Comentarios y menciones</span>
                <span class="text-sm text-gray-500">Cuando alguien te menciona o comenta</span>
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- No Molestar -->
    <div class="bg-white rounded-lg shadow mb-6">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">No Molestar</h2>
        <p class="text-sm text-gray-600 mt-1">Configura horarios en los que no recibirás notificaciones</p>
      </div>

      <div class="p-6 space-y-6">
        <!-- Activar/desactivar -->
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h3 class="text-sm font-medium text-gray-900">Activar modo No Molestar</h3>
            <p class="text-sm text-gray-600 mt-1">
              Las notificaciones se silenciarán durante el horario configurado
            </p>
          </div>
          <button
            @click="toggleSetting('doNotDisturb')"
            :class="settings.doNotDisturb ? 'bg-primary-600' : 'bg-gray-200'"
            class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <span
              :class="settings.doNotDisturb ? 'translate-x-5' : 'translate-x-0'"
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
            ></span>
          </button>
        </div>

        <!-- Horario -->
        <div v-if="settings.doNotDisturb" class="border-t border-gray-200 pt-6">
          <h3 class="text-sm font-medium text-gray-900 mb-4">Horario</h3>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Desde
              </label>
              <input
                v-model="settings.doNotDisturbStart"
                type="time"
                class="input-field w-full"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Hasta
              </label>
              <input
                v-model="settings.doNotDisturbEnd"
                type="time"
                class="input-field w-full"
              >
            </div>
          </div>

          <p class="mt-2 text-xs text-gray-500">
            Ejemplo: De 22:00 a 07:00 (no recibirás notificaciones durante la noche)
          </p>
        </div>
      </div>
    </div>

    <!-- Preferencias de la aplicación -->
    <div class="bg-white rounded-lg shadow">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Preferencias de la Aplicación</h2>
        <p class="text-sm text-gray-600 mt-1">Personaliza tu experiencia</p>
      </div>

      <div class="p-6 space-y-6">
        <!-- Idioma -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Idioma
          </label>
          <select
            v-model="settings.language"
            class="input-field w-full max-w-xs"
          >
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </div>

        <!-- Tema -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">
            Tema
          </label>
          <div class="flex gap-4">
            <label
              class="relative flex cursor-pointer rounded-lg border p-4 focus:outline-none"
              :class="settings.theme === 'light' ? 'border-primary-600 ring-2 ring-primary-600' : 'border-gray-300'"
            >
              <input
                v-model="settings.theme"
                type="radio"
                value="light"
                class="sr-only"
              >
              <span class="flex flex-1">
                <span class="flex flex-col">
                  <span class="block text-sm font-medium text-gray-900">Claro</span>
                  <span class="mt-1 flex items-center text-sm text-gray-500">Tema claro</span>
                </span>
              </span>
            </label>

            <label
              class="relative flex cursor-pointer rounded-lg border p-4 focus:outline-none"
              :class="settings.theme === 'dark' ? 'border-primary-600 ring-2 ring-primary-600' : 'border-gray-300'"
            >
              <input
                v-model="settings.theme"
                type="radio"
                value="dark"
                class="sr-only"
              >
              <span class="flex flex-1">
                <span class="flex flex-col">
                  <span class="block text-sm font-medium text-gray-900">Oscuro</span>
                  <span class="mt-1 flex items-center text-sm text-gray-500">Tema oscuro</span>
                </span>
              </span>
            </label>

            <label
              class="relative flex cursor-pointer rounded-lg border p-4 focus:outline-none"
              :class="settings.theme === 'auto' ? 'border-primary-600 ring-2 ring-primary-600' : 'border-gray-300'"
            >
              <input
                v-model="settings.theme"
                type="radio"
                value="auto"
                class="sr-only"
              >
              <span class="flex flex-1">
                <span class="flex flex-col">
                  <span class="block text-sm font-medium text-gray-900">Auto</span>
                  <span class="mt-1 flex items-center text-sm text-gray-500">Según sistema</span>
                </span>
              </span>
            </label>
          </div>
        </div>

        <!-- Zona horaria -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Zona horaria
          </label>
          <select
            v-model="settings.timezone"
            class="input-field w-full max-w-md"
          >
            <option value="America/Bogota">Bogotá (GMT-5)</option>
            <option value="America/Mexico_City">Ciudad de México (GMT-6)</option>
            <option value="America/Buenos_Aires">Buenos Aires (GMT-3)</option>
            <option value="America/Santiago">Santiago (GMT-3)</option>
            <option value="America/Lima">Lima (GMT-5)</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Botones de acción -->
    <div class="mt-6 flex justify-end gap-3">
      <BaseButton
        variant="secondary"
        @click="goBack"
      >
        Cancelar
      </BaseButton>
      <BaseButton
        variant="primary"
        @click="saveSettings"
        :loading="isSaving"
        loading-text="Guardando..."
      >
        Guardar cambios
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()
const toast = useToast()

// TODO: Cargar desde el backend o localStorage
const settings = reactive({
  // Notificaciones
  pushNotifications: true,
  emailNotifications: true,
  whatsappNotifications: false,
  notifyNewTask: true,
  notifyTaskDue: true,
  notifyTaskStatusChange: true,
  notifyComments: true,

  // No molestar
  doNotDisturb: false,
  doNotDisturbStart: '22:00',
  doNotDisturbEnd: '07:00',

  // Preferencias
  language: 'es',
  theme: 'light',
  timezone: 'America/Bogota'
})

const isSaving = ref(false)
const successMessage = ref('')

const toggleSetting = (key) => {
  settings[key] = !settings[key]
}

const saveSettings = async () => {
  isSaving.value = true
  successMessage.value = ''

  try {
    // TODO: Guardar en el backend
    // await settingsService.update(settings)

    // Guardar temporalmente en localStorage
    localStorage.setItem('userSettings', JSON.stringify(settings))

    successMessage.value = 'Configuración guardada correctamente'
    toast.success('Configuración guardada correctamente')

    // Scroll to top to show success message
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (error) {
    toast.error('Error al guardar la configuración')
  } finally {
    isSaving.value = false
  }
}

const goBack = () => {
  router.push('/profile')
}

// Cargar configuración guardada
const loadSettings = () => {
  try {
    const saved = localStorage.getItem('userSettings')
    if (saved) {
      Object.assign(settings, JSON.parse(saved))
    }
  } catch (error) {
    console.error('Error loading settings:', error)
  }
}

loadSettings()
</script>
