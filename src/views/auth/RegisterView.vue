<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-gray-900">Crear cuenta</h2>
          <p class="mt-2 text-sm text-gray-600">Regístrate para comenzar</p>
        </div>

        <!-- Error message -->
        <div v-if="submitError" class="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p class="text-sm">{{ submitError }}</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-5">
          <!-- Name Input -->
          <BaseInput
            v-model="formData.name"
            type="text"
            label="Nombre completo"
            placeholder="Ingresa tu nombre"
            :error="errors.name"
            :disabled="isSubmitting"
            autocomplete="name"
            required
            @blur="validateSingleField('name')"
          />

          <!-- Email Input -->
          <BaseInput
            v-model="formData.email"
            type="email"
            label="Correo electrónico"
            placeholder="tucorreo@ejemplo.com"
            :error="errors.email"
            :disabled="isSubmitting"
            autocomplete="email"
            required
            @blur="validateSingleField('email')"
          />

          <!-- Phone Input (Optional) -->
          <BaseInput
            v-model="formData.phone"
            type="tel"
            label="Número de teléfono (opcional)"
            placeholder="+573001234567"
            :error="errors.phone"
            :disabled="isSubmitting"
            autocomplete="tel"
            @blur="validateSingleField('phone')"
          />

          <!-- Password Input -->
          <BaseInput
            v-model="formData.password"
            type="password"
            label="Contraseña"
            placeholder="Crea una contraseña"
            :error="errors.password"
            :disabled="isSubmitting"
            autocomplete="new-password"
            required
            @blur="validateSingleField('password')"
          />

          <!-- Password Strength Meter -->
          <PasswordStrength :password="formData.password" />

          <!-- Confirm Password Input -->
          <BaseInput
            v-model="formData.confirmPassword"
            type="password"
            label="Confirmar contraseña"
            placeholder="Confirma tu contraseña"
            :error="errors.confirmPassword"
            :disabled="isSubmitting"
            autocomplete="new-password"
            required
            @blur="validateSingleField('confirmPassword')"
          />

          <!-- Terms Checkbox -->
          <div class="flex items-start">
            <div class="flex items-center h-5">
              <input
                id="terms"
                v-model="formData.acceptTerms"
                type="checkbox"
                :disabled="isSubmitting"
                class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
              />
            </div>
            <div class="ml-3 text-sm">
              <label for="terms" class="font-medium text-gray-700">
                Acepto los
                <a href="#" class="text-primary-600 hover:text-primary-500">términos y condiciones</a>
                y la
                <a href="#" class="text-primary-600 hover:text-primary-500">política de privacidad</a>
                <span class="text-red-500">*</span>
              </label>
              <p v-if="errors.acceptTerms" class="mt-1 text-xs text-red-600">
                {{ errors.acceptTerms }}
              </p>
            </div>
          </div>

          <!-- Submit Button -->
          <BaseButton
            type="submit"
            variant="primary"
            size="xl"
            :loading="isSubmitting"
            loading-text="Creando cuenta..."
            full-width
          >
            Crear cuenta
          </BaseButton>
        </form>

        <!-- Divider -->
        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">¿Ya tienes una cuenta?</span>
            </div>
          </div>
        </div>

        <!-- Login Link -->
        <div class="mt-6">
          <router-link
            to="/login"
            class="w-full inline-flex justify-center items-center px-4 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Iniciar sesión
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores'
import { useToast } from '@/composables/useToast'
import { registerSchema } from '@/utils/validationSchemas'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import PasswordStrength from '@/components/common/PasswordStrength.vue'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const formData = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
})

const errors = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  acceptTerms: ''
})

const isSubmitting = ref(false)
const submitError = ref('')

const clearErrors = () => {
  errors.name = ''
  errors.email = ''
  errors.phone = ''
  errors.password = ''
  errors.confirmPassword = ''
  errors.acceptTerms = ''
  submitError.value = ''
}

const validateSingleField = async (fieldName) => {
  try {
    await registerSchema.validateAt(fieldName, formData)
    errors[fieldName] = ''
  } catch (error) {
    errors[fieldName] = error.message
  }
}

const validateForm = async () => {
  clearErrors()

  try {
    await registerSchema.validate(formData, { abortEarly: false })
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
    toast.warning('Por favor, corrige los errores del formulario')
    return
  }

  isSubmitting.value = true
  submitError.value = ''

  try {
    await authStore.register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone || null,
      password: formData.password,
      password_confirmation: formData.confirmPassword,
      accepted_terms: formData.acceptTerms
    })

    toast.success('¡Cuenta creada exitosamente!')

    // Redirigir al dashboard (ya está autenticado)
    router.push('/tasks')
  } catch (error) {
    submitError.value = error.message || 'Error al crear la cuenta. Por favor, intenta de nuevo.'
    toast.error('Error al crear la cuenta')

    // Mostrar errores específicos de campos si existen
    if (error.data?.errors) {
      Object.keys(error.data.errors).forEach(field => {
        // Mapear nombres de campos del backend a nombres del frontend
        const fieldMap = {
          'accepted_terms': 'acceptTerms',
          'password_confirmation': 'confirmPassword'
        }

        const frontendField = fieldMap[field] || field

        if (errors[frontendField] !== undefined) {
          errors[frontendField] = error.data.errors[field][0]
        }
      })
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
