<template>
  <div
    class="bg-white rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer border-l-4 overflow-hidden"
    :style="{ borderLeftColor: project.color || '#3B82F6' }"
    @click="$emit('click', project)"
  >
    <div class="p-5">
      <!-- Header -->
      <div class="flex items-start justify-between mb-3">
        <div class="flex-1 min-w-0">
          <h3 class="text-lg font-bold text-gray-900 truncate">{{ project.name }}</h3>
          <p v-if="project.description" class="text-sm text-gray-500 line-clamp-2 mt-1">
            {{ project.description }}
          </p>
        </div>
        <div class="flex items-center gap-2 ml-3 flex-shrink-0">
          <!-- Health badge -->
          <span :class="healthBadgeClass" class="text-xs font-semibold px-2 py-1 rounded-full">
            {{ healthLabel }}
          </span>
          <!-- Menu -->
          <div class="relative" @click.stop>
            <button
              @click="showMenu = !showMenu"
              class="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
            <div
              v-if="showMenu"
              class="absolute right-0 top-8 z-20 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[140px]"
            >
              <button
                @click="$emit('edit', project); showMenu = false"
                class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </button>
              <button
                @click="$emit('delete', project); showMenu = false"
                class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Progress bar -->
      <div class="mb-3">
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs font-medium text-gray-600">Progreso</span>
          <span class="text-xs font-bold" :style="{ color: project.color || '#3B82F6' }">
            {{ progress.percentage }}%
          </span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div
            class="h-2.5 rounded-full transition-all duration-500"
            :style="{ width: progress.percentage + '%', backgroundColor: project.color || '#3B82F6' }"
          ></div>
        </div>
      </div>

      <!-- Task stats -->
      <div class="flex items-center gap-3 text-xs text-gray-500">
        <span class="flex items-center gap-1">
          <span class="w-2 h-2 rounded-full bg-yellow-400"></span>
          {{ progress.pending }} pendientes
        </span>
        <span class="flex items-center gap-1">
          <span class="w-2 h-2 rounded-full bg-blue-400"></span>
          {{ progress.in_progress }} en progreso
        </span>
        <span class="flex items-center gap-1">
          <span class="w-2 h-2 rounded-full bg-green-400"></span>
          {{ progress.completed }} completadas
        </span>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <div v-if="project.due_date" class="flex items-center gap-1 text-xs" :class="dueDateColor">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {{ formattedDueDate }}
        </div>
        <div v-else class="text-xs text-gray-400">Sin fecha limite</div>

        <div class="flex items-center gap-1 text-xs text-gray-500">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          {{ progress.total }} tareas
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  project: {
    type: Object,
    required: true
  }
})

defineEmits(['click', 'edit', 'delete'])

const showMenu = ref(false)

const progress = computed(() => props.project.progress || {
  total: 0, completed: 0, pending: 0, in_progress: 0, to_verify: 0, cancelled: 0, percentage: 0
})

const healthLabel = computed(() => {
  const labels = {
    on_track: 'En curso',
    at_risk: 'En riesgo',
    completed: 'Completado',
    paused: 'Pausado'
  }
  return labels[props.project.health] || 'En curso'
})

const healthBadgeClass = computed(() => {
  const classes = {
    on_track: 'bg-green-100 text-green-700',
    at_risk: 'bg-red-100 text-red-700',
    completed: 'bg-blue-100 text-blue-700',
    paused: 'bg-gray-100 text-gray-600'
  }
  return classes[props.project.health] || 'bg-green-100 text-green-700'
})

const formattedDueDate = computed(() => {
  if (!props.project.due_date) return ''
  const parts = props.project.due_date.split('-')
  if (parts.length !== 3) return props.project.due_date
  const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
})

const dueDateColor = computed(() => {
  if (!props.project.due_date) return 'text-gray-400'
  const parts = props.project.due_date.split('-')
  if (parts.length !== 3) return 'text-gray-600'
  const dueDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (dueDate < today) return 'text-red-600'
  return 'text-gray-600'
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
