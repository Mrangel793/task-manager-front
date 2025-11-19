<template>
  <div class="w-full flex flex-col items-center">
    <!-- Title -->
    <h3 v-if="title" class="text-sm font-medium text-gray-700 mb-4">{{ title }}</h3>

    <div class="flex flex-col md:flex-row items-center gap-8 w-full">
      <!-- Chart -->
      <div class="relative flex-shrink-0" :style="{ width: size + 'px', height: size + 'px' }">
        <svg
          :width="size"
          :height="size"
          :viewBox="`0 0 ${viewBoxSize} ${viewBoxSize}`"
          class="transform -rotate-90"
        >
          <!-- Background circle -->
          <circle
            :cx="center"
            :cy="center"
            :r="radius"
            fill="none"
            stroke="#E5E7EB"
            :stroke-width="strokeWidth"
          />

          <!-- Data segments -->
          <circle
            v-for="(segment, index) in segments"
            :key="index"
            :cx="center"
            :cy="center"
            :r="radius"
            fill="none"
            :stroke="segment.color"
            :stroke-width="strokeWidth"
            :stroke-dasharray="`${segment.length} ${circumference - segment.length}`"
            :stroke-dashoffset="-segment.offset"
            class="transition-all duration-300 cursor-pointer"
            :class="{ 'opacity-80': hoveredIndex !== null && hoveredIndex !== index }"
            @mouseenter="hoveredIndex = index"
            @mouseleave="hoveredIndex = null"
          />

          <!-- Inner circle for doughnut effect -->
          <circle
            :cx="center"
            :cy="center"
            :r="innerRadius"
            fill="white"
          />
        </svg>

        <!-- Center text -->
        <div
          v-if="showTotal"
          class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        >
          <div class="text-3xl font-bold text-gray-900">{{ totalValue }}</div>
          <div class="text-sm text-gray-600">{{ totalLabel }}</div>
        </div>

        <!-- Hover tooltip -->
        <div
          v-if="hoveredIndex !== null"
          class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900 text-white text-sm rounded shadow-lg whitespace-nowrap pointer-events-none z-10"
        >
          {{ labels[hoveredIndex] }}: {{ chartData[hoveredIndex] }} ({{ percentages[hoveredIndex] }}%)
        </div>
      </div>

      <!-- Legend -->
      <div class="flex-1 space-y-2">
        <div
          v-for="(label, index) in labels"
          :key="index"
          class="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors cursor-pointer"
          :class="{ 'bg-gray-50': hoveredIndex === index }"
          @mouseenter="hoveredIndex = index"
          @mouseleave="hoveredIndex = null"
        >
          <div class="flex items-center gap-2 flex-1 min-w-0">
            <div
              class="w-3 h-3 rounded-full flex-shrink-0"
              :style="{ backgroundColor: getColor(index) }"
            ></div>
            <span class="text-sm text-gray-700 truncate" :title="label">{{ label }}</span>
          </div>
          <div class="flex items-center gap-3 flex-shrink-0 ml-2">
            <span class="text-sm font-medium text-gray-900">{{ chartData[index] }}</span>
            <span class="text-xs text-gray-500 w-12 text-right">{{ percentages[index] }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    required: true,
    validator: (value) => value.every(item => typeof item === 'number')
  },
  labels: {
    type: Array,
    required: true
  },
  colors: {
    type: Array,
    default: () => ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']
  },
  title: {
    type: String,
    default: ''
  },
  size: {
    type: Number,
    default: 240
  },
  thickness: {
    type: Number,
    default: 0.3,
    validator: (value) => value > 0 && value < 1
  },
  showTotal: {
    type: Boolean,
    default: true
  },
  totalLabel: {
    type: String,
    default: 'Total'
  }
})

const hoveredIndex = ref(null)

const viewBoxSize = 100
const center = viewBoxSize / 2
const radius = (viewBoxSize - 10) / 2
const strokeWidth = computed(() => radius * props.thickness * 2)
const innerRadius = computed(() => radius - strokeWidth.value)
const circumference = 2 * Math.PI * radius

const chartData = computed(() => props.data)

const totalValue = computed(() => {
  return chartData.value.reduce((sum, val) => sum + val, 0)
})

const percentages = computed(() => {
  const total = totalValue.value
  if (total === 0) return chartData.value.map(() => 0)

  return chartData.value.map(value => {
    return Math.round((value / total) * 100)
  })
})

const segments = computed(() => {
  const total = totalValue.value
  if (total === 0) return []

  let currentOffset = 0
  return chartData.value.map((value, index) => {
    const percentage = value / total
    const length = circumference * percentage
    const offset = currentOffset

    currentOffset += length

    return {
      length,
      offset,
      color: getColor(index)
    }
  })
})

const getColor = (index) => {
  return props.colors[index % props.colors.length]
}
</script>
