<template>
  <div class="verification-code-input">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-3 text-center">
      {{ label }}
    </label>
    <div class="flex justify-center gap-2 sm:gap-3">
      <input
        v-for="(digit, index) in digits"
        :key="index"
        :ref="el => inputRefs[index] = el"
        v-model="digits[index]"
        type="text"
        inputmode="numeric"
        maxlength="1"
        :class="inputClasses"
        :disabled="disabled"
        @input="handleInput(index, $event)"
        @keydown="handleKeyDown(index, $event)"
        @paste="handlePaste"
        @focus="handleFocus(index)"
      />
    </div>
    <p v-if="errorMessage" class="mt-2 text-sm text-red-600 text-center">
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  length: {
    type: Number,
    default: 6
  },
  label: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  autoFocus: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'complete'])

const digits = reactive(Array(props.length).fill(''))
const inputRefs = ref([])

const errorMessage = computed(() => props.error)

const inputClasses = computed(() => {
  const baseClasses = 'w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors'
  const errorClasses = errorMessage.value
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
  const disabledClasses = props.disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'

  return `${baseClasses} ${errorClasses} ${disabledClasses}`
})

const handleInput = (index, event) => {
  const value = event.target.value

  // Solo permitir números
  if (value && !/^\d$/.test(value)) {
    digits[index] = ''
    return
  }

  digits[index] = value

  // Auto-focus al siguiente input
  if (value && index < props.length - 1) {
    inputRefs.value[index + 1]?.focus()
  }

  // Emitir el código completo
  const code = digits.join('')
  emit('update:modelValue', code)

  // Emitir evento de completado si todos los dígitos están llenos
  if (code.length === props.length) {
    emit('complete', code)
  }
}

const handleKeyDown = (index, event) => {
  // Backspace: limpiar el campo actual o ir al anterior
  if (event.key === 'Backspace') {
    if (!digits[index] && index > 0) {
      inputRefs.value[index - 1]?.focus()
    }
    digits[index] = ''
    emit('update:modelValue', digits.join(''))
  }

  // Flecha izquierda
  if (event.key === 'ArrowLeft' && index > 0) {
    inputRefs.value[index - 1]?.focus()
  }

  // Flecha derecha
  if (event.key === 'ArrowRight' && index < props.length - 1) {
    inputRefs.value[index + 1]?.focus()
  }
}

const handlePaste = (event) => {
  event.preventDefault()
  const pastedData = event.clipboardData.getData('text').trim()

  // Solo permitir números
  if (!/^\d+$/.test(pastedData)) {
    return
  }

  // Llenar los dígitos con los datos pegados
  const pastedDigits = pastedData.slice(0, props.length).split('')
  pastedDigits.forEach((digit, index) => {
    if (index < props.length) {
      digits[index] = digit
    }
  })

  // Focus al último dígito llenado o al siguiente vacío
  const lastFilledIndex = Math.min(pastedDigits.length - 1, props.length - 1)
  inputRefs.value[lastFilledIndex]?.focus()

  const code = digits.join('')
  emit('update:modelValue', code)

  if (code.length === props.length) {
    emit('complete', code)
  }
}

const handleFocus = (index) => {
  // Seleccionar el contenido al hacer focus
  inputRefs.value[index]?.select()
}

const clear = () => {
  digits.fill('')
  emit('update:modelValue', '')
  inputRefs.value[0]?.focus()
}

const focus = () => {
  // Encontrar el primer input vacío o el primero
  const emptyIndex = digits.findIndex(d => !d)
  const focusIndex = emptyIndex >= 0 ? emptyIndex : 0
  inputRefs.value[focusIndex]?.focus()
}

// Inicializar con el valor del modelo
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    const codeDigits = newValue.slice(0, props.length).split('')
    codeDigits.forEach((digit, index) => {
      if (index < props.length && /^\d$/.test(digit)) {
        digits[index] = digit
      }
    })
  }
}, { immediate: true })

// Auto-focus en el primer input al montar
onMounted(() => {
  if (props.autoFocus) {
    inputRefs.value[0]?.focus()
  }
})

defineExpose({
  clear,
  focus
})
</script>

<style scoped>
.verification-code-input {
  width: 100%;
}

/* Ocultar spinners en inputs de número */
input[type="text"]::-webkit-outer-spin-button,
input[type="text"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="text"] {
  -moz-appearance: textfield;
}
</style>
