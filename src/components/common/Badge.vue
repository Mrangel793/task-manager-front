<template>
  <span
    :class="[
      badgeClasses,
      sizeClasses,
      dotPosition === 'left' && hasDot ? 'pl-2' : '',
      dotPosition === 'right' && hasDot ? 'pr-2' : ''
    ]"
    class="inline-flex items-center font-medium rounded-full"
  >
    <span
      v-if="hasDot && dotPosition === 'left'"
      :class="dotClasses"
      class="flex-shrink-0 w-1.5 h-1.5 rounded-full mr-1.5"
    ></span>

    <slot>{{ text }}</slot>

    <span
      v-if="hasDot && dotPosition === 'right'"
      :class="dotClasses"
      class="flex-shrink-0 w-1.5 h-1.5 rounded-full ml-1.5"
    ></span>

    <button
      v-if="removable"
      @click="$emit('remove')"
      type="button"
      class="flex-shrink-0 ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center focus:outline-none"
      :class="removeButtonClasses"
    >
      <svg class="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
        <path stroke-linecap="round" stroke-width="1.5" d="M1 1l6 6m0-6L1 7" />
      </svg>
    </button>
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  text: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: 'gray',
    validator: (value) => ['success', 'warning', 'error', 'info', 'gray', 'blue', 'green', 'yellow', 'red', 'purple', 'pink'].includes(value)
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  variant: {
    type: String,
    default: 'light',
    validator: (value) => ['light', 'solid', 'outline'].includes(value)
  },
  dot: {
    type: Boolean,
    default: false
  },
  dotPosition: {
    type: String,
    default: 'left',
    validator: (value) => ['left', 'right'].includes(value)
  },
  removable: {
    type: Boolean,
    default: false
  }
})

defineEmits(['remove'])

const hasDot = computed(() => props.dot)

const sizeClasses = computed(() => {
  const sizes = {
    small: 'px-2 py-0.5 text-xs',
    medium: 'px-2.5 py-0.5 text-sm',
    large: 'px-3 py-1 text-base'
  }
  return sizes[props.size]
})

const colorMap = {
  success: 'green',
  warning: 'yellow',
  error: 'red',
  info: 'blue',
  gray: 'gray',
  blue: 'blue',
  green: 'green',
  yellow: 'yellow',
  red: 'red',
  purple: 'purple',
  pink: 'pink'
}

const badgeClasses = computed(() => {
  const color = colorMap[props.color] || props.color

  if (props.variant === 'solid') {
    const solidColors = {
      gray: 'bg-gray-600 text-white',
      blue: 'bg-blue-600 text-white',
      green: 'bg-green-600 text-white',
      yellow: 'bg-yellow-600 text-white',
      red: 'bg-red-600 text-white',
      purple: 'bg-purple-600 text-white',
      pink: 'bg-pink-600 text-white'
    }
    return solidColors[color] || solidColors.gray
  }

  if (props.variant === 'outline') {
    const outlineColors = {
      gray: 'border border-gray-300 text-gray-700',
      blue: 'border border-blue-300 text-blue-700',
      green: 'border border-green-300 text-green-700',
      yellow: 'border border-yellow-300 text-yellow-700',
      red: 'border border-red-300 text-red-700',
      purple: 'border border-purple-300 text-purple-700',
      pink: 'border border-pink-300 text-pink-700'
    }
    return outlineColors[color] || outlineColors.gray
  }

  // Light variant (default)
  const lightColors = {
    gray: 'bg-gray-100 text-gray-800',
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800',
    purple: 'bg-purple-100 text-purple-800',
    pink: 'bg-pink-100 text-pink-800'
  }
  return lightColors[color] || lightColors.gray
})

const dotClasses = computed(() => {
  const color = colorMap[props.color] || props.color

  const dotColors = {
    gray: 'bg-gray-400',
    blue: 'bg-blue-400',
    green: 'bg-green-400',
    yellow: 'bg-yellow-400',
    red: 'bg-red-400',
    purple: 'bg-purple-400',
    pink: 'bg-pink-400'
  }
  return dotColors[color] || dotColors.gray
})

const removeButtonClasses = computed(() => {
  const color = colorMap[props.color] || props.color

  if (props.variant === 'solid') {
    return 'text-white hover:bg-white/20'
  }

  const removeColors = {
    gray: 'text-gray-400 hover:bg-gray-200 hover:text-gray-500',
    blue: 'text-blue-400 hover:bg-blue-200 hover:text-blue-500',
    green: 'text-green-400 hover:bg-green-200 hover:text-green-500',
    yellow: 'text-yellow-400 hover:bg-yellow-200 hover:text-yellow-500',
    red: 'text-red-400 hover:bg-red-200 hover:text-red-500',
    purple: 'text-purple-400 hover:bg-purple-200 hover:text-purple-500',
    pink: 'text-pink-400 hover:bg-pink-200 hover:text-pink-500'
  }
  return removeColors[color] || removeColors.gray
})
</script>
