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
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Título <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <textarea
                ref="titleInput"
                v-model="formData.title"
                placeholder="Título de la tarea"
                class="input-field w-full resize-none overflow-hidden pr-10 min-h-[42px]"
                :class="{ 'border-red-500 focus:ring-red-500 focus:border-red-500': errors.title }"
                :disabled="isSubmitting"
                rows="1"
                @input="autoResizeTitle"
                @blur="validateSingleField('title')"
              ></textarea>
              <div class="absolute top-2 right-2">
                <VoiceInputButton
                  v-model="formData.title"
                  :disabled="isSubmitting"
                  :show-status="false"
                  size="small"
                />
              </div>
            </div>
            <p v-if="errors.title" class="mt-1 text-sm text-red-600">{{ errors.title }}</p>
          </div>

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

          <!-- Proyecto -->
          <div v-if="availableProjects.length > 0">
            <label class="block text-sm font-medium text-gray-700 mb-1">Proyecto</label>
            <select
              v-model="formData.project_id"
              class="input-field w-full"
              :disabled="isSubmitting || !!props.defaultProjectId"
            >
              <option :value="null">Sin proyecto</option>
              <option v-for="p in availableProjects" :key="p.id" :value="p.id">
                {{ p.name }}
              </option>
            </select>
          </div>

          <!-- Fecha -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Fecha <span v-if="authStore.userRole !== 'admin'" class="text-red-500">*</span>
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

          <!-- Asignar a (solo Admin/Supervisor) -->
          <div v-if="canAssign">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Asignar a <span v-if="authStore.userRole !== 'admin'" class="text-red-500">*</span>
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
import { reactive, ref, computed, watch, nextTick, onMounted } from 'vue'
import { useAuthStore } from '@/stores'
import { useProjectStore } from '@/stores/project.store'
import { taskSchema, taskSchemaAdmin } from '@/utils/validationSchemas'
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
  },
  onSave: {
    type: Function,
    default: null
  },
  defaultProjectId: {
    type: String,
    default: null
  },
  projects: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['save', 'cancel'])

const authStore = useAuthStore()
const projectStore = useProjectStore()

const availableProjects = computed(() => {
  if (props.projects.length > 0) return props.projects
  return projectStore.activeProjects
})

const formData = reactive({
  title: '',
  description: '',
  due_date: '',
  assignee_id: null,
  project_id: null
})

const errors = reactive({
  title: '',
  description: '',
  due_date: '',
  assignee_id: ''
})

const titleInput = ref(null)
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

// Schema de validación según el rol
const validationSchema = computed(() => {
  const role = authStore.userRole
  console.log('Rol del usuario:', role, '| Usando schema admin:', role === 'admin')
  return role === 'admin' ? taskSchemaAdmin : taskSchema
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

const autoResizeTitle = () => {
  if (titleInput.value) {
    titleInput.value.style.height = 'auto'
    titleInput.value.style.height = titleInput.value.scrollHeight + 'px'
  }
}

const clearErrors = () => {
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
  submitError.value = ''
}

const validateSingleField = async (fieldName) => {
  try {
    await validationSchema.value.validateAt(fieldName, formData)
    errors[fieldName] = ''
  } catch (error) {
    errors[fieldName] = error.message
  }
}

const validateForm = async () => {
  clearErrors()

  try {
    await validationSchema.value.validate(formData, { abortEarly: false })
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

    if (props.onSave) {
      await props.onSave(taskData)
    } else {
      emit('save', taskData)
    }
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
  formData.assignee_id = null
  formData.project_id = props.defaultProjectId || null
  clearErrors()
}

// Auto-resize del título cuando cambia (ej: por voz)
watch(() => formData.title, () => {
  nextTick(autoResizeTitle)
})

// Cargar datos si es edición
watch(() => props.task, (newTask) => {
  if (newTask) {
    formData.title = newTask.title || ''
    formData.description = newTask.description || ''
    formData.due_date = newTask.due_date || ''
    formData.assignee_id = newTask.assignee?.id || newTask.assignee_id || newTask.assigned_to || null
    formData.project_id = newTask.project_id || newTask.project?.id || props.defaultProjectId || null
    nextTick(autoResizeTitle)
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
    // Cargar proyectos si no están cargados
    if (projectStore.projects.length === 0) {
      projectStore.fetchProjects().catch(() => {})
    }
    nextTick(autoResizeTitle)
  }
})
</script>
