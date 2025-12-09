<template>
  <aside class="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
    <!-- Logo section -->
    <div class="h-16 flex items-center px-6 border-b border-gray-200">
      <router-link to="/" class="flex items-center space-x-2">
        <div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <span class="text-xl font-bold text-gray-900">TaskManager</span>
      </router-link>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto py-4 px-3">
      <div v-for="section in navigationSections" :key="section.name" class="mb-6">
        <!-- Section title -->
        <h3 v-if="section.title" class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          {{ section.title }}
        </h3>

        <!-- Navigation items -->
        <router-link
          v-for="item in section.items"
          :key="item.name"
          :to="item.to"
          class="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors mb-1 group"
          :class="isActive(item.to)
            ? 'bg-primary-50 text-primary-700'
            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'"
        >
          <svg
            class="w-5 h-5 mr-3 transition-colors"
            :class="isActive(item.to) ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
          </svg>
          <span>{{ item.label }}</span>

          <!-- Badge -->
          <span
            v-if="item.badge"
            class="ml-auto inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full"
            :class="item.badge.color || 'bg-red-100 text-red-600'"
          >
            {{ item.badge.count }}
          </span>
        </router-link>
      </div>
    </nav>

    <!-- Footer info -->
    <div class="p-4 border-t border-gray-200">
      <div class="text-xs text-gray-500 text-center">
        <p>{{ appName }} v{{ appVersion }}</p>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore, useNotificationStore } from '@/stores'

const route = useRoute()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const { unreadCount } = storeToRefs(notificationStore)

const appName = import.meta.env.VITE_APP_NAME || 'Task Manager'
const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0'

const userRole = computed(() => authStore.userRole)

// Cargar notificaciones al montar (para actualizar el conteo)
onMounted(async () => {
  try {
    // Si ya hay notificaciones cargadas, no volver a cargar
    if (notificationStore.notifications.length === 0) {
      await notificationStore.fetchNotifications()
    }
  } catch (error) {
    console.error('Error al cargar notificaciones:', error)
  }
})

// Elementos de navegación base (todos los usuarios) - Ahora reactivos
const baseItems = computed(() => [
  {
    name: 'dashboard',
    label: 'Dashboard',
    to: '/',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
  },
  {
    name: 'tasks',
    label: 'Mis Tareas',
    to: '/tasks',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4'
  },
  {
    name: 'notifications',
    label: 'Notificaciones',
    to: '/notifications',
    icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
    // Badge dinámico desde el store
    badge: unreadCount.value > 0 ? { count: unreadCount.value, color: 'bg-red-100 text-red-600' } : null
  },
  {
    name: 'profile',
    label: 'Mi Perfil',
    to: '/profile',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
  }
])


// Elementos solo para Admin
const adminItems = [
  {
    name: 'users',
    label: 'Usuarios',
    to: '/admin/users',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
  },
  {
    name: 'team-overview',
    label: 'Resumen de Equipo',
    to: '/team/overview',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
  },
  {
    name: 'reports',
    label: 'Reportes',
    to: '/admin/reports',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
  }
  // Configuración - Comentado temporalmente (no implementado)
  // {
  //   name: 'settings',
  //   label: 'Configuración',
  //   to: '/admin/settings',
  //   icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z'
  // }
]

const navigationSections = computed(() => {
  const sections = []

  // Sección principal (todos los usuarios)
  sections.push({
    name: 'main',
    items: baseItems.value  // Ahora es .value porque baseItems es computed
  })

  // Sección de administración (solo Admin)
  if (userRole.value === 'admin') {
    sections.push({
      name: 'admin',
      title: 'Administración',
      items: adminItems
    })
  }

  return sections
})

const isActive = (path) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}
</script>
