<template>
  <div class="max-w-2xl mx-auto">
    <!-- Header -->
    <div class="mb-6">
      <button
        @click="goBack"
        class="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
      >
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Volver al perfil
      </button>
      <h1 class="text-2xl font-bold text-gray-900">Editar Perfil</h1>
      <p class="text-sm text-gray-600 mt-1">Actualiza tu información personal</p>
    </div>

    <!-- Form Card -->
    <div class="bg-white rounded-lg shadow">
      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <!-- Error general -->
        <div v-if="submitError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p class="text-sm">{{ submitError }}</p>
        </div>

        <!-- Success message -->
        <div v-if="successMessage" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          <p class="text-sm">{{ successMessage }}</p>
        </div>

        <!-- Nombre -->
        <BaseInput
          v-model="formData.name"
          label="Nombre completo"
          placeholder="Ej: Juan Pérez"
          :error="errors.name"
          :disabled="isSubmitting"
          required
          @blur="validateSingleField('name')"
        />

        <!-- Teléfono -->
        <BaseInput
          v-model="formData.phone"
          label="Teléfono"
          type="tel"
          placeholder="+57 3XX XXX XXXX"
          :error="errors.phone"
          :disabled="isSubmitting"
          required
          @blur="validateSingleField('phone')"
        >
          <template #help>
            Formato: +57 seguido de 10 dígitos (debe empezar con 3)
          </template>
        </BaseInput>

        <!-- Info del rol (solo lectura) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Rol
          </label>
          <div class="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700">
            {{ getRoleLabel }}
          </div>
          <p class="mt-1 text-xs text-gray-500">
            El rol es asignado por un administrador y no puede ser modificado
          </p>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <BaseButton
            type="button"
            variant="secondary"
            @click="goBack"
            :disabled="isSubmitting"
          >
            Cancelar
          </BaseButton>
          <BaseButton
            type="submit"
            variant="primary"
            :loading="isSubmitting"
            loading-text="Guardando..."
          >
            Guardar cambios
          </BaseButton>
        </div>
      </form>
    </div>

    <!-- Danger zone -->
    <div class="mt-6 bg-white rounded-lg shadow border-l-4 border-red-500">
      <div class="p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Zona de peligro</h3>
        <p class="text-sm text-gray-600 mb-4">
          Estas acciones son permanentes y no se pueden deshacer
        </p>
        <BaseButton
          variant="danger"
          size="sm"
          @click="handleDeleteAccount"
        >
          Eliminar cuenta
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores'
import { useToast } from '@/composables/useToast'
import * as yup from 'yup'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

// Validación schema para edición de perfil
const phoneRegex = /^\+57[3][0-9]{9}$/

const editProfileSchema = yup.object({
  name: yup
    .string()
    .required('El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede tener más de 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras'),
  phone: yup
    .string()
    .required('El teléfono es requerido')
    .matches(phoneRegex, 'Número de teléfono inválido (formato: +57 3XX XXX XXXX)')
})

const formData = reactive({
  name: '',
  phone: ''
})

const errors = reactive({
  name: '',
  phone: ''
})

const isSubmitting = ref(false)
const submitError = ref('')
const successMessage = ref('')

const getRoleLabel = computed(() => {
  const role = authStore.userRole
  const labels = {
    admin: 'Administrador',
    supervisor: 'Supervisor',
    operario: 'Operador'
  }
  return labels[role] || 'Usuario'
})

const clearErrors = () => {
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
  submitError.value = ''
  successMessage.value = ''
}

const validateSingleField = async (fieldName) => {
  try {
    await editProfileSchema.validateAt(fieldName, formData)
    errors[fieldName] = ''
  } catch (error) {
    errors[fieldName] = error.message
  }
}

const validateForm = async () => {
  clearErrors()

  try {
    await editProfileSchema.validate(formData, { abortEarly: false })
    return true
  } catch (validationErrors) {
    validationErrors.inner.forEach(error => {
      errors[error.path] = error.message
    })
    return false
  }
}

const handleSubmit = async () => {
  const isValid = await validateForm()

  if (!isValid) {
    return
  }

  isSubmitting.value = true
  submitError.value = ''
  successMessage.value = ''

  try {
    // TODO: Llamar al servicio de actualización de perfil
    // await userService.updateProfile(formData)

    // Actualizar el store local
    authStore.user = {
      ...authStore.user,
      name: formData.name,
      phone: formData.phone
    }

    successMessage.value = 'Perfil actualizado correctamente'
    toast.success('Perfil actualizado correctamente')

    // Redirigir después de 1.5 segundos
    setTimeout(() => {
      router.push('/profile')
    }, 1500)
  } catch (error) {
    submitError.value = error.message || 'Error al actualizar el perfil'
    toast.error('Error al actualizar el perfil')
  } finally {
    isSubmitting.value = false
  }
}

const goBack = () => {
  router.push('/profile')
}

const handleDeleteAccount = () => {
  // TODO: Implementar eliminación de cuenta con confirmación
  toast.info('Funcionalidad en desarrollo')
}

// Cargar datos del usuario al montar
onMounted(() => {
  const user = authStore.user
  if (user) {
    formData.name = user.name || ''
    formData.phone = user.phone || ''
  }
})
</script>
