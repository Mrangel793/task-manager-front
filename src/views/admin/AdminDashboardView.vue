<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center gap-2">
        <h1 class="text-2xl font-bold text-gray-900">Panel de Administración</h1>
        <div v-if="loading && taskStore.tasks.length > 0" class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
      </div>
      <p class="text-sm text-gray-600 mt-1">Vista general del sistema</p>
    </div>

    <div>
      <!-- Layout principal: Tareas a la izquierda, Cards de estado a la derecha -->
      <div class="flex flex-col lg:flex-row gap-6">

        <!-- Izquierda: Lista Completa de Tareas -->
        <div class="flex-1 min-w-0 order-2 lg:order-1">
          <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">Todas las Tareas</h2>
        </div>

        <!-- Tabs -->
        <div class="px-6 border-b border-gray-200 overflow-x-auto">
          <nav class="-mb-px flex space-x-4 items-center min-w-max">
            <!-- Pestaña Todas (fija) -->
            <button
              @click="currentTab = 'all'"
              :class="currentTab === 'all'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors"
            >
              Todas
              <span :class="currentTab === 'all' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-900'"
                    class="ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium">
                {{ taskStore.tasks.filter(t => t.status !== 'Completada').length }}
              </span>
            </button>

            <!-- Pestañas personalizadas -->
            <button
              v-for="tab in customTabs"
              :key="tab.id"
              @click="currentTab = tab.id"
              :class="currentTab === tab.id
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors group relative"
              :title="getTabTooltip(tab)"
            >
              <div class="flex items-center gap-2">
                <span>{{ tab.label }}</span>
                <span :class="currentTab === tab.id ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-900'"
                      class="py-0.5 px-2.5 rounded-full text-xs font-medium">
                  {{ getCustomTabCount(tab) }}
                </span>
                <!-- Badge de usuarios si hay seleccionados -->
                <span
                  v-if="getTabAssigneeNames(tab).length > 0"
                  @click.stop="openTabMembersModal(tab)"
                  :class="currentTab === tab.id ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'"
                  class="py-0.5 px-2 rounded-full text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                  title="Ver integrantes"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  {{ getTabAssigneeNames(tab).length }}
                </span>
              </div>
              <!-- Botones editar/eliminar pestaña -->
              <div class="absolute -top-1 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button
                  @click.stop="openEditTabModal(tab)"
                  class="bg-blue-500 text-white rounded-full p-0.5 hover:bg-blue-600"
                  title="Editar pestaña"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  @click.stop="deleteCustomTab(tab.id)"
                  class="bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                  title="Eliminar pestaña"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </button>

            <!-- Botón agregar pestaña -->
            <button
              @click="openTabModal"
              class="whitespace-nowrap py-4 px-2 text-gray-400 hover:text-primary-600 transition-colors"
              title="Agregar pestaña personalizada"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </nav>
        </div>

        <!-- Filters bar -->
        <div class="px-6 py-4 flex flex-col sm:flex-row gap-3 border-b border-gray-100">
          <!-- Búsqueda -->
          <div class="flex-1">
            <div class="relative">
              <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                v-model="taskFilters.search"
                type="text"
                placeholder="Buscar tareas..."
                class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <!-- Filtros -->
          <div class="flex gap-2 flex-wrap sm:flex-nowrap">
            <!-- Estado -->
            <select
              v-model="taskFilters.status"
              class="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="all">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En Progreso">En Progreso</option>
              <option value="Por Verificar">Por Verificar</option>
            </select>

            <!-- Asignado a -->
            <select
              v-model="taskFilters.assigneeId"
              class="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="all">Todas las personas</option>
              <option v-for="user in allUsers" :key="user.id" :value="user.id">
                {{ user.name }}
              </option>
            </select>

            <!-- Botón limpiar filtros -->
            <button
              v-if="hasActiveTaskFilters"
              @click="clearTaskFilters"
              class="px-4 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
              title="Limpiar filtros"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Task List -->
        <div>
          <!-- Empty state -->
          <div v-if="filteredAllTasks.length === 0 && !isQuickCreateMode" class="text-center py-12">
            <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 class="mt-4 text-lg font-medium text-gray-900">No hay tareas</h3>
            <p class="mt-2 text-sm text-gray-500">Presiona el botón + para crear tu primera tarea</p>
          </div>

          <!-- Quick create cuando está vacío -->
          <div v-else-if="filteredAllTasks.length === 0 && isQuickCreateMode" class="bg-white rounded-lg border border-gray-200">
            <div class="px-3 sm:px-4 py-4">
              <!-- Input con voz -->
              <div class="flex items-center gap-2 sm:gap-3">
                <div class="flex-shrink-0 w-5 h-5">
                  <svg v-if="isCreatingTask" class="w-5 h-5 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  <div v-else class="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                </div>
                <div class="flex-1 relative">
                  <input
                    ref="quickCreateInput"
                    v-model="newTaskTitle"
                    type="text"
                    :placeholder="isCreatingTask ? 'Creando tarea...' : 'Título de la tarea...'"
                    class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    :disabled="isCreatingTask"
                    @keyup.enter="handleQuickCreateTask"
                    @keyup.escape="cancelQuickCreate"
                    autofocus
                  />
                  <div class="absolute top-1/2 right-2 transform -translate-y-1/2">
                    <VoiceInputButton
                      v-model="newTaskTitle"
                      :disabled="isCreatingTask"
                      :show-status="false"
                      size="small"
                    />
                  </div>
                </div>
              </div>
              <!-- Botones -->
              <div class="flex items-center justify-end gap-2 mt-2 pl-7">
                <button
                  @click="cancelQuickCreate"
                  :disabled="isCreatingTask"
                  class="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  @click="handleQuickCreateTask"
                  :disabled="!newTaskTitle.trim() || isCreatingTask"
                  class="px-4 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  {{ isCreatingTask ? 'Creando...' : 'Crear' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Table Header -->
          <div v-else>
            <div class="grid grid-cols-12 gap-2 sm:gap-4 px-3 sm:px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div class="col-span-5 lg:col-span-6">Tarea</div>
              <div class="col-span-4 sm:hidden">Asignado</div>
              <div class="col-span-3 hidden sm:block">Asignado</div>
              <div class="hidden sm:block sm:col-span-2">Estado</div>
              <div class="col-span-3 sm:col-span-2 lg:col-span-1 text-center">Acciones</div>
            </div>

            <!-- Task Rows -->
            <div class="divide-y divide-gray-100">
              <div
                v-for="task in paginatedTasks"
                :key="task.id"
                @click="goToTask(task.id)"
                class="grid grid-cols-12 gap-2 sm:gap-4 px-3 sm:px-4 py-3 items-center hover:bg-gray-50 cursor-pointer transition-colors group"
                :class="{
                  'bg-green-50/50': task.status === 'Completada' || task.status === 'Por Verificar'
                }"
              >
                <!-- Task name with checkbox -->
                <div class="col-span-5 lg:col-span-6 flex items-start min-w-0">
                  <button
                    @click.stop="handleTaskStatusToggle(task)"
                    class="flex-shrink-0 w-5 h-5 rounded-full border-2 mr-2 sm:mr-3 mt-0.5 flex items-center justify-center transition-colors"
                    :class="task.status === 'Completada'
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 hover:border-green-400 group-hover:border-green-400'"
                    :title="task.status === 'Por Verificar' ? 'Verificar y completar' : ''"
                  >
                    <svg v-if="task.status === 'Completada'" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </button>
                  <div class="min-w-0 flex-1">
                    <span
                      class="block text-sm break-words"
                      :class="task.status === 'Completada' ? 'text-gray-400 line-through' : 'text-gray-900 font-medium'"
                    >
                      {{ task.title }}
                    </span>
                    <div class="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span v-if="task.due_date" class="inline-flex items-center gap-1 text-xs" :class="getListDueDateColor(task)">
                        <svg class="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {{ formatListDueDate(task.due_date) }}
                      </span>
                      <span v-if="task.status === 'Por Verificar'" class="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                        Completada
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Assignee mobile -->
                <div class="col-span-4 sm:hidden" @click.stop>
                  <select
                    :value="getTaskAssigneeId(task)"
                    @change="handleAssigneeChange(task, $event.target.value)"
                    class="text-xs font-medium px-1 py-1 rounded border border-gray-200 focus:ring-2 focus:ring-primary-500 cursor-pointer w-full bg-white truncate"
                  >
                    <option value="" disabled>Sin asignar</option>
                    <option v-for="user in allUsers" :key="user.id" :value="user.id">
                      {{ user.name }}
                    </option>
                  </select>
                </div>

                <!-- Assignee desktop -->
                <div class="col-span-3 hidden sm:flex items-center" @click.stop>
                  <div
                    class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium mr-2 flex-shrink-0"
                    :class="getListAvatarColor(getListAssigneeName(task))"
                  >
                    {{ getListInitials(getListAssigneeName(task)) }}
                  </div>
                  <select
                    :value="getTaskAssigneeId(task)"
                    @change="handleAssigneeChange(task, $event.target.value)"
                    class="text-xs font-medium px-1 py-1 rounded border border-gray-200 focus:ring-2 focus:ring-primary-500 cursor-pointer flex-1 min-w-0 bg-white truncate"
                  >
                    <option value="" disabled>Sin asignar</option>
                    <option v-for="user in allUsers" :key="user.id" :value="user.id">
                      {{ user.name }}
                    </option>
                  </select>
                </div>

                <!-- Status (hidden on mobile) -->
                <div class="hidden sm:block sm:col-span-2" @click.stop>
                  <select
                    v-model="task.status"
                    @change="handleTaskListStatusChange(task)"
                    class="text-xs font-medium px-1 sm:px-2 py-1 rounded border-0 focus:ring-2 focus:ring-primary-500 cursor-pointer w-full"
                    :class="getListStatusSelectClass(task.status)"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="En Progreso">En Progreso</option>
                    <option value="Por Verificar" v-if="task.status === 'Por Verificar'" hidden>Completada</option>
                    <option value="Completada">Completada</option>
                  </select>
                </div>

                <!-- Actions -->
                <div class="col-span-3 sm:col-span-2 lg:col-span-1 flex items-center justify-end sm:justify-center gap-0.5 sm:gap-1" @click.stop>
                  <!-- Edit button -->
                  <button
                    @click="handleEditTask(task)"
                    class="p-1 sm:p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar tarea"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <!-- Delete button -->
                  <button
                    @click="handleDeleteTask(task)"
                    class="p-1 sm:p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar tarea"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Fila de creación rápida -->
            <div
              v-if="isQuickCreateMode"
              class="px-3 sm:px-4 py-3 border-t border-gray-200 bg-blue-50"
            >
              <!-- Input con voz -->
              <div class="flex items-center gap-2 sm:gap-3">
                <div class="flex-shrink-0 w-5 h-5">
                  <svg v-if="isCreatingTask" class="w-5 h-5 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  <div v-else class="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                </div>
                <div class="flex-1 relative">
                  <input
                    ref="quickCreateInput"
                    v-model="newTaskTitle"
                    type="text"
                    :placeholder="isCreatingTask ? 'Creando tarea...' : 'Título de la tarea...'"
                    class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    :disabled="isCreatingTask"
                    @keyup.enter="handleQuickCreateTask"
                    @keyup.escape="cancelQuickCreate"
                    autofocus
                  />
                  <div class="absolute top-1/2 right-2 transform -translate-y-1/2">
                    <VoiceInputButton
                      v-model="newTaskTitle"
                      :disabled="isCreatingTask"
                      :show-status="false"
                      size="small"
                    />
                  </div>
                </div>
              </div>
              <!-- Botones -->
              <div class="flex items-center justify-end gap-2 mt-2 pl-7">
                <button
                  @click="cancelQuickCreate"
                  :disabled="isCreatingTask"
                  class="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  @click="handleQuickCreateTask"
                  :disabled="!newTaskTitle.trim() || isCreatingTask"
                  class="px-4 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  {{ isCreatingTask ? 'Creando...' : 'Crear' }}
                </button>
              </div>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="px-4 py-3 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <!-- Info -->
              <div class="text-sm text-gray-700">
                Mostrando <span class="font-medium">{{ showingFrom }}</span> a <span class="font-medium">{{ showingTo }}</span> de <span class="font-medium">{{ totalFilteredTasks }}</span> tareas
              </div>

              <!-- Controls -->
              <nav class="flex items-center gap-1">
                <!-- Previous -->
                <button
                  @click="prevPage"
                  :disabled="currentPage === 1"
                  class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
                  :class="currentPage === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-200'"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <!-- Page numbers -->
                <template v-for="page in visiblePages" :key="page">
                  <span v-if="page === '...'" class="px-2 py-1 text-gray-500">...</span>
                  <button
                    v-else
                    @click="goToPage(page)"
                    class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
                    :class="page === currentPage
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 hover:bg-gray-200'"
                  >
                    {{ page }}
                  </button>
                </template>

                <!-- Next -->
                <button
                  @click="nextPage"
                  :disabled="currentPage === totalPages"
                  class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
                  :class="currentPage === totalPages
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-200'"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </nav>
            </div>

          </div>
          </div>
        </div>
        </div>

        <!-- Derecha: Estadísticas de Tareas por Estado (vertical) -->
        <div class="lg:w-56 flex-shrink-0 order-1 lg:order-2">
          <div class="grid grid-cols-2 lg:grid-cols-1 gap-3 lg:sticky lg:top-4">
            <!-- Tareas Pendientes -->
            <div
              @click="openTasksByStatusModal('Pendiente')"
              class="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-shadow group"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="flex-shrink-0 bg-orange-100 rounded-lg p-2.5 group-hover:bg-orange-200 transition-colors">
                    <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <p class="text-xs font-medium text-gray-500">Pendientes</p>
                    <p class="text-xl font-bold text-gray-900">{{ taskStats.pending }}</p>
                  </div>
                </div>
                <svg class="w-4 h-4 text-gray-400 group-hover:text-orange-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            <!-- Tareas En Progreso -->
            <div
              @click="openTasksByStatusModal('En Progreso')"
              class="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-shadow group"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="flex-shrink-0 bg-blue-100 rounded-lg p-2.5 group-hover:bg-blue-200 transition-colors">
                    <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <p class="text-xs font-medium text-gray-500">En Progreso</p>
                    <p class="text-xl font-bold text-gray-900">{{ taskStats.inProgress }}</p>
                  </div>
                </div>
                <svg class="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            <!-- Tareas Completadas -->
            <div
              @click="openTasksByStatusModal('Completada')"
              class="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-shadow group"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="flex-shrink-0 bg-green-100 rounded-lg p-2.5 group-hover:bg-green-200 transition-colors">
                    <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <p class="text-xs font-medium text-gray-500">Completadas</p>
                    <p class="text-xl font-bold text-gray-900">{{ taskStats.completed }}</p>
                  </div>
                </div>
                <svg class="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            <!-- Tareas Vencidas -->
            <div
              @click="openTasksByStatusModal('Vencidas')"
              class="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-shadow group"
              :class="{ 'ring-2 ring-red-300': taskStats.overdue > 0 }"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="flex-shrink-0 bg-red-100 rounded-lg p-2.5 group-hover:bg-red-200 transition-colors">
                    <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <p class="text-xs font-medium text-gray-500">Vencidas</p>
                    <p class="text-xl font-bold" :class="taskStats.overdue > 0 ? 'text-red-600' : 'text-gray-900'">{{ taskStats.overdue }}</p>
                  </div>
                </div>
                <svg class="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
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
                    :class="task.status === 'Completada'
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-300'"
                  >
                    <svg v-if="task.status === 'Completada'" class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 break-words" :class="{ 'line-through text-gray-400': task.status === 'Completada' }">
                      {{ task.title }}
                    </p>
                    <div class="flex items-center gap-3 mt-1">
                      <span class="text-xs text-gray-500">{{ getListAssigneeName(task) }}</span>
                      <span v-if="task.due_date" class="text-xs" :class="getDueDateColorClass(task)">
                        {{ formatTaskDate(task.due_date) }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-2 ml-4">
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

    <!-- FAB (Floating Action Button) para crear tarea - oculto cuando quick create está activo -->
    <button
      v-if="!isQuickCreateMode"
      @click="activateQuickCreate"
      class="fixed bottom-20 right-6 lg:bottom-6 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-4 shadow-lg transition-colors z-30"
      title="Crear nueva tarea"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
    </button>

    <!-- Modal para crear/editar tarea -->
    <TaskModal
      :is-open="isCreateModalOpen"
      :task="selectedTaskForEdit"
      :users="allUsers"
      :on-save="handleSaveTask"
      @cancel="closeTaskModal"
    />

    <!-- Custom Tab Modal -->
    <div v-if="isTabModalOpen" class="fixed inset-0 z-50 overflow-y-auto" @click.self="closeTabModal">
      <div class="flex min-h-screen items-center justify-center p-4">
        <!-- Overlay -->
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>

        <!-- Modal -->
        <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-2xl font-bold text-gray-900">{{ editingTabId ? 'Editar Pestaña' : 'Nueva Pestaña' }}</h3>
            <button @click="closeTabModal" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleCreateTab" class="space-y-4">
            <!-- Nombre de la pestaña -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la pestaña <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <input
                  v-model="newTabData.label"
                  type="text"
                  placeholder="Ej: Equipo Marketing"
                  class="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
                <div class="absolute top-1/2 right-2 transform -translate-y-1/2">
                  <VoiceInputButton
                    v-model="newTabData.label"
                    :show-status="false"
                    size="small"
                  />
                </div>
              </div>
            </div>

            <!-- Usuarios asignados (múltiples) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por usuarios asignados
              </label>
              <div class="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-2 space-y-1">
                <label
                  v-for="user in allUsers"
                  :key="user.id"
                  class="flex items-center px-3 py-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    :value="user.id"
                    v-model="newTabData.assigneeIds"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span class="ml-3 text-sm text-gray-700">{{ user.name }}</span>
                </label>
                <div v-if="allUsers.length === 0" class="text-sm text-gray-500 text-center py-2">
                  No hay usuarios disponibles
                </div>
              </div>
              <p class="mt-1 text-xs text-gray-500">
                {{ newTabData.assigneeIds.length === 0
                  ? 'Se mostrarán tareas de todos los usuarios'
                  : `${newTabData.assigneeIds.length} usuario(s) seleccionado(s)` }}
              </p>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                @click="closeTabModal"
                class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                {{ editingTabId ? 'Guardar Cambios' : 'Crear Pestaña' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal de integrantes de pestaña -->
    <div v-if="isTabMembersModalOpen" class="fixed inset-0 z-50 overflow-y-auto" @click.self="closeTabMembersModal">
      <div class="flex min-h-screen items-center justify-center p-4">
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>

        <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h3 class="text-lg font-bold text-gray-900">Integrantes</h3>
              <p class="text-sm text-gray-500">{{ selectedTabForMembers?.label }}</p>
            </div>
            <button @click="closeTabMembersModal" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Lista de integrantes -->
          <div class="p-6">
            <div class="space-y-3">
              <div
                v-for="user in getTabAssigneeUsers(selectedTabForMembers)"
                :key="user.id"
                class="flex items-center p-3 bg-gray-50 rounded-lg"
              >
                <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                  <span class="text-sm font-semibold text-primary-600">{{ getMemberInitials(user.name) }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ user.name }}</p>
                  <p class="text-xs text-gray-500 truncate">{{ user.email || user.role || 'Sin información' }}</p>
                </div>
              </div>
            </div>

            <!-- Estado vacío -->
            <div v-if="getTabAssigneeUsers(selectedTabForMembers).length === 0" class="text-center py-8">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p class="mt-2 text-sm text-gray-500">No hay integrantes asignados</p>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-gray-200 flex justify-end">
            <button
              @click="closeTabMembersModal"
              class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useTaskStore } from '@/stores'
import { userService, tabService } from '@/services'
import { useToast } from '@/composables/useToast'
import BaseButton from '@/components/common/BaseButton.vue'
import TaskModal from '@/components/tasks/TaskModal.vue'
import VoiceInputButton from '@/components/common/VoiceInputButton.vue'

const router = useRouter()
const taskStore = useTaskStore()
const toast = useToast()

// Helpers para caché de usuarios en localStorage
const USERS_CACHE_KEY = 'admin_users_cache'
const TABS_CACHE_KEY = 'admin_tabs_cache'

function loadUsersFromStorage() {
  try {
    const cached = localStorage.getItem(USERS_CACHE_KEY)
    if (cached) {
      const parsed = JSON.parse(cached)
      if (Date.now() - parsed.timestamp < 5 * 60 * 1000) return parsed.users
      localStorage.removeItem(USERS_CACHE_KEY)
    }
  } catch { localStorage.removeItem(USERS_CACHE_KEY) }
  return []
}

function saveUsersToStorage(users) {
  try {
    localStorage.setItem(USERS_CACHE_KEY, JSON.stringify({ users, timestamp: Date.now() }))
  } catch { /* ignore */ }
}

function loadTabsFromStorage() {
  try {
    const cached = localStorage.getItem(TABS_CACHE_KEY)
    if (cached) {
      const parsed = JSON.parse(cached)
      if (Date.now() - parsed.timestamp < 5 * 60 * 1000) return parsed.tabs
      localStorage.removeItem(TABS_CACHE_KEY)
    }
  } catch { localStorage.removeItem(TABS_CACHE_KEY) }
  return []
}

function saveTabsToStorage(tabs) {
  try {
    localStorage.setItem(TABS_CACHE_KEY, JSON.stringify({ tabs, timestamp: Date.now() }))
  } catch { /* ignore */ }
}

const loading = ref(false)
const allUsers = ref(loadUsersFromStorage())
const showUsersModal = ref(false)
const showSupervisorsModal = ref(false)
const showOperatorsModal = ref(false)
const showTasksModal = ref(false)
const showTasksByStatusModal = ref(false)
const selectedTaskStatus = ref('')
const isCreateModalOpen = ref(false)
const selectedTaskForEdit = ref(null)

// Variables para creación rápida de tareas
const isQuickCreateMode = ref(false)
const isCreatingTask = ref(false)
const newTaskTitle = ref('')
const quickCreateInput = ref(null)

// Variables para pestañas personalizadas
const currentTab = ref('all')
const isTabModalOpen = ref(false)
const customTabs = ref(loadTabsFromStorage())
const editingTabId = ref(null) // ID de la pestaña que se está editando
const newTabData = ref({
  label: '',
  status: 'all',
  assigneeIds: []
})

// Variables para modal de integrantes de pestaña
const isTabMembersModalOpen = ref(false)
const selectedTabForMembers = ref(null)

// Filtros para la lista de tareas
const taskFilters = ref({
  search: '',
  status: 'all',
  assigneeId: 'all'
})

// Paginación
const currentPage = ref(1)
const itemsPerPage = 20

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

// Función helper para parsear fechas sin problemas de zona horaria
const parseDateString = (dateStr) => {
  if (!dateStr) return null
  const parts = dateStr.split('-')
  if (parts.length !== 3) return new Date(dateStr) // Fallback
  return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
}

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

  // Tareas vencidas (usar is_overdue del backend para consistencia)
  const overdue = tasks.filter(t => t.is_overdue)
    .sort((a, b) => parseDateString(a.due_date) - parseDateString(b.due_date))

  // Tareas que vencen hoy (no vencidas)
  const dueToday = activeTasks.filter(t => {
    if (!t.due_date || t.is_overdue) return false
    const dueDate = parseDateString(t.due_date)
    return dueDate && dueDate.getTime() === today.getTime()
  }).sort((a, b) => {
    // Ordenar por hora si existe
    if (a.due_time_formatted && b.due_time_formatted) {
      return a.due_time_formatted.localeCompare(b.due_time_formatted)
    }
    return 0
  })

  // Tareas que vencen en los próximos 3 días (excluyendo hoy)
  const dueSoon = activeTasks.filter(t => {
    if (!t.due_date || t.is_overdue) return false
    const dueDate = parseDateString(t.due_date)
    return dueDate && dueDate >= tomorrow && dueDate <= threeDaysFromNow
  }).sort((a, b) => parseDateString(a.due_date) - parseDateString(b.due_date))

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
  const porVerificar = tasks.filter(t => t.status === 'Por Verificar').length
  const overdue = criticalTasks.value.overdue.length

  return {
    total,
    completed: completed + porVerificar,
    inProgress,
    pending,
    overdue,
    completedPercentage: total > 0 ? Math.round(((completed + porVerificar) / total) * 100) : 0,
    inProgressPercentage: total > 0 ? Math.round((inProgress / total) * 100) : 0,
    pendingPercentage: total > 0 ? Math.round((pending / total) * 100) : 0
  }
})

