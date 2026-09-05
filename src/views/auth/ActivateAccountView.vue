<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <!-- Estado 1: Verificando el token -->
        <div v-if="isVerifying" class="text-center py-8" aria-live="polite" aria-busy="true">
          <svg class="animate-spin h-10 w-10 mx-auto text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="mt-4 text-sm text-gray-600">Verificando tu enlace de activación...</p>
        </div>

        <!-- Estado 2: Token inválido o expirado -->
        <div v-else-if="!isTokenValid" class="text-center">
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg class="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900">Enlace no válido</h2>
          <p class="mt-3 text-sm text-gray-600" role="alert">
            {{ verifyError }}
          </p>
          <p class="mt-3 text-sm text-gray-500">
            Los enlaces de activación caducan a las 48 horas y solo pueden usarse una vez.
            Pídele a tu administrador que te envíe uno nuevo.
          </p>
          <router-link
            to="/login"
            class="mt-8 w-full inline-flex justify-center items-center px-4 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Ir a iniciar sesión
          </router-link>
        </div>

        <!-- Estado 4: Cuenta activada -->
        <div v-else-if="isActivated" class="text-center">
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900">¡Cuenta activada!</h2>
          <p class="mt-3 text-sm text-gray-600" role="status">
            {{ successMessage }}
          </p>
          <p class="mt-3 text-xs text-gray-500">
            Te llevaremos a iniciar sesión en unos segundos...
          </p>
          <BaseButton
            variant="primary"
            size="xl"
            full-width
            class="mt-8"
            @click="goToLogin"
          >
            Iniciar sesión
          </BaseButton>
        </div>

        <!-- Estado 3: Token válido, formulario -->
        <template v-else>
          <!-- Header -->
          <div class="text-center mb-8">
            <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 mb-4">
              <svg class="h-8 w-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 class="text-3xl font-bold text-gray-900">Hola{{ firstName ? `, ${firstName}` : '' }}</h2>
            <p class="mt-2 text-sm text-gray-600">
              <template v-if="organizationName">
                Crea tu contraseña para entrar a
                <span class="font-medium text-gray-900">{{ organizationName }}</span>
              </template>
              <template v-else>
                Crea tu contraseña para activar tu cuenta
              </template>
            </p>
          </div>

          <!-- Error general -->
          <div
            v-if="submitError"
            role="alert"
            class="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
          >
            <p class="text-sm">{{ submitError }}</p>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="space-y-6" novalidate>
            <!-- Password -->
            <div class="base-input-wrapper">
              <label for="activate-password" class="block text-sm font-medium text-gray-700 mb-1">
                Nueva contraseña
                <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <input
                  id="activate-password"
                  ref="passwordInput"
                  v-model="formData.password"
                  :type="showPassword ? 'text' : 'password'"
                  :disabled="isSubmitting"
                  :class="inputClasses(errors.password)"
                  :aria-invalid="errors.password ? 'true' : 'false'"
                  :aria-describedby="errors.password ? 'activate-password-error' : undefined"
                  placeholder="Mínimo 8 caracteres"
                  autocomplete="new-password"
                  required
                />
                <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                  <button
                    type="button"
                    class="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                    :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                    :aria-pressed="showPassword"
                    @click="showPassword = !showPassword"
                  >
                    <svg v-if="showPassword" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  </button>
                </div>
              </div>
              <p v-if="errors.password" id="activate-password-error" class="mt-1 text-sm text-red-600">
                {{ errors.password }}
              </p>

              <PasswordStrength :password="formData.password" />
            </div>

            <!-- Password confirmation -->
            <div class="base-input-wrapper">
              <label for="activate-password-confirmation" class="block text-sm font-medium text-gray-700 mb-1">
                Confirmar contraseña
                <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <input
                  id="activate-password-confirmation"
                  v-model="formData.password_confirmation"
                  :type="showPasswordConfirmation ? 'text' : 'password'"
                  :disabled="isSubmitting"
                  :class="inputClasses(errors.password_confirmation)"
                  :aria-invalid="errors.password_confirmation ? 'true' : 'false'"
                  :aria-describedby="errors.password_confirmation ? 'activate-password-confirmation-error' : undefined"
                  placeholder="Repite la contraseña"
                  autocomplete="new-password"
                  required
                />
                <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                  <button
                    type="button"
                    class="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                    :aria-label="showPasswordConfirmation ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                    :aria-pressed="showPasswordConfirmation"
                    @click="showPasswordConfirmation = !showPasswordConfirmation"
                  >
                    <svg v-if="showPasswordConfirmation" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  </button>
                </div>
              </div>
              <p v-if="errors.password_confirmation" id="activate-password-confirmation-error" class="mt-1 text-sm text-red-600">
                {{ errors.password_confirmation }}
              </p>
            </div>

            <!-- Submit -->
            <BaseButton
              type="submit"
              variant="primary"
              size="xl"
              :loading="isSubmitting"
              :disabled="isSubmitting"
              loading-text="Activando cuenta..."
              full-width
            >
              Activar mi cuenta
            </BaseButton>
          </form>

          <div class="mt-6 text-center">
            <router-link to="/login" class="text-sm text-gray-600 hover:text-gray-500">
              ← Volver a iniciar sesión
            </router-link>
          </div>
        </template>
      </div>

      <!-- Footer -->
      <div class="mt-8 text-center">
        <p class="text-xs text-gray-500">
          Al activar tu cuenta, aceptas nuestros
          <a href="#" class="text-primary-600 hover:text-primary-500">Términos de servicio</a>
          y
          <a href="#" class="text-primary-600 hover:text-primary-500">Política de privacidad</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authService } from '@/services/auth.service'
