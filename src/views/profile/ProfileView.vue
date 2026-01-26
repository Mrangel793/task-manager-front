<template>
  <div class="max-w-4xl mx-auto">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Mi Perfil</h1>
      <p class="text-sm text-gray-600 mt-1">Información personal y configuración</p>
    </div>

    <!-- Profile Card -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <!-- Header with background -->
      <div class="h-32 bg-gradient-to-r from-primary-500 to-primary-600"></div>

      <!-- Content -->
      <div class="px-6 pb-6">
        <!-- Avatar and basic info -->
        <div class="flex flex-col sm:flex-row sm:items-end sm:space-x-5 -mt-16">
          <!-- Avatar -->
          <div class="flex">
            <div class="inline-flex items-center justify-center w-32 h-32 rounded-full bg-white border-4 border-white shadow-lg">
              <div class="w-28 h-28 rounded-full bg-primary-100 flex items-center justify-center">
                <span class="text-4xl font-bold text-primary-600">
                  {{ getUserInitials }}
                </span>
              </div>
            </div>
          </div>

          <!-- Name and role -->
          <div class="mt-6 sm:mt-0 sm:flex-1 sm:min-w-0 sm:flex sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
            <div class="flex-1 min-w-0">
              <h2 class="text-2xl font-bold text-gray-900 truncate">
                {{ user?.name || 'Usuario' }}
              </h2>
              <div class="mt-1">
                <span
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                  :class="getRoleBadgeClass"
                >
                  {{ getRoleLabel }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="mt-6 border-t border-gray-200"></div>

        <!-- Info sections -->
        <div class="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <!-- Contact info -->
          <div>
            <h3 class="text-sm font-semibold text-gray-900 mb-4">Información de Contacto</h3>
            <dl class="space-y-3">
              <div>
                <dt class="text-xs font-medium text-gray-500 uppercase">Teléfono</dt>
                <dd class="mt-1 text-sm text-gray-900 flex items-center">
                  <svg class="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {{ user?.phone || 'No especificado' }}
                </dd>
              </div>
            </dl>
          </div>

          <!-- Account info -->
          <div>
            <h3 class="text-sm font-semibold text-gray-900 mb-4">Información de Cuenta</h3>
            <dl class="space-y-3">
              <div>
                <dt class="text-xs font-medium text-gray-500 uppercase">Rol</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ getRoleLabel }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500 uppercase">Miembro desde</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ getMemberSince }}</dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- Divider -->
        <div class="mt-6 border-t border-gray-200"></div>

        <!-- Action buttons -->
        <div class="mt-6 flex flex-col sm:flex-row gap-3">
          <BaseButton
            @click="goToEditProfile"
            variant="primary"
            class="flex-1 sm:flex-none"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar Perfil
          </BaseButton>

          <BaseButton
            @click="goToChangePassword"
            variant="secondary"
            class="flex-1 sm:flex-none"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            Cambiar Contraseña
          </BaseButton>

        </div>
      </div>
    </div>

    <!-- Modal Cambiar Contraseña -->
    <div v-if="showPasswordModal" class="fixed inset-0 z-50 overflow-y-auto" @click.self="closePasswordModal">
      <div class="flex min-h-screen items-center justify-center p-4">
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>

        <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-gray-900">Cambiar Contraseña</h3>
            <button @click="closePasswordModal" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form @submit.prevent="handleChangePassword" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Contraseña actual <span class="text-red-500">*</span>
              </label>
              <input
                v-model="passwordForm.current_password"
                type="password"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Ingresa tu contraseña actual"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Nueva contraseña <span class="text-red-500">*</span>
              </label>
              <input
                v-model="passwordForm.new_password"
                type="password"
                required
                minlength="8"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Mínimo 8 caracteres"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Confirmar nueva contraseña <span class="text-red-500">*</span>
              </label>
              <input
                v-model="passwordForm.new_password_confirmation"
                type="password"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Repite la nueva contraseña"
              />
            </div>

            <div v-if="passwordError" class="text-sm text-red-600">
              {{ passwordError }}
            </div>

            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                @click="closePasswordModal"
                class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="isChangingPassword"
                class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {{ isChangingPassword ? 'Guardando...' : 'Cambiar Contraseña' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Settings shortcut -->
    <div class="mt-6 bg-white rounded-lg shadow p-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="flex-shrink-0">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h3 class="text-base font-semibold text-gray-900">Configuración</h3>
            <p class="text-sm text-gray-600">Preferencias y notificaciones</p>
          </div>
        </div>
        <BaseButton
          @click="goToSettings"
          variant="secondary"
          size="sm"
        >
          Abrir
          <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores'
import { authService } from '@/services'
import { useToast } from '@/composables/useToast'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const user = computed(() => authStore.user)

// Variables para cambio de contraseña
const showPasswordModal = ref(false)
const isChangingPassword = ref(false)
const passwordError = ref('')
const passwordForm = ref({
  current_password: '',
  new_password: '',
  new_password_confirmation: ''
})

const getUserInitials = computed(() => {
  if (!user.value?.name) return 'U'

  const names = user.value.name.trim().split(' ')
  if (names.length === 1) {
    return names[0].substring(0, 2).toUpperCase()
  }
  return (names[0][0] + names[names.length - 1][0]).toUpperCase()
})

const getRoleLabel = computed(() => {
  const role = authStore.userRole
  const labels = {
    admin: 'Administrador',
    supervisor: 'Supervisor',
    operario: 'Operador'
  }
  return labels[role] || 'Usuario'
})

const getRoleBadgeClass = computed(() => {
  const role = authStore.userRole
  const classes = {
    admin: 'bg-purple-100 text-purple-800',
    supervisor: 'bg-blue-100 text-blue-800',
    operario: 'bg-green-100 text-green-800'
  }
  return classes[role] || 'bg-gray-100 text-gray-800'
})

const getMemberSince = computed(() => {
  if (!user.value?.created_at) return 'No disponible'

  const date = new Date(user.value.created_at)
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const goToEditProfile = () => {
  router.push('/profile/edit')
}

const goToChangePassword = () => {
  showPasswordModal.value = true
  passwordError.value = ''
  passwordForm.value = {
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  }
}

const closePasswordModal = () => {
  showPasswordModal.value = false
  passwordError.value = ''
}

const handleChangePassword = async () => {
  passwordError.value = ''

  // Validar que las contraseñas coincidan
  if (passwordForm.value.new_password !== passwordForm.value.new_password_confirmation) {
    passwordError.value = 'Las contraseñas no coinciden'
    return
  }

  // Validar longitud mínima
  if (passwordForm.value.new_password.length < 8) {
    passwordError.value = 'La contraseña debe tener al menos 8 caracteres'
    return
  }

  isChangingPassword.value = true

  try {
    await authService.changePassword({
      current_password: passwordForm.value.current_password,
      new_password: passwordForm.value.new_password,
      new_password_confirmation: passwordForm.value.new_password_confirmation
    })

    toast.success('Contraseña cambiada correctamente')
    closePasswordModal()
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Error al cambiar la contraseña'
    passwordError.value = message
    toast.error(message)
  } finally {
    isChangingPassword.value = false
  }
}

const goToSettings = () => {
  router.push('/profile/settings')
}
</script>