// Tareas filtradas para la lista completa (sin completadas, se ven en /verificar)
const filteredAllTasks = computed(() => {
  let tasks = taskStore.tasks.filter(t => t.status !== 'Completada')

  // Filtrar por pestaña personalizada primero
  if (currentTab.value !== 'all') {
    const customTab = customTabs.value.find(t => t.id === currentTab.value)
    if (customTab) {
      tasks = applyCustomTabFilters(tasks, customTab)
    }
  }

  // Aplicar filtros
  if (taskFilters.value.search) {
    const search = taskFilters.value.search.toLowerCase()
    tasks = tasks.filter(t =>
      t.title.toLowerCase().includes(search) ||
      (t.description && t.description.toLowerCase().includes(search))
    )
  }

  if (taskFilters.value.status !== 'all') {
    tasks = tasks.filter(t => t.status === taskFilters.value.status)
  }

  if (taskFilters.value.assigneeId !== 'all') {
    tasks = tasks.filter(t => {
      const assigneeId = t.assignee?.id || t.assignee_id || t.assigned_to
      return assigneeId === taskFilters.value.assigneeId
    })
  }

  // Ordenar por fecha de creación (más recientes primero)
  tasks = [...tasks].sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at) : 0
    const dateB = b.created_at ? new Date(b.created_at) : 0
    return dateB - dateA
  })

  return tasks
})

