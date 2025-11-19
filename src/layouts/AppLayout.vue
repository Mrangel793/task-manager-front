<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar (Desktop) -->
    <Sidebar class="hidden lg:flex lg:fixed lg:inset-y-0 lg:z-50" />

    <!-- Mobile Sidebar (Overlay) -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isMobileSidebarOpen"
        class="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
        @click="closeMobileSidebar"
      ></div>
    </Transition>

    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="-translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="translate-x-0"
      leave-to-class="-translate-x-full"
    >
      <div
        v-if="isMobileSidebarOpen"
        class="fixed inset-y-0 left-0 w-64 z-50 lg:hidden"
      >
        <Sidebar />
      </div>
    </Transition>

    <!-- Main content area -->
    <div class="flex-1 flex flex-col min-w-0 lg:ml-64">
      <!-- Header -->
      <AppHeader
        @toggle-sidebar="toggleMobileSidebar"
        @open-search="openSearch"
        @open-notifications="openNotifications"
      >
        <template #actions>
          <slot name="header-actions"></slot>
        </template>
      </AppHeader>

      <!-- Main content -->
      <main class="flex-1 overflow-y-auto pb-16 lg:pb-0">
        <div class="container mx-auto px-4 py-6 max-w-7xl">
          <router-view v-slot="{ Component, route }">
            <Transition
              name="fade"
              mode="out-in"
            >
              <component :is="Component" :key="route.path" />
            </Transition>
          </router-view>
        </div>
      </main>

      <!-- Bottom Navigation (Mobile) -->
      <BottomNav />
    </div>

    <!-- Search Modal (future implementation) -->
    <Teleport to="body">
      <SearchModal v-if="isSearchOpen" @close="closeSearch" />
    </Teleport>

    <!-- Notifications Panel (future implementation) -->
    <Teleport to="body">
      <NotificationsPanel v-if="isNotificationsOpen" @close="closeNotifications" />
    </Teleport>

    <!-- Push Notification Permission Prompt -->
    <PushPermissionPrompt />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from '@/components/navigation/Sidebar.vue'
import AppHeader from '@/components/navigation/AppHeader.vue'
import BottomNav from '@/components/navigation/BottomNav.vue'
import PushPermissionPrompt from '@/components/notifications/PushPermissionPrompt.vue'

// Mobile sidebar state
const isMobileSidebarOpen = ref(false)

const toggleMobileSidebar = () => {
  isMobileSidebarOpen.value = !isMobileSidebarOpen.value
}

const closeMobileSidebar = () => {
  isMobileSidebarOpen.value = false
}

// Search modal state
const isSearchOpen = ref(false)

const openSearch = () => {
  isSearchOpen.value = true
}

const closeSearch = () => {
  isSearchOpen.value = false
}

// Notifications panel state
const isNotificationsOpen = ref(false)

const openNotifications = () => {
  isNotificationsOpen.value = true
}

const closeNotifications = () => {
  isNotificationsOpen.value = false
}

// Placeholders for future components
const SearchModal = null
const NotificationsPanel = null
</script>

<style scoped>
/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
