<template>
  <div>
    <!-- Header stats -->
    <div class="mb-6">
      <div class="flex items-center gap-2">
        <p class="text-sm text-gray-600">
          {{ activeTasksCount }} tareas activas • {{ tasksCount.pending }} pendientes
        </p>
        <div v-if="loading && taskStore.tasks.length > 0" class="animate-spin rounded-full h-3 w-3 border-b-2 border-primary-600"></div>
      </div>
    </div>

      <!-- Tabs -->
      <div class="mb-6 border-b border-gray-200 overflow-x-auto">
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
              {{ activeTasksCount }}
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
      <div class="mb-6 flex flex-col sm:flex-row gap-3">
        <!-- Búsqueda -->
        <div class="flex-1">
          <div class="relative">
            <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Buscar tareas..."
              class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <!-- Filtros -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:flex gap-2">
          <!-- Estado -->
          <select
            v-model="filters.status"
            class="w-full lg:w-auto px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-sm"
          >
            <option value="all">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En Progreso">En Progreso</option>
            <option value="Por Verificar">Por Verificar</option>
            <option value="Cancelada">Cancelada</option>
          </select>

          <!-- Asignado a -->
          <select
            v-model="filters.assigneeId"
            class="w-full lg:w-auto px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-sm"
          >
            <option value="all">Todas las personas</option>
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.name }}
            </option>
          </select>

          <!-- Botón limpiar filtros (solo si hay filtros activos) -->
          <button
            v-if="hasActiveFilters"
            @click="clearFilters"
            class="w-full sm:w-auto px-4 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center gap-2"
            title="Limpiar filtros"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span class="sm:hidden">Limpiar</span>
          </button>
        </div>
      </div>

      <!-- Content -->
      <div>
        <!-- Empty state -->
        <div v-if="filteredTasks.length === 0 && !loading" class="text-center py-12 bg-white rounded-lg shadow">
          <svg class="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900">No hay tareas</h3>
          <p class="mt-2 text-sm text-gray-500">
            {{ currentTab === 'all' ? 'Crea tu primera tarea para comenzar' : 'No se encontraron tareas con los filtros aplicados' }}
          </p>
        </div>

        <!-- Tasks List (Asana style) -->
        <div v-else class="bg-white rounded-lg shadow overflow-hidden">
          <!-- Table Header -->
          <div v-if="!isMobile" class="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div class="col-span-6">Tarea</div>
            <div class="col-span-3">Asignado</div>
            <div class="col-span-2">Estado</div>
            <div class="col-span-1 text-center">Acciones</div>
          </div>
          <div v-else class="px-3 py-2 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
            Tareas
          </div>

          <!-- Task Rows -->
          <div class="divide-y divide-gray-100">
            <div
              v-for="task in paginatedTasks"
              :key="task.id"
              class="hover:bg-gray-50 transition-colors"
              :class="{ 'bg-green-50/50': task.status === 'Completada' || task.status === 'Por Verificar' }"
            >
              <!-- ===== MOBILE LAYOUT ===== -->
              <div
                v-if="isMobile"
                class="flex items-center gap-2 px-3 py-3 cursor-pointer"
                @click="activeMenuTaskId = null; handleTaskClick(task)"
              >
                <!-- Checkbox -->
                <button
                  @click.stop="handleRequestComplete({ task })"
                  class="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors"
                  :class="task.status === 'Completada'
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 hover:border-green-400'"
                >
                  <svg v-if="task.status === 'Completada'" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>

                <!-- Title + date + assignee -->
                <div class="flex-1 min-w-0">
                  <span
                    class="block text-sm break-words leading-snug"
                    :class="task.status === 'Completada' ? 'text-gray-400 line-through' : 'text-gray-900 font-medium'"
                  >
                    {{ task.title }}
                  </span>
                  <div class="mt-1 space-y-0.5">
                    <div v-if="task.due_date" class="flex items-center gap-1 text-xs" :class="getDueDateColor(task)">
                      <svg class="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {{ formatDueDate(task.due_date) }}
                      <span v-if="task.status === 'Por Verificar'" class="ml-1 text-green-600 font-medium">· Completada</span>
                    </div>
                    <div v-if="getAssigneeName(task)" class="flex items-center gap-1 text-xs text-gray-500">
                      <span
                        class="w-4 h-4 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                        :class="getAvatarColor(getAssigneeName(task))"
                      >{{ getInitials(getAssigneeName(task)) }}</span>
                      {{ getAssigneeName(task) }}
                    </div>
                  </div>
                </div>

                <!-- ⋮ menu -->
                <div class="relative flex-shrink-0" @click.stop>
                  <button
                    @click.stop="toggleMenu(task.id)"
                    class="p-2 text-gray-400 hover:text-gray-700 rounded-lg transition-colors"
                  >
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                  <div
                    v-if="activeMenuTaskId === task.id"
                    class="absolute right-0 top-9 z-20 bg-white rounded-xl shadow-lg border border-gray-200 py-1 min-w-[160px]"
                    @click.stop
                  >
                    <button
                      @click="handleEditTask(task); activeMenuTaskId = null"
                      class="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5"
                    >
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar
                    </button>
                    <div v-if="canAssign" class="px-4 py-2 border-t border-gray-100" @click.stop>
                      <p class="text-xs text-gray-400 mb-1.5">Reasignar a</p>
                      <select
                        :value="getTaskAssigneeId(task)"
                        @change="handleAssigneeChange(task, $event.target.value); activeMenuTaskId = null"
                        class="text-sm w-full border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-primary-500 bg-white"
                      >
                        <option value="" disabled>Sin asignar</option>
                        <option v-for="user in users" :key="user.id" :value="user.id">
                          {{ user.name }}
                        </option>
                      </select>
                    </div>
                    <button
                      v-if="canDeleteTask"
                      @click="handleDeleteTask(task); activeMenuTaskId = null"
                      class="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 border-t border-gray-100"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>

              <!-- ===== DESKTOP LAYOUT ===== -->
              <div
                v-else
                class="grid grid-cols-12 gap-4 px-4 py-3 items-center cursor-pointer group"
                @click="handleTaskClick(task)"
              >
                <!-- Task name + date -->
                <div class="col-span-6 flex items-start min-w-0">
                  <button
                    @click.stop="handleRequestComplete({ task })"
                    class="flex-shrink-0 w-5 h-5 rounded-full border-2 mr-3 mt-0.5 flex items-center justify-center transition-colors"
                    :class="task.status === 'Completada'
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 hover:border-green-400 group-hover:border-green-400'"
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
                      <span v-if="task.due_date" class="inline-flex items-center gap-1 text-xs" :class="getDueDateColor(task)">
                        <svg class="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {{ formatDueDate(task.due_date) }}
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

                <!-- Assignee -->
                <div class="col-span-3 flex items-center" @click.stop>
                  <div
                    class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium mr-2 flex-shrink-0"
                    :class="getAvatarColor(getAssigneeName(task))"
                  >
                    {{ getInitials(getAssigneeName(task)) }}
                  </div>
                  <select
                    :value="getTaskAssigneeId(task)"
                    @change="handleAssigneeChange(task, $event.target.value)"
                    class="text-xs font-medium px-1 py-1 rounded border border-gray-200 focus:ring-2 focus:ring-primary-500 cursor-pointer flex-1 min-w-0 bg-white truncate"
                  >
                    <option value="" disabled>Sin asignar</option>
                    <option v-for="user in users" :key="user.id" :value="user.id">
                      {{ user.name }}
                    </option>
                  </select>
                </div>

                <!-- Status -->
                <div class="col-span-2" @click.stop>
                  <select
                    v-model="task.status"
                    @change="handleStatusChangeSelect(task)"
                    class="text-xs font-medium px-2 py-1 rounded border-0 focus:ring-2 focus:ring-primary-500 cursor-pointer w-full"
                    :class="getStatusSelectClass(task.status)"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="En Progreso">En Progreso</option>
                    <option value="Por Verificar" v-if="task.status === 'Por Verificar'" hidden>Completada</option>
                    <option value="Completada">Completada</option>
                  </select>
                </div>

                <!-- Actions -->
                <div class="col-span-2 lg:col-span-1 flex items-center justify-center gap-1" @click.stop>
                  <button
                    @click="handleEditTask(task)"
                    class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar tarea"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    v-if="canDeleteTask"
                    @click="handleDeleteTask(task)"
                    class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar tarea"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

            </div>
          </div>

          <!-- Add task row - inline quick create (Google Tasks style) -->
          <div v-if="canCreateTask" class="border-t border-gray-100">
            <div v-if="!quickCreateActive" class="px-4 py-3 hover:bg-gray-50 cursor-pointer" @click="activateQuickCreate">
              <div class="flex items-center text-gray-400 text-sm">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Agregar tarea...
              </div>
            </div>
            <div v-else class="px-4 pt-4 pb-3 bg-white border-t-2 border-t-primary-500" @click.stop>
              <!-- Error -->
              <div v-if="quickCreateError" class="mb-3 flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>
                {{ quickCreateError }}
              </div>
              <!-- Título -->
              <textarea
                ref="quickCreateInput"
                v-model="quickCreateTitle"
                placeholder="Nueva tarea"
                rows="1"
                class="w-full text-xl font-bold bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 resize-none overflow-hidden leading-relaxed"
                @input="e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px' }"
                @keydown.enter.prevent="submitQuickCreate"
                @keydown.esc="cancelQuickCreate"
              />
              <!-- Descripción -->
              <textarea
                v-model="quickCreateDescription"
                placeholder="Agregar detalles"
                rows="1"
                class="w-full text-base font-medium bg-transparent border-none outline-none text-gray-600 placeholder-gray-400 resize-none overflow-hidden leading-relaxed mt-1 mb-3"
                @input="e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px' }"
                @keydown.esc="cancelQuickCreate"
              />
              <!-- Barra de acciones -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <!-- Fecha -->
                  <div class="relative">
                    <button
                      type="button"
                      @click="$refs.quickDateInput?.showPicker()"
                      class="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      :class="{ 'text-primary-600 bg-primary-50': quickCreateDueDate }"
                      title="Fecha límite"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    <input
                      ref="quickDateInput"
                      v-model="quickCreateDueDate"
                      type="date"
                      :min="todayDate"
                      class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <!-- Asignar (solo Admin/Supervisor) -->
                  <div v-if="canAssign" class="relative">
                    <button
                      type="button"
                      @click="quickCreateShowAssignee = !quickCreateShowAssignee"
                      class="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      :class="{ 'text-primary-600 bg-primary-50': quickCreateAssigneeId }"
                      title="Asignar a"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </button>
                    <select
                      v-if="quickCreateShowAssignee"
                      v-model="quickCreateAssigneeId"
                      class="absolute top-full left-0 mt-1 z-10 text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white shadow-lg min-w-[180px]"
                      @change="quickCreateShowAssignee = false"
                    >
                      <option value="">Sin asignar</option>
                      <option v-for="user in users" :key="user.id" :value="user.id">{{ user.name }}</option>
                    </select>
                  </div>
                  <!-- Info de fecha seleccionada -->
                  <span v-if="quickCreateDueDate" class="text-xs text-primary-600 font-medium">
                    {{ formatDueDate(quickCreateDueDate) }}
                  </span>
                </div>
                <button
                  type="button"
                  @click="submitQuickCreate"
                  :disabled="!quickCreateTitle.trim() || quickCreateSaving"
                  class="text-lg font-bold px-6 py-2 rounded-xl transition-all"
                  :class="quickCreateTitle.trim() && !quickCreateSaving
                    ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-md'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'"
                >
                  {{ quickCreateSaving ? 'Guardando...' : 'Guardar' }}
                </button>
              </div>
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

    <!-- FAB (Floating Action Button) - Solo Admin/Supervisor, oculto durante quick create -->
    <Transition name="fade">
    <button
      v-if="canCreateTask && !quickCreateActive"
      @click="activateQuickCreate"
      class="fixed bottom-20 right-6 lg:bottom-6 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-4 shadow-lg transition-all z-30"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
    </button>
    </Transition>

    <!-- Task Modal -->
    <TaskModal
      :is-open="isModalOpen"
      :task="selectedTaskForEdit"
      :users="users"
      :on-save="handleSaveTask"
      @cancel="closeModal"
    />

    <!-- Confirmation Modal -->
    <div v-if="confirmModal.isOpen" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex min-h-screen items-center justify-center p-4">
        <!-- Overlay -->
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="closeConfirmModal"></div>

        <!-- Modal -->
        <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <!-- Icon -->
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <!-- Content -->
          <div class="text-center mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              {{ confirmModal.title }}
            </h3>
            <p class="text-sm text-gray-500">
              {{ confirmModal.message }}
            </p>
          </div>

          <!-- Actions -->
          <div class="flex gap-3">
            <button
              @click="closeConfirmModal"
              class="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              @click="handleConfirm"
              class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>

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
                  v-for="user in users"
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
                <div v-if="users.length === 0" class="text-sm text-gray-500 text-center py-2">
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

    <!-- Confirm Complete Dialog -->
    <ConfirmDialog
      :visible="completeConfirmDialog.visible"
      title="¿Tarea terminada?"
      message="Esta acción marcará la tarea como completada"
      confirm-text="Sí, completar"
      cancel-text="Cancelar"
      icon="success"
      @confirm="handleConfirmComplete"
      @cancel="handleCancelComplete"
    />

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
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useTaskStore, useAuthStore } from '@/stores'
import { userService, tabService } from '@/services'
import { useToast } from '@/composables/useToast'
import TaskModal from '@/components/tasks/TaskModal.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import VoiceInputButton from '@/components/common/VoiceInputButton.vue'

