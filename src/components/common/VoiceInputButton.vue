<template>
  <div class="relative inline-block">
    <!-- Botón de micrófono -->
    <button
      type="button"
      @click="handleToggle"
      :disabled="disabled || !isSupported"
      :title="getTooltip"
      class="voice-button"
      :class="[
        {
          'listening': isListening,
          'not-supported': !isSupported,
          'disabled': disabled
        },
        sizeClass
      ]"
    >
      <!-- Ícono de micrófono -->
      <svg
        v-if="!isListening"
        :class="iconSizeClass"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
        />
      </svg>

      <!-- Ícono de stop (cuando está escuchando) -->
      <svg
        v-else
        :class="iconSizeClass"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
        />
      </svg>

      <!-- Animación de ondas cuando está escuchando -->
      <span v-if="isListening" class="listening-wave"></span>
    </button>

    <!-- Mensaje de estado -->
    <div v-if="showStatus" class="absolute left-0 right-0 mt-1 text-xs">
      <p v-if="isListening" class="text-blue-600 font-medium">
        🎤 Escuchando...
      </p>
      <p v-else-if="error" class="text-red-600">
        {{ error }}
      </p>
      <p v-else-if="transcript" class="text-green-600">
        ✓ Texto capturado
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useSpeechRecognition } from '@/composables/useSpeechRecognition'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: ''
  },
  showStatus: {
    type: Boolean,
    default: true
  },
  // Si es true, agrega al texto existente. Si es false, reemplaza
  append: {
    type: Boolean,
    default: false
  },
  // Tamaño del botón: 'small' | 'medium' | 'large'
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  }
})

const emit = defineEmits(['update:modelValue', 'statusChange'])

const {
  isListening,
  isSupported,
  transcript,
  error,
  start,
  stop,
  reset
} = useSpeechRecognition()

const sizeClass = computed(() => {
  const sizes = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-12 h-12'
  }
  return sizes[props.size]
})

const iconSizeClass = computed(() => {
  const sizes = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6'
  }
  return sizes[props.size]
})

const getTooltip = computed(() => {
  if (!isSupported.value) {
    return 'Reconocimiento de voz no soportado en este navegador'
  }
  if (props.disabled) {
    return 'Entrada de voz deshabilitada'
  }
  if (isListening.value) {
    return 'Clic para detener'
  }
  return 'Clic para hablar'
})

const handleToggle = () => {
  if (isListening.value) {
    stop()
  } else {
    reset()
    start()
  }
}

// Cuando se captura texto, actualizar el modelo
watch(transcript, (newTranscript) => {
  if (newTranscript) {
    let finalText = newTranscript.trim()

    // Capitalizar la primera letra
    if (finalText) {
      finalText = finalText.charAt(0).toUpperCase() + finalText.slice(1)
    }

    if (props.append && props.modelValue) {
      // Agregar al texto existente
      const separator = props.modelValue.endsWith('.') || props.modelValue.endsWith('!') || props.modelValue.endsWith('?') ? ' ' : '. '
      emit('update:modelValue', props.modelValue + separator + finalText)
    } else {
      // Reemplazar el texto
      emit('update:modelValue', finalText)
    }
  }
})

// Emitir eventos de estado
watch(isListening, (listening) => {
  if (listening) {
    emit('statusChange', { status: 'listening', message: '🎤 Escuchando...' })
  } else if (transcript.value) {
    emit('statusChange', { status: 'success', message: '✓ Texto capturado' })
    setTimeout(() => {
      reset()
      emit('statusChange', { status: 'idle', message: '' })
    }, 2000)
  }
})

watch(error, (err) => {
  if (err) {
    emit('statusChange', { status: 'error', message: err })
  }
})
</script>

<style scoped>
.voice-button {
  @apply relative flex items-center justify-center rounded-full transition-all duration-200;
  @apply bg-transparent text-gray-400 hover:bg-gray-100 hover:text-gray-600;
  @apply focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400;
}

.voice-button.listening {
  @apply bg-red-500 text-white hover:bg-red-600;
  animation: pulse 1.5s ease-in-out infinite;
}

.voice-button.not-supported {
  @apply bg-gray-100 text-gray-300 cursor-not-allowed;
}

.voice-button.disabled {
  @apply bg-gray-50 text-gray-300 cursor-not-allowed opacity-50;
}

.listening-wave {
  @apply absolute inset-0 rounded-full border-2 border-red-400;
  animation: wave 1.5s ease-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes wave {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}
</style>
