<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 lg:hidden">
    <div class="flex items-center justify-around h-16">
      <router-link
        v-for="item in navItems"
        :key="item.name"
        :to="item.to"
        class="flex flex-col items-center justify-center flex-1 h-full transition-colors relative"
        :class="isActive(item.to)
          ? 'text-primary-600'
          : 'text-gray-500 hover:text-gray-700'"
      >
        <!-- Icon -->
        <div class="relative">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
          </svg>

          <!-- Badge -->
          <span
            v-if="item.badge && item.badge.count > 0"
            class="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full min-w-[18px]"
          >
            {{ item.badge.count > 9 ? '9+' : item.badge.count }}
          </span>
        </div>

        <!-- Label -->
        <span class="text-xs mt-1 font-medium">{{ item.label }}</span>

        <!-- Active indicator -->
        <div
          v-if="isActive(item.to)"
          class="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-primary-600 rounded-full"
        ></div>
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore, useNotificationStore, useTaskStore } from '@/stores'

const route = useRoute()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const taskStore = useTaskStore()

const userRole = computed(() => authStore.userRole)
const { unreadCount } = storeToRefs(notificationStore)
const { completedTasks } = storeToRefs(taskStore)

// Para operario: cuenta tanto 'Completada' como 'Por Verificar' (tareas entregadas pendientes de verificación)
const operarioDoneCount = computed(() =>
  taskStore.tasks.filter(t => t.status === 'Completada' || t.status === 'Por Verificar').length
)

// Navegación para Operario
const operarioNav = computed(() => [
  {
    name: 'tasks',
    label: 'Tareas',
    to: '/',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4'
  },
  {
    name: 'completadas',
    label: 'Completadas',
    to: '/verificar',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    badge: { count: operarioDoneCount.value }
  },
  {
    name: 'notifications',
    label: 'Alertas',
    to: '/notifications',
    icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
    badge: { count: unreadCount.value }
  },
  {
    name: 'profile',
    label: 'Perfil',
    to: '/profile',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
  }
])

// Navegación para Supervisor
const supervisorNav = [
  {
    name: 'tasks',
    label: 'Tareas',
    to: '/',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4'
  },
  {
    name: 'team',
    label: 'Equipo',
    to: '/team',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
  },
  {
    name: 'profile',
    label: 'Perfil',
    to: '/profile',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
  }
]

// Navegación para Admin (computed para reactividad del badge)
const adminNav = computed(() => [
  {
    name: 'tasks',
    label: 'Tareas',
    to: '/admin/dashboard',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4'
  },
  {
    name: 'contacts',
    label: 'Contactos',
    to: '/contacts',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z'
  },
  {
    name: 'team',
    label: 'Equipo',
    to: '/team/overview',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
  },
  {
    name: 'profile',
    label: 'Perfil',
    to: '/profile',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
  }
])

const navItems = computed(() => {
  switch (userRole.value) {
    case 'admin':
      return adminNav.value
    case 'supervisor':
      return supervisorNav
    case 'operario':
    default:
      return operarioNav.value
  }
})

const isActive = (path) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}
</script>