const router = useRouter()
const taskStore = useTaskStore()
const authStore = useAuthStore()
const toast = useToast()

// Detección de mobile por ancho de ventana (más confiable que CSS breakpoints)
const windowWidth = ref(window.innerWidth)
const isMobile = computed(() => windowWidth.value < 640)
const onResize = () => { windowWidth.value = window.innerWidth }
onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))

// Helpers para caché localStorage
const TL_USERS_KEY = 'tasklist_users_cache'
const TL_TABS_KEY = 'tasklist_tabs_cache'

function loadCached(key) {
  try {
    const cached = localStorage.getItem(key)
    if (cached) {
      const parsed = JSON.parse(cached)
      if (Date.now() - parsed.timestamp < 5 * 60 * 1000) return parsed.data
      localStorage.removeItem(key)
    }
  } catch { localStorage.removeItem(key) }
  return []
}

function saveCached(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }))
  } catch { /* ignore */ }
}

const currentTab = ref('all')
const loading = ref(false)
const isModalOpen = ref(false)
const isTabModalOpen = ref(false)
const editingTabId = ref(null)
const selectedTaskForEdit = ref(null)
const activeMenuTaskId = ref(null)

const toggleMenu = (taskId) => {
  activeMenuTaskId.value = activeMenuTaskId.value === taskId ? null : taskId
}
const users = ref(loadCached(TL_USERS_KEY))
const customTabs = ref(loadCached(TL_TABS_KEY))

