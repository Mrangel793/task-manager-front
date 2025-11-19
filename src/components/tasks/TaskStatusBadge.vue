<template>
  <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium" :class="statusConfig.badgeClass">
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="statusConfig.icon" />
    </svg>
    <span>{{ statusConfig.label }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getStatusConfig } from '@/utils/taskHelpers'

const props = defineProps({
  status: {
    type: String,
    required: true
  }
})

const statusConfig = computed(() => getStatusConfig(props.status))
</script>
