<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto" @click.self="handleCancel">
    <div class="flex min-h-screen items-center justify-center p-4">
      <!-- Overlay -->
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>

      <!-- Modal -->
      <div class="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold text-gray-900">
            {{ isEdit ? 'Editar Tarea' : 'Nueva Tarea' }}
          </h3>
          <button @click="handleCancel" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Error general -->
        <div v-if="submitError" class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p class="text-sm">{{ submitError }}</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Título -->
          <BaseInput
            v-model="formData.title"
            label="Título"
            placeholder="Título de la tarea"
            :error="errors.title"
            :disabled="isSubmitting"
            required
            @blur="validateSingleField('title')"
          >
            <template #icon-right>
              <VoiceInputButton
                v-model="formData.title"
                :disabled="isSubmitting"
                :show-status="false"
                size="small"
              />
            </template>
          </BaseInput>

          <!-- Descripción -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <div class="relative">
              <textarea
                v-model="formData.description"
                rows="3"
                class="input-field w-full resize-none pr-12"
                :class="{ 'border-red-500': errors.description }"
                placeholder="Descripción detallada (opcional)"
                :disabled="isSubmitting"
                @blur="validateSingleField('description')"
              ></textarea>
              <!-- Botón de voz para descripción -->
              <div class="absolute top-2 right-2">
                <VoiceInputButton
                  v-model="formData.description"
                  :disabled="isSubmitting"
                  :append="true"
                  :show-status="false"
                  size="small"
                  @status-change="handleVoiceStatus"
                />
              </div>
            </div>
            <!-- Estado de voz -->
            <p v-if="voiceStatus" class="mt-1 text-xs" :class="voiceStatusClass">
              {{ voiceStatus }}
            </p>
            <p v-else-if="errors.description" class="mt-1 text-sm text-red-600">{{ errors.description }}</p>
          </div>

          <!-- Fecha y Hora -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Fecha <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.due_date"
                type="date"
                class="input-field w-full"
                :class="{ 'border-red-500': errors.due_date }"
                :disabled="isSubmitting"
                :min="todayDate"
                @blur="validateSingleField('due_date')"
              />
              <p v-if="errors.due_date" class="mt-1 text-sm text-red-600">{{ errors.due_date }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Hora
              </label>
              <input
                v-model="formData.due_time"
                type="time"
                class="input-field w-full"
                :class="{ 'border-red-500': errors.due_time }"
                :disabled="isSubmitting"
                @blur="validateSingleField('due_time')"
              />
              <p v-if="errors.due_time" class="mt-1 text-sm text-red-600">{{ errors.due_time }}</p>
            </div>
          </div>

          <!-- Prioridad -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Prioridad <span class="text-red-500">*</span>
            </label>
            <select
              v-model="formData.priority"
              class="input-field w-full"
              :class="{ 'border-red-500': errors.priority }"
              :disabled="isSubmitting"
              @blur="validateSingleField('priority')"
            >
              <option value="">Seleccionar prioridad</option>
              <option value="Baja">Baja</option>
              <option value="Media">Media</option>
              <option value="Alta">Alta</option>
            </select>
            <p v-if="errors.priority" class="mt-1 text-sm text-red-600">{{ errors.priority }}</p>
          </div>

          <!-- Asignar a (solo Admin/Supervisor) -->
          <div v-if="canAssign">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Asignar a <span class="text-red-500">*</span>
            </label>
            <select
              v-model="formData.assignee_id"
              class="input-field w-full"
              :class="{ 'border-red-500': errors.assignee_id }"
              :disabled="isSubmitting || users.length === 0"
              @blur="validateSingleField('assignee_id')"
            >
              <option :value="null">{{ users.length === 0 ? 'Cargando operadores...' : 'Seleccionar operador' }}</option>
              <option v-for="user in users" :key="user.id" :value="user.id">
                {{ user.name }}
              </option>
            </select>
            <p v-if="errors.assignee_id" class="mt-1 text-sm text-red-600">{{ errors.assignee_id }}</p>
          </div>

          <!-- Mensaje informativo para operarios -->
          <div v-else-if="authStore.userRole === 'operario'" class="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div class="flex items-start">
              <svg class="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-sm text-blue-800">
                Esta tarea será asignada automáticamente a ti.
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 pt-4">
            <BaseButton
              type="button"
              variant="secondary"
              @click="handleCancel"
              :disabled="isSubmitting"
            >
              Cancelar
            </BaseButton>
            <BaseButton
              type="submit"
              variant="primary"
              :loading="isSubmitting"
              :loading-text="isEdit ? 'Guardando...' : 'Creando...'"
            >
              {{ isEdit ? 'Guardar' : 'Crear tarea' }}
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch } from 'vue'
import { useAuthStore } from '@/stores'
import { taskSchema } from '@/utils/validationSchemas'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import VoiceInputButton from '@/components/common/VoiceInputButton.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  task: {
    type: Object,
    default: null
  },
  users: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['save', 'cancel'])