const confirmModal = ref({
  isOpen: false,
  title: '',
  message: '',
  onConfirm: null
})

const completeConfirmDialog = ref({
  visible: false,
  task: null
})

const filters = ref({
  search: '',
  status: 'all',
  assigneeId: 'all',
  dateFrom: null,
  dateTo: null
})

// Paginación
const currentPage = ref(1)
const itemsPerPage = 20

const newTabData = ref({
  label: '',
  status: 'all',
  assigneeIds: []
})

// Variables para modal de integrantes de pestaña
const isTabMembersModalOpen = ref(false)
const selectedTabForMembers = ref(null)

const tasksCount = computed(() => taskStore.tasksCount)
const activeTasksCount = computed(() => taskStore.tasks.filter(t => t.status !== 'Completada' && t.status !== 'Por Verificar').length)

const filteredTasks = computed(() => {
  // Excluir tareas completadas y por verificar (se ven en la vista dedicada /verificar)
  let tasks = taskStore.tasks.filter(t => t.status !== 'Completada' && t.status !== 'Por Verificar')

  // Filtrar por pestaña personalizada
  if (currentTab.value !== 'all') {
    const customTab = customTabs.value.find(t => t.id === currentTab.value)
    if (customTab) {
      tasks = applyCustomTabFilters(tasks, customTab)
    }
  }

  // Aplicar filtros adicionales
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    tasks = tasks.filter(t =>
      t.title.toLowerCase().includes(search) ||
      (t.description && t.description.toLowerCase().includes(search))
    )
  }

  if (filters.value.status !== 'all') {
    if (filters.value.status === 'Completada') {
      tasks = tasks.filter(t => t.status === 'Completada' || t.status === 'Por Verificar')
    } else {
      tasks = tasks.filter(t => t.status === filters.value.status)
    }
  }

  if (filters.value.assigneeId !== 'all') {
    tasks = tasks.filter(t => {
      const assigneeId = t.assignee?.id || t.assignee_id || t.assigned_to
      return assigneeId === filters.value.assigneeId
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
  return filteredTasks.value.slice(start, end)
})

// Info de paginación
const totalPages = computed(() => Math.ceil(filteredTasks.value.length / itemsPerPage))
const totalFilteredTasks = computed(() => filteredTasks.value.length)
const showingFrom = computed(() => totalFilteredTasks.value === 0 ? 0 : (currentPage.value - 1) * itemsPerPage + 1)
const showingTo = computed(() => Math.min(currentPage.value * itemsPerPage, totalFilteredTasks.value))

// Función para aplicar filtros de pestaña personalizada
const applyCustomTabFilters = (tasks, tab) => {
  let filtered = tasks

  if (tab.filters.status && tab.filters.status !== 'all') {
    filtered = filtered.filter(t => t.status === tab.filters.status)
  }

  // Soporte para múltiples usuarios
  if (tab.filters.assigneeIds && tab.filters.assigneeIds.length > 0) {
    filtered = filtered.filter(t => {
      const assigneeId = t.assignee?.id || t.assignee_id || t.assigned_to
      return tab.filters.assigneeIds.includes(assigneeId)
    })
  }
  // Soporte legacy para assigneeId único (retrocompatibilidad)
  else if (tab.filters.assigneeId && tab.filters.assigneeId !== 'all') {
    filtered = filtered.filter(t => {
      const assigneeId = t.assignee?.id || t.assignee_id || t.assigned_to
      return assigneeId === tab.filters.assigneeId
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
    // Soporte legacy para assigneeId único
    if (tab.filters.assigneeId && tab.filters.assigneeId !== 'all') {
      const user = users.value.find(u => u.id === tab.filters.assigneeId)
      return user ? [user.name] : []
    }
    return []
  }

  return tab.filters.assigneeIds
    .map(id => {
      const user = users.value.find(u => u.id === id)
      return user ? user.name : null
    })
    .filter(name => name !== null)
}

// Obtener usuarios completos asignados a la pestaña
const getTabAssigneeUsers = (tab) => {
  if (!tab?.filters?.assigneeIds || tab.filters.assigneeIds.length === 0) {
    // Soporte legacy para assigneeId único
    if (tab?.filters?.assigneeId && tab.filters.assigneeId !== 'all') {
      const user = users.value.find(u => u.id === tab.filters.assigneeId)
      return user ? [user] : []
    }
    return []
  }

  return tab.filters.assigneeIds
    .map(id => users.value.find(u => u.id === id))
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

  // Usuarios
  const userNames = getTabAssigneeNames(tab)
  if (userNames.length > 0) {
    parts.push(`Usuarios: ${userNames.join(', ')}`)
  }

  // Estado
  if (tab.filters.status && tab.filters.status !== 'all') {
    parts.push(`Estado: ${tab.filters.status}`)
  }

  return parts.length > 0 ? parts.join(' | ') : 'Sin filtros adicionales'
}

const canCreateTask = computed(() => {
  const role = authStore.userRole
  return role === 'admin' || role === 'supervisor' || role === 'operario'
})

const canAssign = computed(() => {
  const role = authStore.userRole
  return role === 'admin' || role === 'supervisor'
})

const canDeleteTask = computed(() => {
  const role = authStore.userRole
  return role === 'admin' || role === 'supervisor'
})

const hasActiveFilters = computed(() => {
  return filters.value.search !== '' ||
    filters.value.status !== 'all' ||
    filters.value.assigneeId !== 'all'
})

const clearFilters = () => {
  filters.value = {
    search: '',
    status: 'all',
    assigneeId: 'all',
    dateFrom: null,
    dateTo: null
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

// Helper functions for Asana-style list
const getTaskAssigneeId = (task) => {
  return task.assignee?.id || task.assignee_id || task.assigned_to || ''
}

const getAssigneeName = (task) => {
  const assigneeId = getTaskAssigneeId(task)
  if (!assigneeId) return 'Sin asignar'
  const user = users.value.find(u => u.id === assigneeId)
  return user?.name || task.assignee_name || 'Usuario'
}

const getInitials = (name) => {
  if (!name || name === 'Sin asignar') return '?'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const getAvatarColor = (name) => {
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

const formatDueDate = (date) => {
  if (!date) return 'Sin fecha'

  // Parsear la fecha manualmente para evitar problemas de zona horaria
  const dateParts = date.split('-')
  if (dateParts.length !== 3) {
    const d = new Date(date)
    if (isNaN(d.getTime())) return 'Sin fecha'
    return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
  }

  const year = parseInt(dateParts[0])
  const month = parseInt(dateParts[1]) - 1
  const day = parseInt(dateParts[2])

  const taskDate = new Date(year, month, day)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)

  if (taskDate.getTime() === today.getTime()) return 'Hoy'
  if (taskDate.getTime() === tomorrow.getTime()) return 'Mañana'

  return taskDate.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
}

const getDueDateColor = (task) => {
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

const getStatusSelectClass = (status) => {
  const classes = {
    'Pendiente': 'bg-yellow-100 text-yellow-800',
    'En Progreso': 'bg-blue-100 text-blue-800',
    'Por Verificar': 'bg-green-100 text-green-800',
    'Completada': 'bg-green-100 text-green-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const loadTasks = async () => {
  const hasCachedData = taskStore.tasks.length > 0
  if (!hasCachedData) {
    loading.value = true
  }
  try {
    await taskStore.fetchTasks(undefined, { force: true })
  } catch (error) {
    toast.error('Error al cargar las tareas')
  } finally {
    loading.value = false
  }
}

const loadUsers = async () => {
  try {
    const data = await userService.getUsers({ active: true })
    if (Array.isArray(data)) {
      users.value = data
    } else if (data.users && Array.isArray(data.users)) {
      users.value = data.users
    } else if (data.data && Array.isArray(data.data)) {
      users.value = data.data
    } else {
      users.value = []
    }

    const currentUser = authStore.user
    if (currentUser && !users.value.find(u => u.id === currentUser.id)) {
      users.value.push({
        id: currentUser.id,
        name: currentUser.name || currentUser.email,
        email: currentUser.email,
        role: currentUser.role
      })
    }
    saveCached(TL_USERS_KEY, users.value)
  } catch (error) {
    console.error('Error al cargar usuarios:', error)
    const currentUser = authStore.user
    if (currentUser) {
      users.value = [{
        id: currentUser.id,
        name: currentUser.name || currentUser.email,
        email: currentUser.email,
        role: currentUser.role
      }]
    }
  }
}

const handleTaskClick = (task) => {
  router.push(`/tasks/${task.id}`)
}

const handleEditTask = (task) => {
  selectedTaskForEdit.value = task
  isModalOpen.value = true
}

const handleDeleteTask = (task) => {
  confirmModal.value = {
    isOpen: true,
    title: 'Eliminar tarea',
    message: `¿Estás seguro de eliminar la tarea "${task.title}"? Esta acción no se puede deshacer.`,
    onConfirm: async () => {
      try {
        await taskStore.deleteTask(task.id)
        toast.success('Tarea eliminada correctamente')
        closeConfirmModal()
      } catch (error) {
        const msg = error?.status === 403
          ? 'No tienes permiso para eliminar tareas'
          : 'Error al eliminar la tarea'
        toast.error(msg)
        closeConfirmModal()
      }
    }
  }
}

const handleStatusChange = async ({ task, newStatus }) => {
  try {
    await taskStore.updateTaskStatus(task.id, newStatus)
    toast.success('Estado actualizado correctamente')
  } catch (error) {
    toast.error('Error al actualizar el estado')
  }
}

const handleAssigneeChange = async (task, newAssigneeId) => {
  const previousAssigneeId = getTaskAssigneeId(task)
  try {
    // Actualizar todos los campos posibles para feedback inmediato
    task.assignee_id = newAssigneeId
    task.assigned_to = newAssigneeId
    if (task.assignee) task.assignee = { ...task.assignee, id: newAssigneeId }
    else task.assignee = { id: newAssigneeId }
    await taskStore.reassignTask(task.id, newAssigneeId)
    // Refrescar tareas para sincronizar con backend
    await taskStore.fetchTasks()
    toast.success('Operador asignado correctamente')
  } catch (error) {
    // Revertir en caso de error
    task.assignee_id = previousAssigneeId
    task.assigned_to = previousAssigneeId
    if (task.assignee) task.assignee.id = previousAssigneeId
    toast.error('Error al asignar operador')
  }
}

const handleStatusChangeSelect = async (task) => {
  try {
    let status = task.status
    // Si no es admin y selecciona "Completada", enviar "Por Verificar"
    const role = authStore.userRole
    if (status === 'Completada' && role !== 'admin' && role !== 'supervisor') {
      status = 'Por Verificar'
      task.status = 'Por Verificar'
    }
    await taskStore.updateTaskStatus(task.id, status)
    toast.success(status === 'Por Verificar' ? 'Tarea completada' : 'Estado actualizado correctamente')
  } catch (error) {
    toast.error('Error al actualizar el estado')
    await taskStore.fetchTasks()
  }
}

const handleRequestComplete = ({ task }) => {
  if (task.status === 'Completada' || task.status === 'Por Verificar') {
    // Si ya está completada o por verificar, reabrir
    handleStatusChange({ task, newStatus: 'Pendiente' })
  } else {
    // Mostrar dialogo de confirmación
    completeConfirmDialog.value = {
      visible: true,
      task
    }
  }
}

const handleConfirmComplete = async () => {
  const task = completeConfirmDialog.value.task
  if (!task) return

  try {
    await taskStore.updateTaskStatus(task.id, 'Por Verificar')
    toast.success('Tarea completada correctamente')
    completeConfirmDialog.value = {
      visible: false,
      task: null
    }
  } catch (error) {
    toast.error('Error al completar la tarea')
  }
}

const handleCancelComplete = () => {
  completeConfirmDialog.value = {
    visible: false,
    task: null
  }
}

// Quick create inline
const quickCreateActive = ref(false)
const quickCreateTitle = ref('')
const quickCreateDescription = ref('')
const quickCreateDueDate = ref('')
const quickCreateAssigneeId = ref('')
const quickCreateShowAssignee = ref(false)
const quickCreateSaving = ref(false)
const quickCreateError = ref('')
const quickCreateInput = ref(null)

const todayDate = computed(() => {
  const d = new Date()
  return d.toISOString().split('T')[0]
})

const activateQuickCreate = async () => {
  quickCreateActive.value = true
  quickCreateTitle.value = ''
  quickCreateDescription.value = ''
  quickCreateDueDate.value = ''
  quickCreateAssigneeId.value = ''
  quickCreateShowAssignee.value = false
  await nextTick()
  quickCreateInput.value?.focus()
}

const cancelQuickCreate = () => {
  quickCreateActive.value = false
  quickCreateTitle.value = ''
  quickCreateDescription.value = ''
  quickCreateDueDate.value = ''
  quickCreateAssigneeId.value = ''
  quickCreateShowAssignee.value = false
  quickCreateError.value = ''
}

const submitQuickCreate = async () => {
  const title = quickCreateTitle.value.trim()
  if (!title) {
    cancelQuickCreate()
    return
  }
  quickCreateSaving.value = true
  quickCreateError.value = ''
  try {
    const taskData = { title }
    if (quickCreateDescription.value.trim()) {
      taskData.description = quickCreateDescription.value.trim()
    }
    if (quickCreateDueDate.value) {
      taskData.due_date = quickCreateDueDate.value
    }
    if (quickCreateAssigneeId.value) {
      taskData.assignee_id = quickCreateAssigneeId.value
    }
    await taskStore.createTask(taskData)
    toast.success('Tarea creada')
    cancelQuickCreate()
    await nextTick()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (err) {
    quickCreateError.value = err?.response?.data?.message || err?.message || 'Error al crear la tarea. Intenta de nuevo.'
  } finally {
    quickCreateSaving.value = false
  }
}

const openCreateModal = () => {
  selectedTaskForEdit.value = null
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedTaskForEdit.value = null
}

const handleSaveTask = async (taskData) => {
  try {
    if (selectedTaskForEdit.value) {
      await taskStore.updateTask(selectedTaskForEdit.value.id, taskData)
      toast.success('Tarea actualizada correctamente')
      closeModal()
    } else {
      // Creación optimista: cerrar modal de inmediato, sincronizar en segundo plano
      closeModal()
      toast.success('Tarea creada correctamente')
      taskStore.createTask(taskData).catch(() => {
        toast.error('Error al sincronizar. Puedes reintentar desde la tarjeta.')
      })
      // Scroll al inicio de la lista
      await nextTick()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  } catch (error) {
    toast.error(error.message || 'Error al guardar la tarea')
  }
}

// Funciones para pestañas personalizadas
const loadCustomTabs = async () => {
  try {
    const tabs = await tabService.getTabs('tasks')
    customTabs.value = tabs.map(tab => ({
      id: tab.id,
      label: tab.label,
      filters: tab.filters || {}
    }))
    saveCached(TL_TABS_KEY, customTabs.value)
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
      view_type: 'tasks',
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

const deleteCustomTab = (tabId) => {
  const tab = customTabs.value.find(t => t.id === tabId)
  if (!tab) return

  confirmModal.value = {
    isOpen: true,
    title: 'Eliminar pestaña',
    message: `¿Estás seguro de eliminar la pestaña "${tab.label}"? Esta acción no se puede deshacer.`,
    onConfirm: async () => {
      try {
        await tabService.deleteTab(tabId)
        customTabs.value = customTabs.value.filter(t => t.id !== tabId)

        if (currentTab.value === tabId) {
          currentTab.value = 'all'
        }

        toast.success('Pestaña eliminada')
        closeConfirmModal()
      } catch (error) {
        console.error('Error al eliminar pestaña:', error)
        toast.error('Error al eliminar la pestaña')
        closeConfirmModal()
      }
    }
  }
}

const closeConfirmModal = () => {
  confirmModal.value = {
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  }
}

const handleConfirm = () => {
  if (confirmModal.value.onConfirm) {
    confirmModal.value.onConfirm()
  }
}

// Watchers para resetear paginación
watch([filters, currentTab], () => {
  currentPage.value = 1
}, { deep: true })

onMounted(async () => {
  // Primero las tareas (se muestran de inmediato)
  await loadTasks()
  // Usuarios y tabs cargan en background
  Promise.all([
    loadCustomTabs(),
    loadUsers()
  ]).catch(() => {})
})
</script>
