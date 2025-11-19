<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 mb-4">
            <svg class="h-8 w-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 class="text-3xl font-bold text-gray-900">Verificación</h2>
          <p class="mt-2 text-sm text-gray-600">
            Ingresa el código de 6 dígitos que enviamos a
          </p>
          <p class="mt-1 text-base font-medium text-gray-900">{{ formattedPhone }}</p>
        </div>

        <!-- Código de desarrollo (solo visible en modo dev) -->
        <div v-if="devCode" class="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-yellow-800">
                Modo desarrollo
              </p>
              <p class="text-xs text-yellow-700 mt-1">
                Código: <span class="font-bold">{{ devCode }}</span>
              </p>
            </div>
          </div>
        </div>

        <!-- Error message -->
        <div v-if="submitError" class="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p class="text-sm">{{ submitError }}</p>
        </div>

        <!-- Verification Code Input -->
        <div class="mb-6">
          <VerificationCodeInput
            v-model="verificationCode"
            label="Código de verificación"
            :error="codeError"
            :disabled="isSubmitting"
            @complete="handleCodeComplete"
          />
        </div>

        <!-- Verify Button -->
        <BaseButton
          variant="primary"
          size="xl"
          :loading="isSubmitting"
          loading-text="Verificando..."
          full-width
          @click="handleVerify"
        >
          Verificar código
        </BaseButton>

        <!-- Resend Code -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            ¿No recibiste el código?
          </p>
          <button
            v-if="!isResending && canResend"
            @click="handleResendCode"
            class="mt-2 text-sm font-medium text-primary-600 hover:text-primary-500 focus:outline-none focus:underline"
          >
            Reenviar código
          </button>
          <p v-else-if="!canResend" class="mt-2 text-sm text-gray-500">
            Puedes reenviar el código en {{ resendCountdown }}s
          </p>
          <p v-else-if="isResending" class="mt-2 text-sm text-gray-500">
            Reenviando...
          </p>
        </div>

        <!-- Back to Register -->
        <div class="mt-6 text-center">
          <router-link
            to="/register"
            class="text-sm text-gray-600 hover:text-gray-500"
          >
            ← Volver al registro
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores'
import { useToast } from '@/composables/useToast'
import VerificationCodeInput from '@/components/auth/VerificationCodeInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const toast = useToast()

const verificationCode = ref('')
const codeError = ref('')
const isSubmitting = ref(false)
const submitError = ref('')
const isResending = ref(false)
const canResend = ref(false)
const resendCountdown = ref(60)

let countdownInterval = null

// Obtener datos del query params
const phone = ref(route.query.phone || '')
const devCode = ref(route.query.code || '') // Solo en desarrollo

const formattedPhone = computed(() => {
  if (!phone.value) return ''
  // Formatear el teléfono para mostrarlo: +57 300 123 4567
  const cleaned = phone.value.replace(/\D/g, '')
  if (cleaned.startsWith('57') && cleaned.length === 12) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`
  }
  return phone.value
})

const startResendCountdown = () => {
  canResend.value = false
  resendCountdown.value = 60

  countdownInterval = setInterval(() => {
    resendCountdown.value--
    if (resendCountdown.value <= 0) {
      canResend.value = true
      clearInterval(countdownInterval)
    }
  }, 1000)
}

const handleCodeComplete = (code) => {
  // Auto-verificar cuando se complete el código
  if (code.length === 6) {
    handleVerify()
  }
}

const handleVerify = async () => {
  codeError.value = ''
  submitError.value = ''

  if (!verificationCode.value || verificationCode.value.length !== 6) {
    codeError.value = 'Ingresa el código de 6 dígitos'
    return
  }

  if (!phone.value) {
    submitError.value = 'Información de verificación incompleta. Por favor, regístrate nuevamente.'
    return
  }

  isSubmitting.value = true

  try {
    await authStore.verifyCode({
      phone: phone.value,
      code: verificationCode.value
    })

    toast.success('¡Cuenta verificada exitosamente!')
    router.push('/tasks')
  } catch (error) {
    submitError.value = error.message || 'Código de verificación inválido'
    codeError.value = 'Código incorrecto'
    toast.error('Error al verificar el código')
  } finally {
    isSubmitting.value = false
  }
}

const handleResendCode = async () => {
  if (!canResend.value || isResending.value) return

  isResending.value = true
  submitError.value = ''

  try {
    const response = await authStore.resendCode(phone.value)

    // En desarrollo, actualizar el código mostrado
    if (response.verification_code) {
      devCode.value = response.verification_code
    }

    toast.success('Código reenviado exitosamente')
    startResendCountdown()
  } catch (error) {
    submitError.value = error.message || 'Error al reenviar el código'
    toast.error('Error al reenviar el código')
  } finally {
    isResending.value = false
  }
}

onMounted(() => {
  // Validar que tenemos el teléfono
  if (!phone.value) {
    toast.error('Información de verificación no disponible')
    router.push('/register')
    return
  }

  // Iniciar countdown para reenvío
  startResendCountdown()
})

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
