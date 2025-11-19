<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="visible"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="closeOnBackdrop && handleCancel()"
      >
        <div class="flex min-h-screen items-center justify-center p-4">
          <!-- Backdrop -->
          <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>

          <!-- Dialog -->
          <Transition
            enter-active-class="transition ease-out duration-300"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition ease-in duration-200"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div
              v-if="visible"
              class="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <!-- Icon -->
              <div
                v-if="showIcon"
                class="mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4"
                :class="iconBgClass"
              >
                <svg
                  class="h-6 w-6"
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
              </div>

              <!-- Content -->
              <div class="text-center">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">
                  {{ title }}
                </h3>

                <p v-if="message" class="text-sm text-gray-600">
                  {{ message }}
                </p>

                <!-- Custom slot for complex content -->
                <div v-if="$slots.default" class="mt-3">
                  <slot></slot>
                </div>
              </div>

              <!-- Actions -->
              <div class="mt-6 flex gap-3" :class="reverseButtons ? 'flex-row-reverse' : ''">
                <BaseButton
                  v-if="showCancelButton"
                  type="button"
                  variant="secondary"
                  class="flex-1"
                  @click="handleCancel"
                  :disabled="loading"
                >
                  {{ cancelText }}
                </BaseButton>

                <BaseButton
                  type="button"
                  :variant="danger ? 'danger' : 'primary'"
                  class="flex-1"
                  @click="handleConfirm"
                  :loading="loading"
                  :loading-text="loadingText"
                >
                  {{ confirmText }}
                </BaseButton>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import BaseButton from './BaseButton.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    default: ''
  },
  confirmText: {
    type: String,
    default: 'Confirmar'
  },
  cancelText: {
    type: String,
    default: 'Cancelar'
  },
  danger: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  loadingText: {
    type: String,
    default: 'Procesando...'
  },
  showCancelButton: {
    type: Boolean,
    default: true
  },
  showIcon: {
    type: Boolean,
    default: true
  },
  icon: {
    type: String,
    default: '',
    validator: (value) => !value || ['warning', 'danger', 'info', 'success', 'question'].includes(value)
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true
  },
  reverseButtons: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['confirm', 'cancel', 'update:visible'])

const iconType = computed(() => {
  if (props.icon) return props.icon
  return props.danger ? 'danger' : 'question'
})

const iconBgClass = computed(() => {
  const classes = {
    danger: 'bg-red-100',
    warning: 'bg-yellow-100',
    info: 'bg-blue-100',
    success: 'bg-green-100',
    question: 'bg-gray-100'
  }
  return classes[iconType.value] || classes.question
})

const iconColorClass = computed(() => {
  const classes = {
    danger: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600',
    success: 'text-green-600',
    question: 'text-gray-600'
  }
  return classes[iconType.value] || classes.question
})

const iconPath = computed(() => {
  const icons = {
    danger: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    question: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  }
  return icons[iconType.value] || icons.question
})

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
  emit('update:visible', false)
}
</script>