const authStore = useAuthStore()

const formData = reactive({
  title: '',
  description: '',
  due_date: '',
  due_time: '',
  priority: '',
  assignee_id: null
})

const errors = reactive({
  title: '',
  description: '',
  due_date: '',
  due_time: '',
  priority: '',
  assignee_id: ''
})

const isSubmitting = ref(false)
const submitError = ref('')
const voiceStatus = ref('')
const voiceStatusType = ref('idle')

const isEdit = computed(() => !!props.task)

const voiceStatusClass = computed(() => {
  const classes = {
    listening: 'text-blue-600 font-medium',
    success: 'text-green-600',
    error: 'text-red-600',
    idle: ''
  }
  return classes[voiceStatusType.value] || ''
})

const canAssign = computed(() => {
  const role = authStore.userRole
  return role === 'admin' || role === 'supervisor'
})

// Fecha mínima para el selector de fecha (hoy)
const todayDate = computed(() => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
})

// Si es operario, auto-asignar la tarea a sí mismo
const ensureAssignee = () => {
  const role = authStore.userRole
  if (role === 'operario' && !formData.assignee_id) {
    // Convertir a string para que coincida con la validación
    formData.assignee_id = authStore.user?.id ? String(authStore.user.id) : null
  }
}

const handleVoiceStatus = ({ status, message }) => {
  voiceStatusType.value = status
  voiceStatus.value = message
}

const clearErrors = () => {
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
  submitError.value = ''
}

const validateSingleField = async (fieldName) => {
  try {
    await taskSchema.validateAt(fieldName, formData)
    errors[fieldName] = ''
  } catch (error) {
    errors[fieldName] = error.message
  }
}

const validateForm = async () => {
  clearErrors()

  try {
    await taskSchema.validate(formData, { abortEarly: false })
    return true
  } catch (validationErrors) {
    validationErrors.inner.forEach(error => {
      errors[error.path] = error.message
    })
    return false
  }
}

const handleSubmit = async () => {
  // Si es operario, auto-asignar la tarea a sí mismo
  ensureAssignee()

  const isValid = await validateForm()

  if (!isValid) {
    return
  }

  isSubmitting.value = true
  submitError.value = ''

  try {
    const taskData = { ...formData }
    // No convertir assignee_id a número porque el backend espera UUID (string)
    // El assignee_id ya viene como string del selector

    emit('save', taskData)
  } catch (error) {
    submitError.value = error.message || 'Error al guardar la tarea'
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  emit('cancel')
}

const resetForm = () => {
  formData.title = ''
  formData.description = ''
  formData.due_date = ''
  formData.due_time = ''
  formData.priority = ''
  formData.assignee_id = null
  clearErrors()
}

// Cargar datos si es edición
watch(() => props.task, (newTask) => {
  if (newTask) {
    formData.title = newTask.title || ''
    formData.description = newTask.description || ''
    formData.due_date = newTask.due_date || ''
    // Usar due_time_formatted si está disponible (hora en formato HH:MM)
    // de lo contrario usar due_time solo si no es un datetime ISO completo
    if (newTask.due_time_formatted) {
      formData.due_time = newTask.due_time_formatted
    } else if (newTask.due_time && !newTask.due_time.includes('T')) {
      formData.due_time = newTask.due_time
    } else {
      formData.due_time = ''
    }
    formData.priority = newTask.priority || ''
    formData.assignee_id = newTask.assignee_id || newTask.assigned_to || null
  } else {
    resetForm()
    // Si es operario, auto-asignarse al crear una nueva tarea
    ensureAssignee()
  }
}, { immediate: true })

// Resetear cuando se cierra o se abre
watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    resetForm()
  } else {
    // Si es operario y está creando una nueva tarea, auto-asignarse
    if (!props.task && authStore.userRole === 'operario') {
      ensureAssignee()
    }
  }
})
</script>