// Tareas paginadas
const paginatedTasks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredAllTasks.value.slice(start, end)
})

// Info de paginación
const totalPages = computed(() => Math.ceil(filteredAllTasks.value.length / itemsPerPage))
const totalFilteredTasks = computed(() => filteredAllTasks.value.length)
const showingFrom = computed(() => totalFilteredTasks.value === 0 ? 0 : (currentPage.value - 1) * itemsPerPage + 1)
const showingTo = computed(() => Math.min(currentPage.value * itemsPerPage, totalFilteredTasks.value))

// Verificar si hay filtros activos
const hasActiveTaskFilters = computed(() => {
  return taskFilters.value.search !== '' ||
    taskFilters.value.status !== 'all' ||
    taskFilters.value.assigneeId !== 'all'
})

// Limpiar filtros
const clearTaskFilters = () => {
  taskFilters.value = {
    search: '',
    status: 'all',
    assigneeId: 'all'
  }
  currentPage.value = 1
}

// Funciones de paginación
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

// Generar números de página visibles
const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 3) {
      pages.push(1, 2, 3, 4, '...', total)
    } else if (current >= total - 2) {
      pages.push(1, '...', total - 3, total - 2, total - 1, total)
    } else {
      pages.push(1, '...', current - 1, current, current + 1, '...', total)
    }
  }

  return pages
})

