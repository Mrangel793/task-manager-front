<template>
  <div v-if="password" class="password-strength mt-2">
    <div class="flex items-center justify-between mb-1">
      <span class="text-sm font-medium text-gray-700">Fuerza de contraseña:</span>
      <span :class="strengthLabelClass" class="text-sm font-semibold">
        {{ strengthData.label }}
      </span>
    </div>
    <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <div
        :class="strengthBarClass"
        :style="{ width: strengthPercentage }"
        class="h-full transition-all duration-300 rounded-full"
      ></div>
    </div>
    <ul class="mt-2 space-y-1">
      <li :class="checks.length ? 'text-green-600' : 'text-gray-400'" class="text-xs flex items-center gap-1">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path v-if="checks.length" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          <path v-else fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        Mínimo 8 caracteres
      </li>
      <li :class="checks.lowercase ? 'text-green-600' : 'text-gray-400'" class="text-xs flex items-center gap-1">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path v-if="checks.lowercase" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          <path v-else fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        Una letra minúscula
      </li>
      <li :class="checks.uppercase ? 'text-green-600' : 'text-gray-400'" class="text-xs flex items-center gap-1">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path v-if="checks.uppercase" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          <path v-else fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        Una letra mayúscula
      </li>
      <li :class="checks.number ? 'text-green-600' : 'text-gray-400'" class="text-xs flex items-center gap-1">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path v-if="checks.number" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          <path v-else fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        Un número
      </li>
      <li :class="checks.special ? 'text-green-600' : 'text-gray-400'" class="text-xs flex items-center gap-1">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path v-if="checks.special" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          <path v-else fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        Un carácter especial (opcional)
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getPasswordStrength } from '@/utils/validationSchemas'

const props = defineProps({
  password: {
    type: String,
    default: ''
  }
})

const checks = computed(() => ({
  length: props.password.length >= 8,
  lowercase: /[a-z]/.test(props.password),
  uppercase: /[A-Z]/.test(props.password),
  number: /\d/.test(props.password),
  special: /[!@#$%^&*(),.?":{}|<>]/.test(props.password)
}))

const strengthData = computed(() => getPasswordStrength(props.password))

const strengthPercentage = computed(() => {
  return `${(strengthData.value.strength / 4) * 100}%`
})

const strengthBarClass = computed(() => {
  const colorMap = {
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500'
  }
  return colorMap[strengthData.value.color] || 'bg-gray-300'
})

const strengthLabelClass = computed(() => {
  const colorMap = {
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    blue: 'text-blue-600',
    green: 'text-green-600'
  }
  return colorMap[strengthData.value.color] || 'text-gray-600'
})
</script>

<style scoped>
.password-strength {
  width: 100%;
}
</style>
