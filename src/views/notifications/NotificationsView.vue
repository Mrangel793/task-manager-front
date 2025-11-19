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

    <!-- Lista de notificaciones agrupadas por fecha -->
    <div v-if="groupedNotifications.length > 0" class="space-y-6">
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
            :to="notification.link || '#'"
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
import { ref, computed } from 'vue'

// TODO: Obtener desde un store de notificaciones
const notifications = ref([
  {
    id: 1,
    type: 'task',
    title: 'Nueva tarea asignada',
    message: 'Se te ha asignado la tarea "Revisar documentación"',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // hace 2 horas
    read: false,
    link: '/tasks/1'
  },
  {
    id: 2,
    type: 'reminder',
    title: 'Recordatorio de tarea',
    message: 'La tarea "Actualizar sistema" vence en 1 hora',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // hace 5 horas
    read: false,
    link: '/tasks/2'
  },
  {
    id: 3,
    type: 'status_change',
    title: 'Tarea completada',
    message: 'Juan completó la tarea "Configurar servidor"',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // ayer
    read: true,
    link: '/tasks/3'
  }
])

const unreadCount = computed(() =>
  notifications.value.filter(n => !n.read).length
)

const markAllAsRead = () => {
  notifications.value.forEach(n => n.read = true)
  // TODO: Actualizar en el backend
}

// Agrupar notificaciones por fecha
const groupedNotifications = computed(() => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

  const groups = {
    today: [],
    yesterday: [],
    thisWeek: [],
    older: []
  }

  notifications.value.forEach(notification => {
    const notifDate = new Date(notification.timestamp)

    // Calcular tiempo relativo
    const diffMs = now - notifDate
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    let timeAgo
    if (diffMins < 1) {
      timeAgo = 'Justo ahora'
    } else if (diffMins < 60) {
      timeAgo = `Hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`
    } else if (diffHours < 24) {
      timeAgo = `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`
    } else if (diffDays < 7) {
      timeAgo = `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`
    } else {
      timeAgo = notifDate.toLocaleDateString('es-CO')
    }

    const enrichedNotification = { ...notification, timeAgo }

    if (notifDate >= today) {
      groups.today.push(enrichedNotification)
    } else if (notifDate >= yesterday) {
      groups.yesterday.push(enrichedNotification)
    } else if (notifDate >= weekAgo) {
      groups.thisWeek.push(enrichedNotification)
    } else {
      groups.older.push(enrichedNotification)
    }
  })

  const result = []
  if (groups.today.length) result.push({ title: 'Hoy', notifications: groups.today })
  if (groups.yesterday.length) result.push({ title: 'Ayer', notifications: groups.yesterday })
  if (groups.thisWeek.length) result.push({ title: 'Esta semana', notifications: groups.thisWeek })
  if (groups.older.length) result.push({ title: 'Anteriores', notifications: groups.older })

  return result
})

const getIconBgClass = (type) => {
  const classes = {
    task: 'bg-blue-100',
    reminder: 'bg-yellow-100',
    status_change: 'bg-green-100'
  }
  return classes[type] || 'bg-gray-100'
}

const getIconColorClass = (type) => {
  const classes = {
    task: 'text-blue-600',
    reminder: 'text-yellow-600',
    status_change: 'text-green-600'
  }
  return classes[type] || 'text-gray-600'
}

const getIconPath = (type) => {
  const paths = {
    task: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    reminder: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    status_change: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
  }
  return paths[type] || 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
}
</script>
