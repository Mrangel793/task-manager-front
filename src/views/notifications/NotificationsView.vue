<template>
  <div>
    <!-- Header con acciones -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Notificaciones</h1>
        <p class="text-sm text-gray-600 mt-1">
          {{ unreadCount }} {{ unreadCount === 1 ? 'notificación sin leer' : 'notificaciones sin leer' }}
        </p>
      </div>
      <button
        v-if="unreadCount > 0"
        @click="handleMarkAllAsRead"
        class="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
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
import { onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useNotificationStore } from '@/stores'
import { useToast } from '@/composables/useToast'

const notificationStore = useNotificationStore()
const toast = useToast()
const { groupedNotifications, unreadCount, loading } = storeToRefs(notificationStore)

// Cargar notificaciones al montar e iniciar polling
onMounted(async () => {
  try {
    await notificationStore.fetchNotifications()
    // Iniciar polling para actualizar el contador cada 30 segundos
    notificationStore.startPolling(30000)
  } catch (error) {
    console.error('Error al cargar notificaciones:', error)
  }
})

// Detener polling al desmontar
onUnmounted(() => {
  notificationStore.stopPolling()
})

const handleMarkAllAsRead = async () => {
  try {
    await notificationStore.markAllAsRead()
    toast.success('Todas las notificaciones marcadas como leídas')
  } catch (error) {
    toast.error('Error al marcar las notificaciones')
    console.error('Error al marcar todas como leídas:', error)
  }
}

const handleNotificationClick = async (notification) => {
  // Marcar como leída al hacer clic
  if (!notification.read && !notification.is_read) {
    try {
      await notificationStore.markAsRead(notification.id)
    } catch (error) {
      console.error('Error al marcar como leída:', error)
    }
  }
}

// Mapear tipos del backend a categorías visuales
const mapNotificationType = (backendType) => {
  const typeMap = {
    'task_created': 'task_new',
    'task_assigned': 'task_assigned',
    'task_reassigned': 'task_reassigned',
    'task_reminder': 'reminder',
    'task_due_soon': 'warning',
    'task_overdue': 'danger',
    'status_changed': 'status_change',
    'task_completed': 'success'
  }
  return typeMap[backendType] || 'info'
}

const getIconBgClass = (type) => {
  const mappedType = mapNotificationType(type)
  const classes = {
    task_new: 'bg-blue-100',
    task_assigned: 'bg-indigo-100',
    task_reassigned: 'bg-purple-100',
    reminder: 'bg-yellow-100',
    warning: 'bg-orange-100',
    danger: 'bg-red-100',
    status_change: 'bg-green-100',
    success: 'bg-green-100',
    info: 'bg-gray-100'
  }
  return classes[mappedType] || 'bg-gray-100'
}

const getIconColorClass = (type) => {
  const mappedType = mapNotificationType(type)
  const classes = {
    task_new: 'text-blue-600',
    task_assigned: 'text-indigo-600',
    task_reassigned: 'text-purple-600',
    reminder: 'text-yellow-600',
    warning: 'text-orange-600',
    danger: 'text-red-600',
    status_change: 'text-green-600',
    success: 'text-green-600',
    info: 'text-gray-600'
  }
  return classes[mappedType] || 'text-gray-600'
}

const getIconPath = (type) => {
  const mappedType = mapNotificationType(type)
  const paths = {
    task_new: 'M12 4v16m8-8H4', // Plus icon
    task_assigned: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    task_reassigned: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4', // Arrows
    reminder: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', // Clock
    warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', // Warning
    danger: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', // Alert
    status_change: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', // Check
    success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', // Check
    info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' // Info
  }
  return paths[mappedType] || paths.info
}

// Obtener el link de la notificación basado en los datos
const getNotificationLink = (notification) => {
  // Si tiene tarea asociada, ir al detalle de la tarea
  if (notification.task?.id) {
    return `/tasks/${notification.task.id}`
  }
  // Si tiene task_id en los datos adicionales
  if (notification.data?.task_id) {
    return `/tasks/${notification.data.task_id}`
  }
  // Link personalizado si existe
  if (notification.link) {
    return notification.link
  }
  // Por defecto, no navegar
  return '/notifications'
}

// Obtener información adicional de la notificación para mostrar
const getNotificationMeta = (notification) => {
  const meta = []

  // Prioridad de la tarea
  if (notification.data?.priority) {
    meta.push({ label: 'Prioridad', value: notification.data.priority })
  } else if (notification.task?.priority) {
    meta.push({ label: 'Prioridad', value: notification.task.priority })
  }

  // Creador/Asignador
  if (notification.data?.creator_name) {
    meta.push({ label: 'Por', value: notification.data.creator_name })
  }

  return meta
}
</script>
