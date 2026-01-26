<template>
  <div class="relative" ref="menuRef">
    <!-- Avatar trigger -->
    <button
      @click="toggleMenu"
      class="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
      :class="{ 'bg-gray-100': isOpen }"
    >
      <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold shadow-md">
        {{ userInitials }}
      </div>
    </button>

    <!-- Dropdown menu -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 z-50"
      >
        <!-- User info -->
        <div class="px-4 py-3">
          <p class="text-sm font-medium text-gray-900">{{ userName }}</p>
          <p class="text-xs text-gray-500 mt-0.5">{{ userPhone }}</p>
          <p class="text-xs text-primary-600 font-medium mt-1">{{ userRole }}</p>
        </div>

        <!-- Menu items -->
        <div class="py-1">
          <router-link
            v-for="item in menuItems"
            :key="item.name"
            :to="item.to"
            @click="closeMenu"
            class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg class="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
            </svg>
            {{ item.label }}
          </router-link>
        </div>

        <!-- Logout -->
        <div class="py-1">
          <button
            @click="handleLogout"
            class="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores'
import { useToast } from '@/composables/useToast'
import { useClickOutside } from '@/composables/useClickOutside'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const menuRef = ref(null)
const isOpen = ref(false)

const userName = computed(() => authStore.userName || 'Usuario')
const userPhone = computed(() => authStore.userPhone || '')
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

const userInitials = computed(() => {
  const name = authStore.userName || 'U'
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
})

const menuItems = [
  {
    name: 'profile',
    label: 'Ver perfil',
    to: '/profile',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
  },
  {
    name: 'settings',
    label: 'Configuración',
    to: '/profile/settings',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z'
  }
]

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const closeMenu = () => {
  isOpen.value = false
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    toast.success('Sesión cerrada correctamente')
    router.push('/login')
  } catch (error) {
    toast.error('Error al cerrar sesión')
  }
}

// Cerrar al hacer click fuera
useClickOutside(menuRef, closeMenu)
</script>
