<template>
  <div class="relative" ref="dropdownRef">
    <!-- Botón/Badge de estado -->
    <button
      ref="buttonRef"
      @click.stop="toggleDropdown"
      :disabled="!canChange"
      type="button"
      class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
      :class="[
        statusConfig.badgeClass,
        canChange ? 'hover:opacity-80 cursor-pointer' : 'cursor-default opacity-90'
      ]"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="statusConfig.icon" />
      </svg>
      <span>{{ statusConfig.label }}</span>
      <svg
        v-if="canChange"
        class="w-4 h-4 transition-transform"
        :class="{ 'rotate-180': isOpen }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Dropdown menu - usando Teleport -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <div
          v-if="isOpen && canChange"
          ref="menuRef"
          :style="menuPosition"
          class="fixed z-[9999] w-48 rounded-lg shadow-xl bg-white ring-1 ring-black ring-opacity-5"
        >
          <div class="py-1">
            <button
              v-for="status in availableStatuses"
              :key="status.value"
              @click.stop="changeStatus(status.value)"
              :disabled="status.value === task.status"
              type="button"
              class="w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-colors"
              :class="
                status.value === task.status
                  ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100 cursor-pointer'
              "
            >
              <svg class="w-4 h-4 flex-shrink-0" :class="status.textClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="status.icon" />
              </svg>
              <span class="flex-1">{{ status.label }}</span>
              <svg
                v-if="status.value === task.status"
                class="w-4 h-4 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useAuthStore } from '@/stores'
import { getStatusConfig, getAvailableStatuses, canChangeToStatus, TASK_STATUSES } from '@/utils/taskHelpers'

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['change', 'request-complete'])

const authStore = useAuthStore()
const dropdownRef = ref(null)
const buttonRef = ref(null)
const menuRef = ref(null)
const isOpen = ref(false)
const menuPosition = ref({})

// Estado actual de la tarea
const statusConfig = computed(() => getStatusConfig(props.task.status || TASK_STATUSES.PENDING))

// Todos los estados disponibles
const availableStatuses = computed(() => getAvailableStatuses())

// Verificar si el usuario puede cambiar el estado
const canChange = computed(() => {
  const userRole = authStore.userRole
  const userId = authStore.user?.id

  // Si no hay rol, no puede cambiar
  if (!userRole) return false

  return canChangeToStatus(props.task, null, userRole, userId)
})

// Calcular posición del menú
const calculateMenuPosition = async () => {
  if (!buttonRef.value) return

  await nextTick()

  const buttonRect = buttonRef.value.getBoundingClientRect()
  const menuHeight = menuRef.value?.offsetHeight || 200
  const spaceBelow = window.innerHeight - buttonRect.bottom
  const spaceAbove = buttonRect.top

  // Posicionar el menú
  let top = buttonRect.bottom + 4
  let left = buttonRect.left

  // Si no hay espacio abajo, mostrar arriba
  if (spaceBelow < menuHeight && spaceAbove > menuHeight) {
    top = buttonRect.top - menuHeight - 4
  }

  // Asegurar que el menú no salga de la pantalla horizontalmente
  const menuWidth = 192 // w-48 = 12rem = 192px
  if (left + menuWidth > window.innerWidth) {
    left = window.innerWidth - menuWidth - 8
  }

  menuPosition.value = {
    top: `${top}px`,
    left: `${left}px`
  }
}

// Toggle dropdown
const toggleDropdown = () => {
  if (canChange.value) {
    isOpen.value = !isOpen.value
  }
}

// Watch para actualizar la posición cuando se abre
watch(isOpen, async (newValue) => {
  if (newValue) {
    await calculateMenuPosition()
  }
})

// Cambiar estado
const changeStatus = (newStatus) => {
  if (newStatus === props.task.status) return

  const userRole = authStore.userRole
  const userId = authStore.user?.id

  // Verificar permiso para este estado específico
  if (canChangeToStatus(props.task, newStatus, userRole, userId)) {
    // Si el nuevo estado es "Completada", solicitar confirmación
    if (newStatus === TASK_STATUSES.COMPLETED || newStatus === 'Completada') {
      emit('request-complete', { task: props.task })
    } else {
      emit('change', { task: props.task, newStatus })
    }
    isOpen.value = false
  }
}

// Cerrar dropdown al hacer click fuera
const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

// Recalcular posición en scroll/resize
const handleScrollOrResize = () => {
  if (isOpen.value) {
    calculateMenuPosition()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', handleScrollOrResize, true)
  window.addEventListener('resize', handleScrollOrResize)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', handleScrollOrResize, true)
  window.removeEventListener('resize', handleScrollOrResize)
})
</script>
