<template>
  <div class="space-y-6">
    <!-- Sección: Tu Organización -->
    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        Tu Organización
      </h3>

      <div v-if="organization" class="space-y-3">
        <div class="flex items-center gap-3">
          <span class="text-sm font-medium text-gray-500 min-w-[80px]">Nombre:</span>
          <span class="text-sm text-gray-900">{{ organization.name }}</span>
        </div>
        <div v-if="organization.slug" class="flex items-center gap-3">
          <span class="text-sm font-medium text-gray-500 min-w-[80px]">Slug:</span>
          <span class="text-sm text-gray-600 font-mono bg-gray-50 px-2 py-0.5 rounded">{{ organization.slug }}</span>
        </div>
      </div>

      <div v-else class="text-sm text-gray-500">
        No se encontró información de la organización.
      </div>
    </div>

    <!-- Sección: Código de Invitación (solo Admin) -->
    <div v-if="isAdmin && inviteCode" class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
        <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
        Invitar usuarios
      </h3>
      <p class="text-sm text-gray-500 mb-4">
        Comparte este código para que otros se unan a tu organización.
      </p>

      <div class="flex items-center gap-3">
        <div class="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 font-mono text-lg text-gray-900 tracking-wider text-center select-all">
          {{ inviteCode }}
        </div>
        <button
          @click="copyInviteCode"
          class="inline-flex items-center gap-2 px-4 py-3 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
        >
          <svg v-if="!copied" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          {{ copied ? 'Copiado' : 'Copiar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores'

const authStore = useAuthStore()

const organization = computed(() => authStore.userOrganization)
const isAdmin = computed(() => authStore.userRole === 'admin')
const inviteCode = computed(() => organization.value?.invite_code)

const copied = ref(false)

const copyInviteCode = async () => {
  if (!inviteCode.value) return
  try {
    await navigator.clipboard.writeText(inviteCode.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // Fallback para navegadores sin clipboard API
    const textArea = document.createElement('textarea')
    textArea.value = inviteCode.value
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}
</script>
