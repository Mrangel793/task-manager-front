<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="visible"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="handleCancel"
      >
        <div class="flex min-h-screen items-center justify-center p-4">
          <!-- Backdrop -->
          <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>

          <!-- Dialog -->
          <Transition
            enter-active-class="transition ease-out duration-300"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition ease-in duration-200"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div
              v-if="visible"
              class="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6"
            >
              <!-- Header -->
              <div class="flex items-center justify-between mb-6">
                <div>
                  <h3 class="text-xl font-bold text-gray-900">Reasignar tarea</h3>
                  <p class="mt-1 text-sm text-gray-500">
                    Selecciona el nuevo operador para esta tarea
                  </p>
                </div>
                <button
                  @click="handleCancel"
                  class="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Current assignment info -->
              <div v-if="task" class="mb-6 p-4 bg-gray-50 rounded-lg">
                <p class="text-sm text-gray-600 mb-2">Tarea: <span class="font-semibold text-gray-900">{{ task.title }}</span></p>
                <p class="text-sm text-gray-600">
                  Asignado actualmente a:
                  <span class="font-semibold text-gray-900">
                    {{ currentAssigneeName }}
                  </span>
                </p>
              </div>

              <!-- Loading state -->
              <div v-if="loadingOperators" class="flex justify-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>

              <!-- Operators list -->
              <div v-else class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-3">
                  Nuevo operador <span class="text-red-500">*</span>
                </label>

                <!-- Empty state -->
                <div v-if="availableOperators.length === 0" class="text-center py-8">
                  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p class="mt-2 text-sm text-gray-500">No hay operadores disponibles</p>
                </div>

                <!-- Operators grid -->
                <div v-else class="space-y-2 max-h-80 overflow-y-auto">
                  <button
                    v-for="operator in availableOperators"
                    :key="operator.id"
                    @click="selectedOperatorId = operator.id"
                    type="button"
                    class="w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all"
                    :class="selectedOperatorId === operator.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'"
                  >
                    <!-- Avatar -->
                    <Avatar :user="operator" size="md" />

                    <!-- User info -->
                    <div class="flex-1 text-left">
                      <p class="font-medium text-gray-900">{{ operator.name }}</p>
                      <p class="text-sm text-gray-500">{{ operator.email }}</p>
                    </div>

                    <!-- Selected indicator -->
                    <div
                      v-if="selectedOperatorId === operator.id"
                      class="flex-shrink-0"
                    >
                      <svg class="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                    </div>
                  </button>
                </div>
              </div>

              <!-- Error message -->
              <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p class="text-sm text-red-600">{{ errorMessage }}</p>
              </div>

              <!-- Actions -->
              <div class="flex gap-3">
                <BaseButton
                  type="button"
                  variant="secondary"
                  class="flex-1"
                  @click="handleCancel"
                  :disabled="loading"
                >
                  Cancelar
                </BaseButton>

                <BaseButton
                  type="button"
                  variant="primary"
                  class="flex-1"
                  @click="handleReassign"
                  :loading="loading"
                  :disabled="!selectedOperatorId || loadingOperators"
                >
                  Reasignar
                </BaseButton>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { userService } from '@/services'
import BaseButton from '@/components/common/BaseButton.vue'
import Avatar from '@/components/common/Avatar.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  task: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['reassign', 'cancel', 'update:visible'])

const operators = ref([])
const selectedOperatorId = ref(null)
const loading = ref(false)
const loadingOperators = ref(false)
const errorMessage = ref('')

// Nombre del asignado actual
const currentAssigneeName = computed(() => {
  if (!props.task) return 'Sin asignar'

  // Si hay un objeto assignee
  if (props.task.assignee && typeof props.task.assignee === 'object') {
    return props.task.assignee.name || props.task.assignee.email || 'Sin nombre'
  }

  // Fallback a campos legacy
  return props.task.assigned_to_name || props.task.assignee_name || 'Sin asignar'
})

// ID del asignado actual
const currentAssigneeId = computed(() => {
  if (!props.task) return null

  if (props.task.assignee && typeof props.task.assignee === 'object') {
    return props.task.assignee.id
  }

  return props.task.assignee_id || props.task.assigned_to || null
})

// Operadores disponibles (excluir el asignado actual)
const availableOperators = computed(() => {
  if (!currentAssigneeId.value) return operators.value

  return operators.value.filter(op => op.id !== currentAssigneeId.value)
})

// Cargar operadores
const loadOperators = async () => {
  loadingOperators.value = true
  errorMessage.value = ''

  try {
    const data = await userService.getOperators()

    // Manejar diferentes estructuras de respuesta
    if (Array.isArray(data)) {
      operators.value = data
    } else if (data.users && Array.isArray(data.users)) {
      operators.value = data.users
    } else if (data.data && Array.isArray(data.data)) {
      operators.value = data.data
    } else {
      operators.value = []
    }
  } catch (error) {
    console.error('Error al cargar operadores:', error)
    errorMessage.value = 'Error al cargar la lista de operadores'
    operators.value = []
  } finally {
    loadingOperators.value = false
  }
}

// Manejar reasignación
const handleReassign = async () => {
  if (!selectedOperatorId.value) {
    errorMessage.value = 'Por favor selecciona un operador'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    emit('reassign', {
      taskId: props.task.id,
      newAssigneeId: selectedOperatorId.value,
      newAssigneeName: operators.value.find(op => op.id === selectedOperatorId.value)?.name
    })
  } catch (error) {
    errorMessage.value = 'Error al reasignar la tarea'
  } finally {
    loading.value = false
  }
}

// Manejar cancelación
const handleCancel = () => {
  emit('cancel')
  emit('update:visible', false)
}

// Resetear al abrir/cerrar
watch(() => props.visible, (newValue) => {
  if (newValue) {
    selectedOperatorId.value = null
    errorMessage.value = ''
    loadOperators()
  }
})
</script>
