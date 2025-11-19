<template>
  <!-- Overlay variant (full screen) -->
  <div
    v-if="overlay"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    @click.self="dismissible && $emit('dismiss')"
  >
    <div class="bg-white rounded-lg p-6 flex flex-col items-center">
      <div :class="spinnerSizeClass" class="animate-spin rounded-full border-b-2 border-primary-600"></div>
      <p v-if="text" class="mt-4 text-sm text-gray-600">{{ text }}</p>
    </div>
  </div>

  <!-- Inline variant -->
  <div v-else :class="containerClasses">
    <div :class="spinnerSizeClass" class="animate-spin rounded-full border-b-2 border-primary-600"></div>
    <p v-if="text" :class="textSizeClass" class="text-gray-600">{{ text }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large', 'xlarge'].includes(value)
  },
  text: {
    type: String,
    default: ''
  },
  overlay: {
    type: Boolean,
    default: false
  },
  dismissible: {
    type: Boolean,
    default: false
  },
  center: {
    type: Boolean,
    default: true
  }
})

defineEmits(['dismiss'])

const spinnerSizeClass = computed(() => {
  const sizes = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
    xlarge: 'h-16 w-16'
  }
  return sizes[props.size]
})

const textSizeClass = computed(() => {
  const sizes = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
    xlarge: 'text-lg'
  }
  return sizes[props.size]
})

const containerClasses = computed(() => {
  const classes = ['flex items-center gap-3']

  if (props.center) {
    classes.push('justify-center')
  }

  if (props.text) {
    classes.push('flex-col sm:flex-row')
  }

  return classes.join(' ')
})
</script>
