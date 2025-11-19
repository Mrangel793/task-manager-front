<template>
  <div
    :class="[
      sizeClasses,
      rounded ? 'rounded-full' : 'rounded-lg',
      bordered ? 'ring-2 ring-white' : ''
    ]"
    class="flex-shrink-0 flex items-center justify-center font-semibold overflow-hidden"
    :style="{ backgroundColor: bgColor, color: textColor }"
  >
    <!-- Image avatar -->
    <img
      v-if="imageSrc"
      :src="imageSrc"
      :alt="altText"
      class="w-full h-full object-cover"
      @error="handleImageError"
    >

    <!-- Initials -->
    <span v-else :class="textSizeClass">
      {{ initials }}
    </span>

    <!-- Status indicator -->
    <span
      v-if="status"
      :class="[
        statusSizeClass,
        statusColorClass,
        rounded ? 'rounded-full' : 'rounded'
      ]"
      class="absolute bottom-0 right-0 block ring-2 ring-white"
    ></span>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  user: {
    type: Object,
    default: null
  },
  name: {
    type: String,
    default: ''
  },
  src: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['xs', 'small', 'medium', 'large', 'xl', '2xl'].includes(value)
  },
  rounded: {
    type: Boolean,
    default: true
  },
  bordered: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    default: '',
    validator: (value) => !value || ['online', 'offline', 'busy', 'away'].includes(value)
  }
})

const imageError = ref(false)

const userName = computed(() => {
  return props.user?.name || props.name || 'Usuario'
})

const imageSrc = computed(() => {
  if (imageError.value) return null
  return props.src || props.user?.avatar || props.user?.photo || null
})

const altText = computed(() => {
  return `Avatar de ${userName.value}`
})

const initials = computed(() => {
  const name = userName.value.trim()
  const words = name.split(' ')

  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase()
  }

  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
})

// Generate consistent color based on name hash
const bgColor = computed(() => {
  if (imageSrc.value) return 'transparent'

  const colors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // yellow
    '#EF4444', // red
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#6366F1', // indigo
    '#14B8A6', // teal
    '#F97316', // orange
    '#06B6D4'  // cyan
  ]

  // Simple hash function
  let hash = 0
  for (let i = 0; i < userName.value.length; i++) {
    hash = userName.value.charCodeAt(i) + ((hash << 5) - hash)
    hash = hash & hash
  }

  return colors[Math.abs(hash) % colors.length]
})

const textColor = computed(() => {
  return imageSrc.value ? 'inherit' : '#FFFFFF'
})

const sizeClasses = computed(() => {
  const sizes = {
    xs: 'w-6 h-6',
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20'
  }
  return sizes[props.size]
})

const textSizeClass = computed(() => {
  const sizes = {
    xs: 'text-xs',
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
    xl: 'text-xl',
    '2xl': 'text-2xl'
  }
  return sizes[props.size]
})

const statusSizeClass = computed(() => {
  const sizes = {
    xs: 'w-1.5 h-1.5',
    small: 'w-2 h-2',
    medium: 'w-2.5 h-2.5',
    large: 'w-3 h-3',
    xl: 'w-3.5 h-3.5',
    '2xl': 'w-4 h-4'
  }
  return sizes[props.size]
})

const statusColorClass = computed(() => {
  const colors = {
    online: 'bg-green-400',
    offline: 'bg-gray-400',
    busy: 'bg-red-400',
    away: 'bg-yellow-400'
  }
  return colors[props.status] || ''
})

const handleImageError = () => {
  imageError.value = true
}
</script>

<style scoped>
.relative {
  position: relative;
}
</style>
