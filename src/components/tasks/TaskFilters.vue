<template>
  <div class="bg-white rounded-lg shadow p-4">
    <!-- Mobile toggle -->
    <button
      @click="isExpanded = !isExpanded"
      class="flex items-center justify-between w-full lg:hidden mb-4"
    >
      <span class="font-medium text-gray-900">Filtros</span>
      <svg
        :class="{ 'rotate-180': isExpanded }"
        class="w-5 h-5 transition-transform"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Filters -->
    <div :class="{ 'hidden lg:block': !isExpanded }" class="space-y-4">
      <!-- Búsqueda -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
        <input
          v-model="localFilters.search"
          type="text"
          placeholder="Buscar tareas..."
          class="input-field w-full"
          @input="debouncedSearch"
        />
      </div>

      <!-- Estado -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
        <select v-model="localFilters.status" class="input-field w-full" @change="applyFilters">
          <option value="all">Todos</option>
          <option value="Pendiente">Pendiente</option>
          <option value="En Progreso">En Progreso</option>
          <option value="Completada">Completada</option>
          <option value="Cancelada">Cancelada</option>
        </select>
      </div>

      <!-- Prioridad -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
        <select v-model="localFilters.priority" class="input-field w-full" @change="applyFilters">
          <option value="all">Todas</option>
          <option value="Alta">Alta</option>
          <option value="Media">Media</option>
          <option value="Baja">Baja</option>
        </select>
      </div>

      <!-- Asignado a -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Asignado a</label>
        <select v-model="localFilters.assigneeId" class="input-field w-full" @change="applyFilters">
          <option value="all">Todos</option>
          <option v-for="user in users" :key="user.id" :value="user.id">
            {{ user.name }}
          </option>
        </select>
      </div>

      <!-- Rango de fechas -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Fecha desde</label>
        <input
          v-model="localFilters.dateFrom"
          type="date"
          class="input-field w-full"
          @change="applyFilters"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Fecha hasta</label>
        <input
          v-model="localFilters.dateTo"
          type="date"
          class="input-field w-full"
          @change="applyFilters"
        />
      </div>

      <!-- Limpiar filtros -->
      <button
        @click="clearFilters"
        class="w-full text-sm text-primary-600 hover:text-primary-700 font-medium"
      >
        Limpiar filtros
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      search: '',
      status: 'all',
      priority: 'all',
      assigneeId: 'all',
      dateFrom: null,
      dateTo: null
    })
  },
  users: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'apply'])

const isExpanded = ref(false)
const localFilters = reactive({ ...props.modelValue })

let searchTimeout = null

const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    applyFilters()
  }, 500)
}

const applyFilters = () => {
  emit('update:modelValue', { ...localFilters })
  emit('apply', { ...localFilters })
}

const clearFilters = () => {
  localFilters.search = ''
  localFilters.status = 'all'
  localFilters.priority = 'all'
  localFilters.assigneeId = 'all'
  localFilters.dateFrom = null
  localFilters.dateTo = null
  applyFilters()
}

watch(() => props.modelValue, (newFilters) => {
  Object.assign(localFilters, newFilters)
}, { deep: true })
</script>
