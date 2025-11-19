<template>
  <div class="text-center py-12">
    <svg
      class="mx-auto text-gray-400"
      :class="iconSizeClass"
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

    <h3 class="mt-4 text-lg font-medium text-gray-900">{{ title }}</h3>

    <p v-if="message" class="mt-2 text-sm text-gray-500 max-w-md mx-auto">
      {{ message }}
    </p>

    <div v-if="actionText && (actionLink || hasActionSlot)" class="mt-6">
      <router-link
        v-if="actionLink"
        :to="actionLink"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        {{ actionText }}
      </router-link>

      <button
        v-else-if="hasActionSlot"
        @click="$emit('action')"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        {{ actionText }}
      </button>
    </div>

    <slot name="action"></slot>
  </div>
</template>

<script setup>
import { computed, useSlots } from 'vue'

const props = defineProps({
  icon: {
    type: String,
    default: 'clipboard',
    validator: (value) => ['clipboard', 'folder', 'users', 'bell', 'search', 'inbox', 'calendar'].includes(value)
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    default: ''
  },
  actionText: {
    type: String,
    default: ''
  },
  actionLink: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'large',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  }
})

defineEmits(['action'])

const slots = useSlots()
const hasActionSlot = computed(() => !!slots.action)

const iconSizeClass = computed(() => {
  const sizes = {
    small: 'h-16 w-16',
    medium: 'h-20 w-20',
    large: 'h-24 w-24'
  }
  return sizes[props.size] || sizes.large
})

const iconPath = computed(() => {
  const icons = {
    clipboard: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    folder: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
    users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    bell: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
    search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    inbox: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4',
    calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
  }
  return icons[props.icon] || icons.clipboard
})
</script>
