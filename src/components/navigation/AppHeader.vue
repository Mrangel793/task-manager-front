<template>
  <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
    <!-- Left side -->
    <div class="flex items-center space-x-4 flex-1">
      <!-- Mobile menu button (toggle sidebar on mobile) -->
      <button
        @click="$emit('toggle-sidebar')"
        class="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <!-- Logo (mobile only) -->
      <router-link to="/" class="lg:hidden flex items-center space-x-2">
        <div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
      </router-link>

      <!-- Page title -->
      <div class="hidden lg:block">
        <h1 class="text-xl font-semibold text-gray-900">{{ pageTitle }}</h1>
        <p v-if="pageSubtitle" class="text-sm text-gray-500">{{ pageSubtitle }}</p>
      </div>
    </div>

    <!-- Center - Action slot (desktop) -->
    <div class="hidden lg:flex flex-1 justify-center">
      <slot name="actions"></slot>
    </div>

    <!-- Right side -->
    <div class="flex items-center space-x-2 lg:space-x-4 flex-1 justify-end">
      <!-- Search (desktop) -->
      <button
        class="hidden lg:flex items-center px-3 py-2 text-sm text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        @click="$emit('open-search')"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span>Buscar...</span>
        <kbd class="ml-2 px-2 py-0.5 text-xs font-semibold text-gray-800 bg-white border border-gray-200 rounded">⌘K</kbd>
      </button>

      <!-- Notifications -->
      <button
        @click="$emit('open-notifications')"
        class="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        <!-- Badge -->
        <span
          v-if="notificationCount > 0"
          class="absolute top-1 right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full"
        >
          {{ notificationCount > 9 ? '9+' : notificationCount }}
        </span>
      </button>

      <!-- User info (desktop) -->
      <div class="hidden lg:flex items-center text-sm">
        <div class="text-right mr-3">
          <p class="font-medium text-gray-900">{{ userName }}</p>
          <p class="text-xs text-gray-500">{{ userRole }}</p>
        </div>
      </div>

      <!-- User menu -->
      <UserMenu />
    </div>
  </header>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore, useNotificationStore } from '@/stores'
import UserMenu from './UserMenu.vue'

defineEmits(['toggle-sidebar', 'open-search', 'open-notifications'])

const route = useRoute()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const { unreadCount } = storeToRefs(notificationStore)

// Iniciar polling de notificaciones al montar el header
onMounted(() => {
  // Cargar conteo inicial si no hay notificaciones cargadas
  if (notificationStore.notifications.length === 0) {
    notificationStore.fetchUnreadCount()
  }
  // Iniciar polling cada 30 segundos
  notificationStore.startPolling(30000)
})

const pageTitle = computed(() => route.meta.title || 'TaskManager')
const pageSubtitle = computed(() => route.meta.subtitle || '')

const userName = computed(() => authStore.userName || 'Usuario')
const userRole = computed(() => {
  const role = authStore.userRole
  const roleLabels = {
    admin: 'Administrador',
    supervisor: 'Supervisor',
    operario: 'Operario',
    user: 'Usuario'
  }
  return roleLabels[role] || role
})

// Contador de notificaciones desde el store
const notificationCount = unreadCount
</script>