import { useToast } from '@/composables/useToast'
import PasswordStrength from '@/components/common/PasswordStrength.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const REDIRECT_DELAY = 4000
const INVALID_TOKEN_MESSAGE = 'El enlace de activación es inválido o ha expirado.'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const token = String(route.params.token || '')

const isVerifying = ref(true)
const isTokenValid = ref(false)
const verifyError = ref(INVALID_TOKEN_MESSAGE)

const userName = ref('')
const organizationName = ref('')

const formData = reactive({
  password: '',
  password_confirmation: ''
})

const errors = reactive({
  password: '',
  password_confirmation: ''
})

const showPassword = ref(false)
const showPasswordConfirmation = ref(false)
const isSubmitting = ref(false)
const submitError = ref('')
const isActivated = ref(false)
const successMessage = ref('')
const passwordInput = ref(null)

let redirectTimeout = null

const firstName = computed(() => userName.value.trim().split(/\s+/)[0] || '')

const inputClasses = (error) => [
  'input-field w-full pr-10',
  error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : '',
  isSubmitting.value ? 'bg-gray-100 cursor-not-allowed' : ''
].filter(Boolean).join(' ')

const clearErrors = () => {
  errors.password = ''
  errors.password_confirmation = ''
  submitError.value = ''
}

const validateForm = () => {
  clearErrors()

  if (!formData.password) {
    errors.password = 'La contraseña es requerida'
  } else if (formData.password.length < 8) {
    errors.password = 'La contraseña debe tener al menos 8 caracteres'
  }

  if (!formData.password_confirmation) {
    errors.password_confirmation = 'Debes confirmar tu contraseña'
  } else if (formData.password !== formData.password_confirmation) {
    errors.password_confirmation = 'Las contraseñas no coinciden'
  }

  return !errors.password && !errors.password_confirmation
}

const goToLogin = () => {
  if (redirectTimeout) {
    clearTimeout(redirectTimeout)
    redirectTimeout = null
  }
  router.push('/login')
}

const handleSubmit = async () => {
  if (isSubmitting.value) return

  if (!validateForm()) return

  isSubmitting.value = true

  try {
    const response = await authService.activateAccount({
      token,
      password: formData.password,
      password_confirmation: formData.password_confirmation
    })

    successMessage.value = response?.message || 'Tu cuenta ha sido activada. Ya puedes iniciar sesión.'
    isActivated.value = true
    toast.success('¡Cuenta activada exitosamente!')

    redirectTimeout = setTimeout(() => {
      router.push('/login')
    }, REDIRECT_DELAY)
  } catch (error) {
    submitError.value = error.message || 'No se pudo activar la cuenta. Inténtalo de nuevo.'
    toast.error('Error al activar la cuenta')

    const fieldErrors = error.data?.errors
    if (fieldErrors) {
      Object.keys(fieldErrors).forEach(field => {
        if (errors[field] !== undefined) {
          errors[field] = Array.isArray(fieldErrors[field])
            ? fieldErrors[field][0]
            : fieldErrors[field]
        }
      })
    }
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  if (!token) {
    verifyError.value = INVALID_TOKEN_MESSAGE
    isVerifying.value = false
    return
  }

  try {
    const data = await authService.verifyActivationToken(token)

    userName.value = data?.name || ''
    organizationName.value = data?.organization_name || ''
    isTokenValid.value = true

    await nextTick()
    passwordInput.value?.focus()
  } catch (error) {
    verifyError.value = error.message || INVALID_TOKEN_MESSAGE
    isTokenValid.value = false
  } finally {
    isVerifying.value = false
  }
})

onUnmounted(() => {
  if (redirectTimeout) {
    clearTimeout(redirectTimeout)
  }
})
</script>

<style scoped>
.base-input-wrapper {
  width: 100%;
}
</style>