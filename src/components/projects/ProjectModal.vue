<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto" @click.self="$emit('cancel')">
    <div class="flex min-h-screen items-center justify-center p-4">
      <!-- Overlay -->
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>

      <!-- Modal -->
      <div class="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold text-gray-900">
            {{ isEdit ? 'Editar Proyecto' : 'Nuevo Proyecto' }}
          </h3>
          <button @click="$emit('cancel')" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Error -->
        <div v-if="submitError" class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p class="text-sm">{{ submitError }}</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Nombre -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Nombre del proyecto <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formData.name"
              type="text"
              placeholder="Ej: PeriodikApp, Rediseno Web..."
              class="input-field w-full"
              :class="{ 'border-red-500': errors.name }"
              :disabled="isSubmitting"
              maxlength="100"
            />
            <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
          </div>

          <!-- Descripcion -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Descripcion</label>
            <textarea
              v-model="formData.description"
              rows="3"
              class="input-field w-full resize-none"
              placeholder="Objetivo o descripcion del proyecto (opcional)"
              :disabled="isSubmitting"
              maxlength="1000"
            ></textarea>
          </div>

          <!-- Color + Fecha en la misma fila -->
          <div class="grid grid-cols-2 gap-4">
            <!-- Color -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <div class="flex items-center gap-2">
                <input
                  v-model="formData.color"
                  type="color"
                  class="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer p-0.5"
                />
                <div class="flex gap-1.5 flex-wrap">
                  <button
                    v-for="c in presetColors"
                    :key="c"
                    type="button"
                    @click="formData.color = c"
                    class="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                    :class="formData.color === c ? 'border-gray-900 scale-110' : 'border-transparent'"
                    :style="{ backgroundColor: c }"
                  ></button>
                </div>
              </div>
            </div>

            <!-- Fecha limite -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fecha limite</label>
              <input
                v-model="formData.due_date"
                type="date"
                class="input-field w-full"
                :disabled="isSubmitting"
                :min="todayDate"
              />
            </div>
          </div>

          <!-- Visibilidad -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">¿Quién puede ver este proyecto?</label>
            <select v-model="formData.visibility" class="input-field w-full">
              <option value="todos">Toda la organización</option>
              <option value="miembros">Solo yo (y los que invite)</option>
            </select>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              @click="$emit('cancel')"
              :disabled="isSubmitting"
              class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
            >
              <svg v-if="isSubmitting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {{ isEdit ? 'Guardar' : 'Crear proyecto' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch } from 'vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  project: { type: Object, default: null }
})

const emit = defineEmits(['save', 'cancel'])

const presetColors = ['#3B82F6', '#8B5CF6', '#EC4899', '#EF4444', '#F97316', '#EAB308', '#22C55E', '#06B6D4']

const formData = reactive({
  name: '',
  description: '',
  color: '#3B82F6',
  due_date: '',
  visibility: 'todos'
})

const errors = reactive({ name: '' })
const isSubmitting = ref(false)
const submitError = ref('')

const isEdit = computed(() => !!props.project)

const todayDate = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

const handleSubmit = async () => {
  errors.name = ''
  submitError.value = ''

  if (!formData.name.trim() || formData.name.trim().length < 3) {
    errors.name = 'El nombre debe tener al menos 3 caracteres'
    return
  }

  isSubmitting.value = true
  try {
    const data = { name: formData.name.trim() }
    if (formData.description.trim()) data.description = formData.description.trim()
    if (formData.color) data.color = formData.color
    if (formData.due_date) data.due_date = formData.due_date
    data.visibility = formData.visibility

    emit('save', data)
  } catch (error) {
    submitError.value = error.message || 'Error al guardar'
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  formData.name = ''
  formData.description = ''
  formData.color = '#3B82F6'
  formData.due_date = ''
  formData.visibility = 'todos'
  errors.name = ''
  submitError.value = ''
}

watch(() => props.project, (p) => {
  if (p) {
    formData.name = p.name || ''
    formData.description = p.description || ''
    formData.color = p.color || '#3B82F6'
    formData.due_date = p.due_date || ''
    formData.visibility = p.visibility || 'todos'
  } else {
    resetForm()
  }
}, { immediate: true })

watch(() => props.isOpen, (open) => {
  if (!open) resetForm()
})
</script>
