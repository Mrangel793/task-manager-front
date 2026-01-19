<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Panel de Administración</h1>
      <p class="text-sm text-gray-600 mt-1">Vista general del sistema</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <div v-else>
      <!-- Estadísticas de Tareas por Estado -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <!-- Tareas Pendientes -->
        <div
          @click="openTasksByStatusModal('Pendiente')"
          class="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow group"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-orange-100 rounded-lg p-3 group-hover:bg-orange-200 transition-colors">
                <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Pendientes</p>
                <p class="text-2xl font-bold text-gray-900">{{ taskStats.pending }}</p>
              </div>
            </div>
            <svg class="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        <!-- Tareas En Progreso -->
        <div
          @click="openTasksByStatusModal('En Progreso')"
          class="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow group"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-blue-100 rounded-lg p-3 group-hover:bg-blue-200 transition-colors">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">En Progreso</p>
                <p class="text-2xl font-bold text-gray-900">{{ taskStats.inProgress }}</p>
              </div>
            </div>
            <svg class="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        <!-- Tareas Completadas -->
        <div
          @click="openTasksByStatusModal('Completada')"
          class="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow group"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-green-100 rounded-lg p-3 group-hover:bg-green-200 transition-colors">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Completadas</p>
                <p class="text-2xl font-bold text-gray-900">{{ taskStats.completed }}</p>
              </div>
            </div>
            <svg class="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        <!-- Tareas Vencidas -->
        <div
          @click="openTasksByStatusModal('Vencidas')"
          class="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow group"
          :class="{ 'ring-2 ring-red-300': taskStats.overdue > 0 }"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-red-100 rounded-lg p-3 group-hover:bg-red-200 transition-colors">
                <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Vencidas</p>
                <p class="text-2xl font-bold" :class="taskStats.overdue > 0 ? 'text-red-600' : 'text-gray-900'">{{ taskStats.overdue }}</p>
              </div>
            </div>
            <svg class="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Quick actions - Comentadas temporalmente
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div
          @click="goTo('/admin/users')"
          class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer group"
        >
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 group-hover:text-primary-600">Gestionar Usuarios</h3>
              <p class="text-sm text-gray-600 mt-1">Crear, editar y eliminar usuarios</p>
            </div>
            <svg class="w-8 h-8 text-gray-400 group-hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        </div>

        <div
          @click="goTo('/admin/reports')"
          class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer group"
        >
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 group-hover:text-primary-600">Reportes</h3>
              <p class="text-sm text-gray-600 mt-1">Estadísticas y análisis del sistema</p>
            </div>
            <svg class="w-8 h-8 text-gray-400 group-hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>

        <div
          @click="goTo('/admin/config')"
          class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer group"
        >
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 group-hover:text-primary-600">Configuración</h3>
              <p class="text-sm text-gray-600 mt-1">Ajustes del sistema</p>
            </div>
            <svg class="w-8 h-8 text-gray-400 group-hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
      </div>
      -->

      <!-- Tareas Críticas y Estadísticas -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Tareas que requieren atención -->
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Tareas que Requieren Atención</h2>
          </div>
          <div class="p-6">
            <div v-if="criticalTasks.overdue.length === 0 && criticalTasks.dueToday.length === 0 && criticalTasks.dueSoon.length === 0" class="text-center py-12 text-gray-500">
              <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="font-medium">¡Todo al día!</p>
              <p class="text-sm mt-1">No hay tareas urgentes en este momento</p>
            </div>
            <div v-else class="space-y-3">
              <!-- Tareas vencidas -->
              <div v-if="criticalTasks.overdue.length > 0">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center space-x-2">
                    <div class="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span class="text-sm font-semibold text-gray-900">Vencidas</span>
                    <span class="text-xs text-gray-500">({{ criticalTasks.overdue.length }})</span>
                  </div>
                </div>
                <div class="space-y-1">
                  <div
                    v-for="task in criticalTasks.overdue.slice(0, 3)"
                    :key="task.id"
                    @click="goTo(`/tasks/${task.id}`)"
                    class="flex items-center justify-between p-2 bg-red-50 rounded hover:bg-red-100 cursor-pointer group"
                  >
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 truncate">{{ task.title }}</p>
                      <p class="text-xs text-gray-600">{{ task.assignee_name || 'Sin asignar' }}</p>
                    </div>
                    <span class="text-xs font-medium text-red-600 ml-2">{{ getDaysOverdue(task.due_date) }}</span>
                  </div>
                  <button
                    v-if="criticalTasks.overdue.length > 3"
                    @click="goTo('/team/tasks')"
                    class="text-xs text-red-600 hover:text-red-700 font-medium w-full text-center py-1"
                  >
                    Ver {{ criticalTasks.overdue.length - 3 }} más →
                  </button>
                </div>
              </div>

              <!-- Tareas de hoy -->
              <div v-if="criticalTasks.dueToday.length > 0">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center space-x-2">
                    <div class="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span class="text-sm font-semibold text-gray-900">Vencen Hoy</span>
                    <span class="text-xs text-gray-500">({{ criticalTasks.dueToday.length }})</span>
                  </div>
                </div>
                <div class="space-y-1">
                  <div
                    v-for="task in criticalTasks.dueToday.slice(0, 3)"
                    :key="task.id"
                    @click="goTo(`/tasks/${task.id}`)"
                    class="flex items-center justify-between p-2 bg-orange-50 rounded hover:bg-orange-100 cursor-pointer group"
                  >
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 truncate">{{ task.title }}</p>
                      <p class="text-xs text-gray-600">{{ task.assignee_name || 'Sin asignar' }}</p>
                    </div>
                    <span v-if="task.due_time" class="text-xs font-medium text-orange-600 ml-2">{{ task.due_time }}</span>
                  </div>
                  <button
                    v-if="criticalTasks.dueToday.length > 3"
                    @click="goTo('/team/tasks')"
                    class="text-xs text-orange-600 hover:text-orange-700 font-medium w-full text-center py-1"
                  >
                    Ver {{ criticalTasks.dueToday.length - 3 }} más →
                  </button>
                </div>
              </div>

              <!-- Tareas próximas -->
              <div v-if="criticalTasks.dueSoon.length > 0">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center space-x-2">
                    <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span class="text-sm font-semibold text-gray-900">Próximos 3 Días</span>
                    <span class="text-xs text-gray-500">({{ criticalTasks.dueSoon.length }})</span>
                  </div>
                </div>
                <div class="space-y-1">
                  <div
                    v-for="task in criticalTasks.dueSoon.slice(0, 3)"
                    :key="task.id"
                    @click="goTo(`/tasks/${task.id}`)"
                    class="flex items-center justify-between p-2 bg-yellow-50 rounded hover:bg-yellow-100 cursor-pointer group"
                  >
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 truncate">{{ task.title }}</p>
                      <p class="text-xs text-gray-600">{{ task.assignee_name || 'Sin asignar' }}</p>
                    </div>
                    <span class="text-xs font-medium text-yellow-600 ml-2">{{ getRelativeDate(task.due_date) }}</span>
                  </div>
                  <button
                    v-if="criticalTasks.dueSoon.length > 3"
                    @click="goTo('/team/tasks')"
                    class="text-xs text-yellow-600 hover:text-yellow-700 font-medium w-full text-center py-1"
                  >
                    Ver {{ criticalTasks.dueSoon.length - 3 }} más →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Estadísticas de tareas -->
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Estadísticas de Tareas</h2>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-gray-700">Completadas</span>
                  <span class="text-sm font-semibold text-gray-900">{{ taskStats.completed }} / {{ taskStats.total }}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-green-600 h-2 rounded-full transition-all"
                    :style="{ width: taskStats.completedPercentage + '%' }"
                  ></div>
                </div>
              </div>

              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-gray-700">En Progreso</span>
                  <span class="text-sm font-semibold text-gray-900">{{ taskStats.inProgress }} / {{ taskStats.total }}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-blue-600 h-2 rounded-full transition-all"
                    :style="{ width: taskStats.inProgressPercentage + '%' }"
                  ></div>
                </div>
              </div>

              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-gray-700">Pendientes</span>
                  <span class="text-sm font-semibold text-gray-900">{{ taskStats.pending }} / {{ taskStats.total }}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-yellow-600 h-2 rounded-full transition-all"
                    :style="{ width: taskStats.pendingPercentage + '%' }"
                  ></div>
                </div>
              </div>

              <div v-if="taskStats.overdue > 0" class="pt-4 border-t border-gray-200">
                <div class="flex items-center justify-between text-red-600">
                  <span class="text-sm font-medium flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                    Tareas Vencidas
                  </span>
                  <span class="text-sm font-semibold">{{ taskStats.overdue }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Modal de Usuarios Recientes -->
    <div v-if="showUsersModal" class="fixed inset-0 z-50 overflow-y-auto" @click.self="showUsersModal = false">
      <div class="flex min-h-screen items-center justify-center p-4">
        <!-- Overlay -->
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>

        <!-- Modal -->
        <div class="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h3 class="text-xl font-bold text-gray-900">Usuarios Recientes</h3>
              <p class="text-sm text-gray-600 mt-1">Últimos usuarios registrados en el sistema</p>
            </div>
            <button @click="showUsersModal = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="p-6 max-h-96 overflow-y-auto">
            <div v-if="recentUsers.length === 0" class="text-center py-12 text-gray-500">
              <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p class="font-medium">No hay usuarios recientes</p>
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="user in recentUsers"
                :key="user.id"
                class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div class="flex items-center space-x-4">
                  <div class="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <span class="text-base font-semibold text-primary-600">
                      {{ getUserInitials(user) }}
                    </span>
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-gray-900">{{ user.name }}</p>
                    <p class="text-xs text-gray-600">{{ user.phone }}</p>
                    <p v-if="user.created_at" class="text-xs text-gray-500 mt-1">
                      Registrado: {{ formatDate(user.created_at) }}
                    </p>
                  </div>
                </div>
                <span
                  class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                  :class="getRoleBadgeClass(user.role)"
                >
                  {{ getRoleLabel(user.role) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex justify-end gap-3 p-6 border-t border-gray-200">
            <BaseButton variant="secondary" @click="showUsersModal = false">
              Cerrar
            </BaseButton>
            <BaseButton variant="primary" @click="goTo('/admin/users'); showUsersModal = false">
              Ver Todos los Usuarios
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Supervisores -->
    <div v-if="showSupervisorsModal" class="fixed inset-0 z-50 overflow-y-auto" @click.self="showSupervisorsModal = false">
      <div class="flex min-h-screen items-center justify-center p-4">
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
        <div class="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
          <div class="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h3 class="text-xl font-bold text-gray-900">Supervisores</h3>
              <p class="text-sm text-gray-600 mt-1">{{ supervisorsList.length }} {{ supervisorsList.length === 1 ? 'supervisor' : 'supervisores' }} en el sistema</p>
            </div>
            <button @click="showSupervisorsModal = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="p-6 max-h-96 overflow-y-auto">
            <div v-if="supervisorsList.length === 0" class="text-center py-12 text-gray-500">
              <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p class="font-medium">No hay supervisores</p>
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="user in supervisorsList"
                :key="user.id"
                class="flex items-center justify-between p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <div class="flex items-center space-x-4">
                  <div class="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center">
                    <span class="text-base font-semibold text-purple-700">
                      {{ getUserInitials(user) }}
                    </span>
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-gray-900">{{ user.name }}</p>
                    <p class="text-xs text-gray-600">{{ user.phone }}</p>
                  </div>
                </div>
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Supervisor
                </span>
              </div>
            </div>
          </div>
          <div class="flex justify-end gap-3 p-6 border-t border-gray-200">
            <BaseButton variant="secondary" @click="showSupervisorsModal = false">
              Cerrar
            </BaseButton>
            <BaseButton variant="primary" @click="goTo('/admin/users'); showSupervisorsModal = false">
              Gestionar Usuarios
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Operadores -->
    <div v-if="showOperatorsModal" class="fixed inset-0 z-50 overflow-y-auto" @click.self="showOperatorsModal = false">
      <div class="flex min-h-screen items-center justify-center p-4">
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
        <div class="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
          <div class="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h3 class="text-xl font-bold text-gray-900">Operadores</h3>
              <p class="text-sm text-gray-600 mt-1">{{ operatorsList.length }} {{ operatorsList.length === 1 ? 'operador' : 'operadores' }} en el sistema</p>
            </div>
            <button @click="showOperatorsModal = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="p-6 max-h-96 overflow-y-auto">
            <div v-if="operatorsList.length === 0" class="text-center py-12 text-gray-500">
              <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p class="font-medium">No hay operadores</p>
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="user in operatorsList"
                :key="user.id"
                class="flex items-center justify-between p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <div class="flex items-center space-x-4">
                  <div class="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center">
                    <span class="text-base font-semibold text-green-700">
                      {{ getUserInitials(user) }}
                    </span>
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-gray-900">{{ user.name }}</p>
                    <p class="text-xs text-gray-600">{{ user.phone }}</p>
                  </div>
                </div>
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Operador
                </span>
              </div>
            </div>
          </div>
          <div class="flex justify-end gap-3 p-6 border-t border-gray-200">
            <BaseButton variant="secondary" @click="showOperatorsModal = false">
              Cerrar
            </BaseButton>
            <BaseButton variant="primary" @click="goTo('/admin/users'); showOperatorsModal = false">
              Gestionar Usuarios
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Tareas Totales -->
    <div v-if="showTasksModal" class="fixed inset-0 z-50 overflow-y-auto" @click.self="showTasksModal = false">
      <div class="flex min-h-screen items-center justify-center p-4">
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
        <div class="relative bg-white rounded-lg shadow-xl max-w-3xl w-full">
          <div class="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h3 class="text-xl font-bold text-gray-900">Resumen de Tareas</h3>
              <p class="text-sm text-gray-600 mt-1">{{ taskStats.total }} {{ taskStats.total === 1 ? 'tarea' : 'tareas' }} en el sistema</p>
            </div>
            <button @click="showTasksModal = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="p-6">
            <!-- Estadísticas por estado -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div class="bg-green-50 rounded-lg p-4 border border-green-200">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-green-900">Completadas</p>
                    <p class="text-2xl font-bold text-green-700 mt-1">{{ taskStats.completed }}</p>
                  </div>
                  <div class="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p class="text-xs text-green-700 mt-2">{{ taskStats.completedPercentage }}% del total</p>
              </div>

              <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-blue-900">En Progreso</p>
                    <p class="text-2xl font-bold text-blue-700 mt-1">{{ taskStats.inProgress }}</p>
                  </div>
                  <div class="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <p class="text-xs text-blue-700 mt-2">{{ taskStats.inProgressPercentage }}% del total</p>
              </div>

              <div class="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-yellow-900">Pendientes</p>
                    <p class="text-2xl font-bold text-yellow-700 mt-1">{{ taskStats.pending }}</p>
                  </div>
                  <div class="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p class="text-xs text-yellow-700 mt-2">{{ taskStats.pendingPercentage }}% del total</p>
              </div>
            </div>

            <!-- Alerta de tareas vencidas -->
            <div v-if="taskStats.overdue > 0" class="bg-red-50 border border-red-200 rounded-lg p-4">
              <div class="flex items-center">
                <svg class="w-6 h-6 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <div>
                  <p class="text-sm font-semibold text-red-900">{{ taskStats.overdue }} {{ taskStats.overdue === 1 ? 'tarea vencida' : 'tareas vencidas' }}</p>
                  <p class="text-xs text-red-700">Requieren atención inmediata</p>
                </div>
              </div>
            </div>
          </div>
          <div class="flex justify-end gap-3 p-6 border-t border-gray-200">
            <BaseButton variant="secondary" @click="showTasksModal = false">
              Cerrar
            </BaseButton>
            <BaseButton variant="primary" @click="goTo('/team/tasks'); showTasksModal = false">
              Ver Todas las Tareas
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Tareas por Estado -->
    <div v-if="showTasksByStatusModal" class="fixed inset-0 z-50 overflow-y-auto" @click.self="showTasksByStatusModal = false">
      <div class="flex min-h-screen items-center justify-center p-4">
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
        <div class="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h3 class="text-xl font-bold text-gray-900">{{ getStatusModalTitle }}</h3>
              <p class="text-sm text-gray-600 mt-1">{{ filteredTasksByStatus.length }} {{ filteredTasksByStatus.length === 1 ? 'tarea' : 'tareas' }}</p>
            </div>
            <button @click="showTasksByStatusModal = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="p-6 overflow-y-auto flex-1">
            <div v-if="filteredTasksByStatus.length === 0" class="text-center py-12 text-gray-500">
              <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p class="font-medium">No hay tareas</p>
              <p class="text-sm mt-1">No se encontraron tareas con este estado</p>
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="task in filteredTasksByStatus"
                :key="task.id"
                @click="goToTask(task.id)"
                class="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-gray-200"
                :class="getTaskRowClass(task)"
              >
                <div class="flex items-center space-x-4 flex-1 min-w-0">
                  <!-- Checkbox visual -->
                  <div
                    class="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                    :class="task.status === 'Completada' ? 'bg-green-500 border-green-500' : 'border-gray-300'"
                  >
                    <svg v-if="task.status === 'Completada'" class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate" :class="{ 'line-through text-gray-400': task.status === 'Completada' }">
                      {{ task.title }}
                    </p>
                    <div class="flex items-center gap-3 mt-1">
                      <span class="text-xs text-gray-500">{{ task.assignee_name || 'Sin asignar' }}</span>
                      <span v-if="task.due_date" class="text-xs" :class="getDueDateColorClass(task)">
                        {{ formatTaskDate(task.due_date) }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-2 ml-4">
                  <span
                    class="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                    :class="getPriorityBadgeClass(task.priority)"
                  >
                    {{ task.priority }}
                  </span>
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex justify-end gap-3 p-6 border-t border-gray-200">
            <BaseButton variant="secondary" @click="showTasksByStatusModal = false">
              Cerrar
            </BaseButton>
            <BaseButton variant="primary" @click="goTo('/team/tasks'); showTasksByStatusModal = false">
              Ver Todas las Tareas
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTaskStore } from '@/stores'
import { userService } from '@/services'
import { useToast } from '@/composables/useToast'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()
const taskStore = useTaskStore()
const toast = useToast()

const loading = ref(false)
const allUsers = ref([])
const showUsersModal = ref(false)
const showSupervisorsModal = ref(false)
const showOperatorsModal = ref(false)
const showTasksModal = ref(false)
const showTasksByStatusModal = ref(false)
const selectedTaskStatus = ref('')

// Métricas
const metrics = computed(() => {
  const supervisors = allUsers.value.filter(u => normalizeRole(u.role) === 'supervisor').length
  const operators = allUsers.value.filter(u => normalizeRole(u.role) === 'operario').length

  return {
    totalUsers: allUsers.value.length,
    supervisors,
    operators,
    totalTasks: taskStore.tasks.length
  }
})

// Usuarios recientes (últimos 5)
const recentUsers = computed(() => {
  return [...allUsers.value]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5)
})

// Lista de supervisores
const supervisorsList = computed(() => {
  return allUsers.value
    .filter(u => normalizeRole(u.role) === 'supervisor')
    .sort((a, b) => a.name.localeCompare(b.name))
})

// Lista de operadores
const operatorsList = computed(() => {
  return allUsers.value
    .filter(u => normalizeRole(u.role) === 'operario')
    .sort((a, b) => a.name.localeCompare(b.name))
})

// Tareas críticas (vencidas, hoy, próximos 3 días)
const criticalTasks = computed(() => {
  const tasks = taskStore.tasks
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const threeDaysFromNow = new Date(today)
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)

  // Filtrar tareas no completadas
  const activeTasks = tasks.filter(t => t.status !== 'Completada')

  // Tareas vencidas
  const overdue = activeTasks.filter(t => {
    if (!t.due_date) return false
    const dueDate = new Date(t.due_date)
    return dueDate < today
  }).sort((a, b) => new Date(a.due_date) - new Date(b.due_date))

  // Tareas que vencen hoy
  const dueToday = activeTasks.filter(t => {
    if (!t.due_date) return false
    const dueDate = new Date(t.due_date)
    return dueDate.getTime() === today.getTime()
  }).sort((a, b) => {
    // Ordenar por hora si existe
    if (a.due_time && b.due_time) {
      return a.due_time.localeCompare(b.due_time)
    }
    return 0
  })

  // Tareas que vencen en los próximos 3 días (excluyendo hoy)
  const dueSoon = activeTasks.filter(t => {
    if (!t.due_date) return false
    const dueDate = new Date(t.due_date)
    return dueDate >= tomorrow && dueDate <= threeDaysFromNow
  }).sort((a, b) => new Date(a.due_date) - new Date(b.due_date))

  return {
    overdue,
    dueToday,
    dueSoon
  }
})

// Estadísticas de tareas
const taskStats = computed(() => {
  const tasks = taskStore.tasks
  const total = tasks.length
  const completed = tasks.filter(t => t.status === 'Completada').length
  const inProgress = tasks.filter(t => t.status === 'En Progreso').length
  const pending = tasks.filter(t => t.status === 'Pendiente').length
  const overdue = criticalTasks.value.overdue.length

  return {
    total,
    completed,
    inProgress,
    pending,
    overdue,
    completedPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    inProgressPercentage: total > 0 ? Math.round((inProgress / total) * 100) : 0,
    pendingPercentage: total > 0 ? Math.round((pending / total) * 100) : 0
  }
})

const normalizeRole = (role) => {
  if (!role) return 'user'
  const r = role.toLowerCase()
  if (r === 'administrador' || r === 'admin') return 'admin'
  if (r === 'supervisor') return 'supervisor'
  if (r === 'operador' || r === 'operario') return 'operario'
  return 'user'
}

const getUserInitials = (user) => {
  if (!user.name) return 'U'
  const names = user.name.trim().split(' ')
  if (names.length === 1) {
    return names[0].substring(0, 2).toUpperCase()
  }
  return (names[0][0] + names[names.length - 1][0]).toUpperCase()
}

const getRoleBadgeClass = (role) => {
  const normalized = normalizeRole(role)
  const classes = {
    admin: 'bg-purple-100 text-purple-800',
    supervisor: 'bg-blue-100 text-blue-800',
    operario: 'bg-green-100 text-green-800'
  }
  return classes[normalized] || 'bg-gray-100 text-gray-800'
}

const getRoleLabel = (role) => {
  const normalized = normalizeRole(role)
  const labels = {
    admin: 'Admin',
    supervisor: 'Supervisor',
    operario: 'Operador'
  }
  return labels[normalized] || 'Usuario'
}

const goTo = (path) => {
  router.push(path)
}

const goToTask = (taskId) => {
  showTasksByStatusModal.value = false
  router.push(`/tasks/${taskId}`)
}

// Función para abrir el modal de tareas por estado
const openTasksByStatusModal = (status) => {
  selectedTaskStatus.value = status
  showTasksByStatusModal.value = true
}

// Computed para obtener tareas filtradas por estado
const filteredTasksByStatus = computed(() => {
  const tasks = taskStore.tasks
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  if (selectedTaskStatus.value === 'Vencidas') {
    return tasks.filter(t => {
      if (!t.due_date || t.status === 'Completada') return false
      const dueDate = new Date(t.due_date)
      return dueDate < today
    }).sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
  }

  return tasks
    .filter(t => t.status === selectedTaskStatus.value)
    .sort((a, b) => {
      // Ordenar por prioridad y luego por fecha
      const priorityOrder = { 'Alta': 0, 'Media': 1, 'Baja': 2 }
      const pA = priorityOrder[a.priority] ?? 3
      const pB = priorityOrder[b.priority] ?? 3
      if (pA !== pB) return pA - pB
      if (!a.due_date && !b.due_date) return 0
      if (!a.due_date) return 1
      if (!b.due_date) return -1
      return new Date(a.due_date) - new Date(b.due_date)
    })
})

// Computed para el título del modal
const getStatusModalTitle = computed(() => {
  const titles = {
    'Pendiente': 'Tareas Pendientes',
    'En Progreso': 'Tareas En Progreso',
    'Completada': 'Tareas Completadas',
    'Vencidas': 'Tareas Vencidas'
  }
  return titles[selectedTaskStatus.value] || 'Tareas'
})

// Función para obtener clase de fila según estado de tarea
const getTaskRowClass = (task) => {
  if (selectedTaskStatus.value === 'Vencidas') return 'bg-red-50'
  if (task.status === 'Completada') return 'bg-green-50'
  return ''
}

// Función para obtener clase de prioridad
const getPriorityBadgeClass = (priority) => {
  const classes = {
    'Alta': 'bg-red-100 text-red-700',
    'Media': 'bg-yellow-100 text-yellow-700',
    'Baja': 'bg-blue-100 text-blue-700'
  }
  return classes[priority] || 'bg-gray-100 text-gray-700'
}

// Función para formatear fecha de tarea
const formatTaskDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
  const taskDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())

  if (taskDate.getTime() === today.getTime()) return 'Hoy'
  if (taskDate.getTime() === tomorrow.getTime()) return 'Mañana'
  if (taskDate < today) {
    const diffDays = Math.ceil((today - taskDate) / (1000 * 60 * 60 * 24))
    return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`
  }

  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
}

// Función para obtener color de fecha
const getDueDateColorClass = (task) => {
  if (!task.due_date) return 'text-gray-400'
  if (task.status === 'Completada') return 'text-gray-400'

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dueDate = new Date(task.due_date)

  if (dueDate < today) return 'text-red-600 font-medium'
  if (dueDate.getTime() === today.getTime()) return 'text-orange-600 font-medium'
  return 'text-gray-500'
}

// Función para calcular días vencidos
const getDaysOverdue = (dueDate) => {
  if (!dueDate) return ''
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const due = new Date(dueDate)
  const diffTime = today - due
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Hace 1 día'
  return `Hace ${diffDays} días`
}

// Función para mostrar fechas relativas
const getRelativeDate = (dueDate) => {
  if (!dueDate) return ''
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const due = new Date(dueDate)
  const diffTime = due - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Mañana'
  if (diffDays === 2) return 'En 2 días'
  if (diffDays === 3) return 'En 3 días'
  return `En ${diffDays} días`
}

// Función para formatear fechas
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const loadData = async () => {
  loading.value = true
  try {
    await Promise.all([
      taskStore.fetchTasks(),
      loadAllUsers()
    ])
  } catch (error) {
    toast.error('Error al cargar los datos')
  } finally {
    loading.value = false
  }
}

const loadAllUsers = async () => {
  try {
    const data = await userService.getUsers()
    if (Array.isArray(data)) {
      allUsers.value = data
    } else if (data.users) {
      allUsers.value = data.users
    } else if (data.data) {
      allUsers.value = data.data
    }
  } catch (error) {
    console.error('Error loading users:', error)
  }
}

onMounted(async () => {
  await loadData()
})
</script>
