<template>
  <div
    class="bg-white rounded-lg shadow p-6 transition-all"
    :class="{ 'hover:shadow-lg cursor-pointer': clickable }"
    @click="clickable && $emit('click')"
  >
    <div class="flex items-center">
      <!-- Icon -->
      <div
        v-if="icon || $slots.icon"
        class="flex-shrink-0 rounded-lg p-3"
        :class="iconBgClass"
      >
        <slot name="icon">
          <svg
            class="w-6 h-6"
            :class="iconColorClass"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              :d="iconPath"
            />
          </svg>
        </slot>
      </div>

      <!-- Content -->
      <div class="ml-4 flex-1">
        <p class="text-sm font-medium text-gray-600">{{ title }}</p>

        <div class="flex items-baseline">
          <p class="text-2xl font-bold text-gray-900">
            <slot name="value">{{ formattedValue }}</slot>
          </p>

          <!-- Trend indicator -->
          <div v-if="trend" class="ml-2 flex items-center text-sm font-medium" :class="trendColorClass">
            <svg
              class="w-4 h-4 mr-0.5"
              :class="trendDirection === 'up' ? '' : 'rotate-180'"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                clip-rule="evenodd"
              />
            </svg>
            <span>{{ Math.abs(trend) }}%</span>
          </div>
        </div>

        <!-- Subtitle -->
        <p v-if="subtitle || $slots.subtitle" class="mt-1 text-xs text-gray-500">
          <slot name="subtitle">{{ subtitle }}</slot>
        </p>
      </div>
    </div>

    <!-- Footer slot -->
    <div v-if="$slots.footer" class="mt-4 pt-4 border-t border-gray-200">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: '',
    validator: (value) => !value || ['users', 'tasks', 'check', 'clock', 'chart', 'folder', 'star', 'alert'].includes(value)
  },
  color: {
    type: String,
    default: 'blue',
    validator: (value) => ['blue', 'green', 'yellow', 'red', 'purple', 'pink', 'gray'].includes(value)
  },
  trend: {
    type: Number,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  clickable: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])

const formattedValue = computed(() => {
  if (props.loading) return '...'
  if (typeof props.value === 'number') {
    return props.value.toLocaleString()
  }
  return props.value
})

const trendDirection = computed(() => {
  return props.trend >= 0 ? 'up' : 'down'
})

const trendColorClass = computed(() => {
  return trendDirection.value === 'up' ? 'text-green-600' : 'text-red-600'
})

const iconBgClass = computed(() => {
  const classes = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    yellow: 'bg-yellow-100',
    red: 'bg-red-100',
    purple: 'bg-purple-100',
    pink: 'bg-pink-100',
    gray: 'bg-gray-100'
  }
  return classes[props.color] || classes.blue
})

const iconColorClass = computed(() => {
  const classes = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
    purple: 'text-purple-600',
    pink: 'text-pink-600',
    gray: 'text-gray-600'
  }
  return classes[props.color] || classes.blue
})

const iconPath = computed(() => {
  const icons = {
    users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    tasks: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    check: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    chart: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    folder: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
    star: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
    alert: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
  }
  return icons[props.icon] || icons.chart
})
</script>
