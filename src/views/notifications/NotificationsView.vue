<template>
  <div>
    <!-- Header con acciones -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <p class="text-sm text-gray-600">
          {{ unreadCount }} notificaciones sin leer
        </p>
      </div>
      <button
        v-if="unreadCount > 0"
        @click="markAllAsRead"
        class="text-sm text-primary-600 hover:text-primary-700 font-medium"
      >
        Marcar todas como leídas
      </button>
    </div>

    <!-- Estado de carga -->
    <div v-if="loading" class="bg-white rounded-lg shadow p-12">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
        <p class="mt-4 text-sm text-gray-600">Cargando notificaciones...</p>
      </div>
    </div>

    <!-- Lista de notificaciones agrupadas por fecha -->
    <div v-else-if="groupedNotifications.length > 0" class="space-y-6">
      <div v-for="group in groupedNotifications" :key="group.title" class="bg-white rounded-lg shadow overflow-hidden">
        <!-- Título del grupo -->
        <div class="bg-gray-50 px-4 py-2 border-b border-gray-200">
          <h3 class="text-sm font-semibold text-gray-700">{{ group.title }}</h3>
        </div>

        <!-- Notificaciones del grupo -->
        <div class="divide-y divide-gray-200">
          <router-link
            v-for="notification in group.notifications"
            :key="notification.id"
            :to="getNotificationLink(notification)"
            @click="handleNotificationClick(notification)"
            class="block px-4 py-4 hover:bg-gray-50 transition-colors"
            :class="{ 'bg-blue-50': !notification.read }"
          >
            <div class="flex items-start space-x-3">
              <!-- Ícono según tipo -->
              <div
                class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                :class="getIconBgClass(notification.type)"
              >
                <svg class="w-5 h-5" :class="getIconColorClass(notification.type)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getIconPath(notification.type)" />
                </svg>
              </div>

              <!-- Contenido -->
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900">
                  {{ notification.title }}
                </p>
                <p class="text-sm text-gray-600 mt-1">
                  {{ notification.message }}
                </p>
                <p class="text-xs text-gray-500 mt-2">
                  {{ notification.timeAgo }}
                </p>
              </div>

              <!-- Badge sin leer -->
              <div v-if="!notification.read" class="flex-shrink-0">
                <div class="w-2 h-2 bg-primary-600 rounded-full"></div>
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-else class="bg-white rounded-lg shadow p-12">
      <div class="text-center">
        <svg class="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-900">No tienes notificaciones</h3>
        <p class="mt-2 text-sm text-gray-500">
          Cuando recibas notificaciones, aparecerán aquí
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useNotificationStore } from '@/stores'

const notificationStore = useNotificationStore()
const { groupedNotifications, unreadCount, loading } = storeToRefs(notificationStore)

// Cargar notificaciones al montar
onMounted(async () => {
  try {
    await notificationStore.fetchNotifications()
  } catch (error) {
    console.error('Error al cargar notificaciones:', error)
  }
})

const markAllAsRead = async () => {
  try {
    await notificationStore.markAllAsRead()
  } catch (error) {
    console.error('Error al marcar todas como leídas:', error)
  }
}

const handleNotificationClick = async (notification) => {
  // Marcar como leída al hacer clic
  if (!notification.read) {
    try {
      await notificationStore.markAsRead(notification.id)
    } catch (error) {
      console.error('Error al marcar como leída:', error)
    }
  }
}

// Mapear tipos del backend a tipos del frontend
const mapNotificationType = (backendType) => {
  const typeMap = {
    'task_assigned': 'task',
    'task_reassigned': 'task',
    'task_reminder': 'reminder',
    'task_due_soon': 'reminder',
    'task_overdue': 'reminder',
    'status_changed': 'status_change'
  }
  return typeMap[backendType] || 'task'
}

const getIconBgClass = (type) => {
  const mappedType = mapNotificationType(type)
  const classes = {
    task: 'bg-blue-100',
    reminder: 'bg-yellow-100',
    status_change: 'bg-green-100'
  }
  return classes[mappedType] || 'bg-gray-100'
}

const getIconColorClass = (type) => {
  const mappedType = mapNotificationType(type)
  const classes = {
    task: 'text-blue-600',
    reminder: 'text-yellow-600',
    status_change: 'text-green-600'
  }
  return classes[mappedType] || 'text-gray-600'
}

const getIconPath = (type) => {
  const mappedType = mapNotificationType(type)
  const paths = {
    task: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    reminder: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    status_change: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
  }
  return paths[mappedType] || 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
}

// Obtener el link de la notificación
const getNotificationLink = (notification) => {
  if (notification.task?.id) {
    return `/tasks/${notification.task.id}`
  }
  return notification.link || '#'
}
</script>
