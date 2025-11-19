<template>
  <div class="w-full">
    <!-- Title -->
    <h3 v-if="title" class="text-sm font-medium text-gray-700 mb-4">{{ title }}</h3>

    <!-- Chart -->
    <div class="relative" :style="{ height: height + 'px' }">
      <!-- Y-axis labels -->
      <div class="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 pr-2">
        <span v-for="(tick, index) in yAxisTicks" :key="index">
          {{ formatValue(tick) }}
        </span>
      </div>

      <!-- Bars container -->
      <div class="absolute left-12 right-0 top-0 bottom-8 flex items-end justify-around gap-2">
        <div
          v-for="(value, index) in chartData"
          :key="index"
          class="flex-1 flex flex-col items-center group"
        >
          <!-- Bar -->
          <div
            class="w-full rounded-t-lg transition-all duration-300 cursor-pointer relative"
            :style="{
              height: getBarHeight(value) + '%',
              backgroundColor: getBarColor(index),
              minHeight: value > 0 ? '4px' : '0'
            }"
            @mouseenter="hoveredIndex = index"
            @mouseleave="hoveredIndex = null"
          >
            <!-- Tooltip on hover -->
            <div
              v-if="hoveredIndex === index"
              class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-10"
            >
              {{ labels[index] }}: {{ formatValue(value) }}
              <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- X-axis labels -->
      <div class="absolute left-12 right-0 bottom-0 flex justify-around gap-2 text-xs text-gray-600">
        <div
          v-for="(label, index) in labels"
          :key="index"
          class="flex-1 text-center truncate"
          :title="label"
        >
          {{ label }}
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div v-if="showLegend && colors.length > 1" class="flex flex-wrap gap-3 mt-4 justify-center">
      <div
        v-for="(label, index) in labels"
        :key="index"
        class="flex items-center gap-1.5 text-xs"
      >
        <div
          class="w-3 h-3 rounded"
          :style="{ backgroundColor: getBarColor(index) }"
        ></div>
        <span class="text-gray-600">{{ label }}</span>
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
    default: () => ['#3B82F6'] // Default blue
  },
  title: {
    type: String,
    default: ''
  },
  height: {
    type: Number,
    default: 300
  },
  showLegend: {
    type: Boolean,
    default: false
  },
  valuePrefix: {
    type: String,
    default: ''
  },
  valueSuffix: {
    type: String,
    default: ''
  }
})

const hoveredIndex = ref(null)

const chartData = computed(() => props.data)

const maxValue = computed(() => {
  const max = Math.max(...chartData.value, 0)
  // Round up to nearest nice number
  const magnitude = Math.pow(10, Math.floor(Math.log10(max)))
  return Math.ceil(max / magnitude) * magnitude || 10
})

const yAxisTicks = computed(() => {
  const ticks = []
  const tickCount = 5
  for (let i = tickCount; i >= 0; i--) {
    ticks.push((maxValue.value / tickCount) * i)
  }
  return ticks
})

const getBarHeight = (value) => {
  if (maxValue.value === 0) return 0
  return (value / maxValue.value) * 100
}

const getBarColor = (index) => {
  if (props.colors.length === 1) {
    return props.colors[0]
  }
  return props.colors[index % props.colors.length]
}

const formatValue = (value) => {
  const rounded = Math.round(value * 100) / 100
  return `${props.valuePrefix}${rounded.toLocaleString()}${props.valueSuffix}`
}
</script>
