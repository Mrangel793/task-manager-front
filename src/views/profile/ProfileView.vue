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
              <div>
                <dt class="text-xs font-medium text-gray-500 uppercase">WhatsApp vinculado</dt>
                <dd class="mt-1 text-sm flex items-center">
                  <span
                    v-if="user?.whatsapp_linked"
                    class="inline-flex items-center text-green-700 font-medium"
                  >
                    <svg class="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    Vinculado
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center text-gray-500"
                  >
                    <svg class="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    </svg>
                    No vinculado
                  </span>
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

          <BaseButton
            @click="handleWhatsAppToggle"
            variant="secondary"
            class="flex-1 sm:flex-none"
          >
            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            {{ user?.whatsapp_linked ? 'Desvincular' : 'Vincular' }} WhatsApp
          </BaseButton>
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
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores'
import { useToast } from '@/composables/useToast'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const user = computed(() => authStore.user)

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
  // TODO: Implementar cambio de contraseña
  toast.info('Funcionalidad en desarrollo')
}

const goToSettings = () => {
  router.push('/profile/settings')
}

const handleWhatsAppToggle = () => {
  // TODO: Implementar vinculación/desvinculación de WhatsApp
  const action = user.value?.whatsapp_linked ? 'desvinculación' : 'vinculación'
  toast.info(`Funcionalidad de ${action} de WhatsApp en desarrollo`)
}
</script>