// Helper functions para la lista de tareas
const getTaskAssigneeId = (task) => {
  return task.assignee?.id || task.assignee_id || task.assigned_to || ''
}

const getListAssigneeName = (task) => {
  const assigneeId = getTaskAssigneeId(task)
  if (!assigneeId) return 'Sin asignar'
  const user = allUsers.value.find(u => u.id === assigneeId)
  return user?.name || task.assignee_name || 'Usuario'
}

const getListInitials = (name) => {
  if (!name || name === 'Sin asignar') return '?'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const getListAvatarColor = (name) => {
  if (!name) return 'bg-gray-200 text-gray-600'
  const colors = [
    'bg-pink-100 text-pink-700',
    'bg-purple-100 text-purple-700',
    'bg-indigo-100 text-indigo-700',
    'bg-blue-100 text-blue-700',
    'bg-cyan-100 text-cyan-700',
    'bg-teal-100 text-teal-700',
    'bg-green-100 text-green-700',
    'bg-yellow-100 text-yellow-700',
    'bg-orange-100 text-orange-700',
    'bg-red-100 text-red-700'
  ]
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
  return colors[index]
}

const formatListDueDate = (date) => {
  if (!date) return 'Sin fecha'

  // Parsear la fecha manualmente para evitar problemas de zona horaria
  // El formato esperado es YYYY-MM-DD
  const dateParts = date.split('-')
  if (dateParts.length !== 3) {
    // Fallback para otros formatos
    const d = new Date(date)
    if (isNaN(d.getTime())) return 'Sin fecha'
    return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
  }

  const year = parseInt(dateParts[0])
  const month = parseInt(dateParts[1]) - 1 // Los meses en JS son 0-indexed
  const day = parseInt(dateParts[2])

  const taskDate = new Date(year, month, day)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)

  if (taskDate.getTime() === today.getTime()) return 'Hoy'
  if (taskDate.getTime() === tomorrow.getTime()) return 'Mañana'

  return taskDate.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
}

