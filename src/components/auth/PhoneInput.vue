<template>
  <div class="phone-input-wrapper">
    <label v-if="label" :for="id" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="relative">
      <input
        :id="id"
        ref="inputRef"
        v-model="formattedValue"
        type="tel"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="inputClasses"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      />
      <div v-if="showCheck && isValid" class="absolute inset-y-0 right-0 flex items-center pr-3">
        <svg class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>
    <p v-if="errorMessage" class="mt-1 text-sm text-red-600">
      {{ errorMessage }}
    </p>
    <p v-else-if="hint" class="mt-1 text-sm text-gray-500">
      {{ hint }}
    </p>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '+57 300 123 4567'
  },
  error: {
    type: String,
    default: ''
  },
  hint: {
    type: String,
    default: 'Formato: +57 XXX XXX XXXX'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  showCheck: {
    type: Boolean,
    default: true
  },
  id: {
    type: String,
    default: () => `phone-input-${Math.random().toString(36).substr(2, 9)}`
  }
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

const inputRef = ref(null)
const formattedValue = ref('')
const isFocused = ref(false)

// Formatear número de teléfono colombiano
const formatPhoneNumber = (value) => {
  // Remover todo excepto números
  const cleaned = value.replace(/\D/g, '')

  // Si comienza con 57, es el código de Colombia
  let numbers = cleaned
  if (cleaned.startsWith('57')) {
    numbers = cleaned.substring(2)
  }

  // Formatear: +57 XXX XXX XXXX
  if (numbers.length === 0) {
    return ''
  } else if (numbers.length <= 3) {
    return `+57 ${numbers}`
  } else if (numbers.length <= 6) {
    return `+57 ${numbers.slice(0, 3)} ${numbers.slice(3)}`
  } else {
    return `+57 ${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(6, 10)}`
  }
}

// Convertir a formato E.164
const toE164 = (value) => {
  const cleaned = value.replace(/\D/g, '')

  if (cleaned.startsWith('57')) {
    return `+${cleaned.slice(0, 12)}`
  } else if (cleaned.length === 10) {
    return `+57${cleaned}`
  }

  return cleaned ? `+${cleaned}` : ''
}

// Validar formato E.164 colombiano
const validateE164 = (value) => {
  // Formato E.164 para Colombia: +57XXXXXXXXXX (12 caracteres)
  const e164Regex = /^\+57[3][0-9]{9}$/
  return e164Regex.test(value)
}

const isValid = computed(() => {
  const e164Value = toE164(formattedValue.value)
  return validateE164(e164Value)
})

const errorMessage = computed(() => {
  if (props.error) return props.error
  if (isFocused.value || !formattedValue.value) return ''
  if (!isValid.value && formattedValue.value) {
    return 'Número de teléfono inválido'
  }
  return ''
})

const inputClasses = computed(() => {
  const baseClasses = 'input-field w-full'
  const errorClasses = errorMessage.value ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
  const validClasses = isValid.value && !errorMessage.value ? 'border-green-500 focus:ring-green-500 focus:border-green-500' : ''
  const disabledClasses = props.disabled ? 'bg-gray-100 cursor-not-allowed' : ''

  return `${baseClasses} ${errorClasses} ${validClasses} ${disabledClasses}`
})

const handleInput = (event) => {
  const formatted = formatPhoneNumber(event.target.value)
  formattedValue.value = formatted

  // Emitir el valor en formato E.164
  const e164Value = toE164(formatted)
  emit('update:modelValue', e164Value)
}

const handleBlur = () => {
  isFocused.value = false
  emit('blur')
}

const handleFocus = () => {
  isFocused.value = true
  emit('focus')
}

// Inicializar con el valor del modelo
watch(() => props.modelValue, (newValue) => {
  if (newValue && newValue !== toE164(formattedValue.value)) {
    formattedValue.value = formatPhoneNumber(newValue)
  }
}, { immediate: true })
</script>

<style scoped>
.phone-input-wrapper {
  width: 100%;
}
</style>
