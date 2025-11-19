<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-gray-900">Bienvenido</h2>
          <p class="mt-2 text-sm text-gray-600">Inicia sesión en tu cuenta</p>
        </div>

        <!-- Error message -->
        <div v-if="submitError" class="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p class="text-sm">{{ submitError }}</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
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
          />

          <!-- Password Input -->
          <BaseInput
            v-model="formData.password"
            type="password"
            label="Contraseña"
            placeholder="Ingresa tu contraseña"
            :error="errors.password"
            :disabled="isSubmitting"
            autocomplete="current-password"
            required
          />

          <!-- Forgot Password Link -->
          <div class="flex items-center justify-end">
            <router-link
              to="/forgot-password"
              class="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              ¿Olvidaste tu contraseña?
            </router-link>
          </div>

          <!-- Submit Button -->
          <BaseButton
            type="submit"
            variant="primary"
            size="xl"
            :loading="isSubmitting"
            loading-text="Iniciando sesión..."
            full-width
          >
            Iniciar sesión
          </BaseButton>
        </form>

        <!-- Divider -->
        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">¿No tienes una cuenta?</span>
            </div>
          </div>
        </div>

        <!-- Register Link -->
        <div class="mt-6">
          <router-link
            to="/register"
            class="w-full inline-flex justify-center items-center px-4 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Crear cuenta nueva
          </router-link>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-8 text-center">
        <p class="text-xs text-gray-500">
          Al iniciar sesión, aceptas nuestros
          <a href="#" class="text-primary-600 hover:text-primary-500">Términos de servicio</a>
          y
          <a href="#" class="text-primary-600 hover:text-primary-500">Política de privacidad</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores'
import { useToast } from '@/composables/useToast'
import { loginSchema } from '@/utils/validationSchemas'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const toast = useToast()

const formData = reactive({
  email: '',
  password: ''
})

const errors = reactive({
  email: '',
  password: ''
})

const isSubmitting = ref(false)
const submitError = ref('')

const clearErrors = () => {
  errors.email = ''
  errors.password = ''
  submitError.value = ''
}

const validateForm = async () => {
  clearErrors()

  try {
    await loginSchema.validate(formData, { abortEarly: false })
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

  try {
    await authStore.login({
      email: formData.email,
      password: formData.password
    })

    toast.success('¡Bienvenido de nuevo!')

    // Redirigir a la página de donde venía o al dashboard
    const redirectTo = route.query.redirect || '/tasks'
    router.push(redirectTo)
  } catch (error) {
    submitError.value = error.message || 'Error al iniciar sesión. Por favor, verifica tus credenciales.'
    toast.error('Error al iniciar sesión')

    // Mostrar errores específicos de campos si existen
    if (error.data?.errors) {
      Object.keys(error.data.errors).forEach(field => {
        if (errors[field] !== undefined) {
          errors[field] = error.data.errors[field][0]
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