const getListDueDateColor = (task) => {
  if (!task.due_date) return 'text-gray-400'
  if (task.status === 'Completada') return 'text-gray-400'

  // Parsear fecha manualmente para evitar problemas de zona horaria
  const dateParts = task.due_date.split('-')
  if (dateParts.length !== 3) return 'text-gray-600'

  const year = parseInt(dateParts[0])
  const month = parseInt(dateParts[1]) - 1
  const day = parseInt(dateParts[2])

  const dueDate = new Date(year, month, day)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  if (dueDate < today) return 'text-red-600'
  if (dueDate.getTime() === today.getTime()) return 'text-orange-600'
  return 'text-gray-600'
}

const getListStatusSelectClass = (status) => {
  const classes = {
    'Pendiente': 'bg-yellow-100 text-yellow-800',
    'En Progreso': 'bg-blue-100 text-blue-800',
    'Por Verificar': 'bg-green-100 text-green-800',
    'Completada': 'bg-green-100 text-green-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

// Manejar toggle de estado de tarea
const handleAssigneeChange = async (task, newAssigneeId) => {
  const previousAssigneeId = getTaskAssigneeId(task)
  try {
    // Actualizar todos los campos posibles para feedback inmediato
    task.assignee_id = newAssigneeId
    task.assigned_to = newAssigneeId
    if (task.assignee) task.assignee = { ...task.assignee, id: newAssigneeId }
    else task.assignee = { id: newAssigneeId }
    await taskStore.reassignTask(task.id, newAssigneeId)
    await taskStore.fetchTasks()
    toast.success('Operador asignado correctamente')
  } catch (error) {
    task.assignee_id = previousAssigneeId
    task.assigned_to = previousAssigneeId
    if (task.assignee) task.assignee.id = previousAssigneeId
    toast.error('Error al asignar operador')
  }
}

const handleTaskStatusToggle = async (task) => {
  let newStatus
  if (task.status === 'Completada') {
    newStatus = 'Pendiente'
  } else {
    // Admin siempre va directo a Completada (incluye "Por Verificar" → "Completada")
    newStatus = 'Completada'
  }
  try {
    await taskStore.updateTaskStatus(task.id, newStatus)
    toast.success(newStatus === 'Completada' ? 'Tarea completada' : 'Tarea reabierta')
  } catch (error) {
    toast.error('Error al actualizar el estado')
    await taskStore.fetchTasks()
  }
}

// Manejar cambio de estado desde el select
const handleTaskListStatusChange = async (task) => {
  try {
    await taskStore.updateTaskStatus(task.id, task.status)
    toast.success('Estado actualizado correctamente')
  } catch (error) {
    toast.error('Error al actualizar el estado')
    await taskStore.fetchTasks()
  }
}

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

// Función para editar tarea
const handleEditTask = (task) => {
  selectedTaskForEdit.value = task
  isCreateModalOpen.value = true
}

// Función para eliminar tarea
const handleDeleteTask = (task) => {
  if (confirm(`¿Estás seguro de eliminar la tarea "${task.title}"? Esta acción no se puede deshacer.`)) {
    taskStore.deleteTask(task.id)
      .then(() => {
        toast.success('Tarea eliminada correctamente')
      })
      .catch(() => {
        toast.error('Error al eliminar la tarea')
      })
  }
}

// Cerrar modal de tarea
const closeTaskModal = () => {
  isCreateModalOpen.value = false
  selectedTaskForEdit.value = null
}

// Guardar tarea (crear o editar)
const handleSaveTask = async (taskData) => {
  try {
    if (selectedTaskForEdit.value) {
      await taskStore.updateTask(selectedTaskForEdit.value.id, taskData)
      toast.success('Tarea actualizada correctamente')
    } else {
      await taskStore.createTask(taskData)
      toast.success('Tarea creada correctamente')
    }
    closeTaskModal()
  } catch (error) {
    toast.error(error.message || 'Error al guardar la tarea')
  }
}

// Funciones para creación rápida de tareas
const activateQuickCreate = () => {
  isQuickCreateMode.value = true
  newTaskTitle.value = ''
  // Hacer scroll al input y enfocarlo
  nextTick(() => {
    if (quickCreateInput.value) {
      quickCreateInput.value.focus()
      quickCreateInput.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })
}

const cancelQuickCreate = () => {
  isQuickCreateMode.value = false
  newTaskTitle.value = ''
}

const handleQuickCreateTask = async () => {
  const title = newTaskTitle.value.trim()
  if (!title || isCreatingTask.value) return

  isCreatingTask.value = true
  try {
    await taskStore.createTask({ title })
    toast.success('Tarea creada correctamente')
    newTaskTitle.value = ''
    // Mantener el modo activo para crear más tareas
    nextTick(() => {
      if (quickCreateInput.value) {
        quickCreateInput.value.focus()
      }
    })
  } catch (error) {
    toast.error(error.message || 'Error al crear la tarea')
  } finally {
    isCreatingTask.value = false
  }
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
      const dueDate = parseDateString(t.due_date)
      return dueDate && dueDate < today
    }).sort((a, b) => parseDateString(a.due_date) - parseDateString(b.due_date))
  }

  return tasks
    .filter(t => t.status === selectedTaskStatus.value)
    .sort((a, b) => {
      // Ordenar por fecha
      if (!a.due_date && !b.due_date) return 0
      if (!a.due_date) return 1
      if (!b.due_date) return -1
      return parseDateString(a.due_date) - parseDateString(b.due_date)
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
  if (task.status === 'Completada' || task.status === 'Por Verificar') return 'bg-green-50'
  return ''
}

// Función para formatear fecha de tarea
const formatTaskDate = (date) => {
  if (!date) return ''
  const taskDate = parseDateString(date)
  if (!taskDate) return ''

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)

  if (taskDate.getTime() === today.getTime()) return 'Hoy'
  if (taskDate.getTime() === tomorrow.getTime()) return 'Mañana'
  if (taskDate < today) {
    const diffDays = Math.ceil((today - taskDate) / (1000 * 60 * 60 * 24))
    return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`
  }

  return taskDate.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
}

// Función para obtener color de fecha
const getDueDateColorClass = (task) => {
  if (!task.due_date) return 'text-gray-400'
  if (task.status === 'Completada') return 'text-gray-400'

  const dueDate = parseDateString(task.due_date)
  if (!dueDate) return 'text-gray-400'

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  if (dueDate < today) return 'text-red-600 font-medium'
  if (dueDate.getTime() === today.getTime()) return 'text-orange-600 font-medium'
  return 'text-gray-500'
}

// Función para calcular días vencidos
const getDaysOverdue = (dueDate) => {
  if (!dueDate) return ''
  const due = parseDateString(dueDate)
  if (!due) return ''

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diffTime = today - due
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Hace 1 día'
  return `Hace ${diffDays} días`
}

// Función para mostrar fechas relativas
const getRelativeDate = (dueDate) => {
  if (!dueDate) return ''
  const due = parseDateString(dueDate)
  if (!due) return ''

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
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
  const hasCachedData = taskStore.tasks.length > 0
  if (!hasCachedData) {
    loading.value = true
  }
  try {
    // Primero traer tareas (lo más importante, se muestra de inmediato)
    await taskStore.fetchTasks()
  } catch (error) {
    toast.error('Error al cargar las tareas')
  } finally {
    loading.value = false
  }
  // Usuarios y tabs cargan en background sin bloquear la UI
  Promise.all([
    loadAllUsers(),
    loadCustomTabs()
  ]).catch(() => {})
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
    saveUsersToStorage(allUsers.value)
  } catch (error) {
    console.error('Error loading users:', error)
  }
}

// Crear nueva tarea
const handleCreateTask = async (taskData) => {
  try {
    await taskStore.createTask(taskData)
    isCreateModalOpen.value = false
    toast.success('Tarea creada correctamente')
  } catch (error) {
    toast.error('Error al crear la tarea')
  }
}

// Funciones para pestañas personalizadas
const loadCustomTabs = async () => {
  try {
    const tabs = await tabService.getTabs('admin_dashboard')
    customTabs.value = tabs.map(tab => ({
      id: tab.id,
      label: tab.label,
      filters: tab.filters || {}
    }))
    saveTabsToStorage(customTabs.value)
  } catch (error) {
    console.error('Error al cargar pestañas:', error)
  }
}

const openTabModal = () => {
  editingTabId.value = null
  newTabData.value = {
    label: '',
    status: 'all',
    assigneeIds: []
  }
  isTabModalOpen.value = true
}

const openEditTabModal = (tab) => {
  editingTabId.value = tab.id
  newTabData.value = {
    label: tab.label,
    status: tab.filters.status || 'all',
    assigneeIds: tab.filters.assigneeIds ? [...tab.filters.assigneeIds] : []
  }
  isTabModalOpen.value = true
}

const closeTabModal = () => {
  isTabModalOpen.value = false
  editingTabId.value = null
}

const handleCreateTab = async () => {
  if (!newTabData.value.label.trim()) {
    toast.error('El nombre de la pestaña es requerido')
    return
  }

  if (editingTabId.value) {
    await updateCustomTab(editingTabId.value, newTabData.value)
  } else {
    await createCustomTab(newTabData.value)
  }
}

const createCustomTab = async (tabData) => {
  try {
    const newTab = await tabService.createTab({
      label: tabData.label,
      view_type: 'admin_dashboard',
      filters: {
        status: tabData.status || 'all',
        assigneeIds: tabData.assigneeIds || []
      }
    })

    customTabs.value.push({
      id: newTab.id,
      label: newTab.label,
      filters: newTab.filters || {}
    })

    closeTabModal()
    toast.success('Pestaña creada correctamente')
    currentTab.value = newTab.id
  } catch (error) {
    console.error('Error al crear pestaña:', error)
    toast.error('Error al crear la pestaña')
  }
}

const updateCustomTab = async (tabId, tabData) => {
  try {
    const updatedTab = await tabService.updateTab(tabId, {
      label: tabData.label,
      filters: {
        status: tabData.status || 'all',
        assigneeIds: tabData.assigneeIds || []
      }
    })

    const index = customTabs.value.findIndex(t => t.id === tabId)
    if (index !== -1) {
      customTabs.value[index] = {
        id: updatedTab.id,
        label: updatedTab.label,
        filters: updatedTab.filters || {}
      }
    }

    closeTabModal()
    toast.success('Pestaña actualizada correctamente')
  } catch (error) {
    console.error('Error al actualizar pestaña:', error)
    toast.error('Error al actualizar la pestaña')
  }
}

const deleteCustomTab = async (tabId) => {
  if (confirm('¿Estás seguro de eliminar esta pestaña?')) {
    try {
      await tabService.deleteTab(tabId)
      customTabs.value = customTabs.value.filter(t => t.id !== tabId)
      if (currentTab.value === tabId) {
        currentTab.value = 'all'
      }
      toast.success('Pestaña eliminada')
    } catch (error) {
      console.error('Error al eliminar pestaña:', error)
      toast.error('Error al eliminar la pestaña')
    }
  }
}

// Aplicar filtros de pestaña personalizada
const applyCustomTabFilters = (tasks, tab) => {
  let filtered = tasks

  if (tab.filters.status && tab.filters.status !== 'all') {
    filtered = filtered.filter(t => t.status === tab.filters.status)
  }

  if (tab.filters.assigneeIds && tab.filters.assigneeIds.length > 0) {
    filtered = filtered.filter(t => {
      const assigneeId = t.assignee?.id || t.assignee_id || t.assigned_to
      return tab.filters.assigneeIds.includes(assigneeId)
    })
  }

  return filtered
}

// Calcular cantidad de tareas en pestaña personalizada
const getCustomTabCount = (tab) => {
  return applyCustomTabFilters(taskStore.tasks, tab).length
}

// Obtener nombres de usuarios asignados a la pestaña
const getTabAssigneeNames = (tab) => {
  if (!tab.filters.assigneeIds || tab.filters.assigneeIds.length === 0) {
    return []
  }

  return tab.filters.assigneeIds
    .map(id => {
      const user = allUsers.value.find(u => u.id === id)
      return user ? user.name : null
    })
    .filter(name => name !== null)
}

// Obtener usuarios completos asignados a la pestaña
const getTabAssigneeUsers = (tab) => {
  if (!tab?.filters?.assigneeIds || tab.filters.assigneeIds.length === 0) {
    return []
  }

  return tab.filters.assigneeIds
    .map(id => allUsers.value.find(u => u.id === id))
    .filter(user => user !== undefined)
}

// Abrir modal de integrantes de pestaña
const openTabMembersModal = (tab) => {
  selectedTabForMembers.value = tab
  isTabMembersModalOpen.value = true
}

// Cerrar modal de integrantes de pestaña
const closeTabMembersModal = () => {
  isTabMembersModalOpen.value = false
  selectedTabForMembers.value = null
}

// Obtener iniciales del usuario
const getMemberInitials = (name) => {
  if (!name) return 'U'
  const names = name.trim().split(' ')
  return names.length === 1
    ? names[0].substring(0, 2).toUpperCase()
    : (names[0][0] + names[names.length - 1][0]).toUpperCase()
}

// Obtener tooltip con información de la pestaña
const getTabTooltip = (tab) => {
  const parts = []

  const userNames = getTabAssigneeNames(tab)
  if (userNames.length > 0) {
    parts.push(`Usuarios: ${userNames.join(', ')}`)
  }

  if (tab.filters.status && tab.filters.status !== 'all') {
    parts.push(`Estado: ${tab.filters.status}`)
  }

  return parts.length > 0 ? parts.join(' | ') : 'Sin filtros adicionales'
}

// Watchers para resetear paginación
watch([taskFilters, currentTab], () => {
  currentPage.value = 1
}, { deep: true })

onMounted(() => {
  loadData()
})
</script>
