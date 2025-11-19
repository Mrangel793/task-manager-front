<template>
  <div class="flex items-center justify-center min-h-[60vh]">
    <div class="text-center">
      <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
      <p class="text-gray-600">Redirigiendo...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores'

const router = useRouter()
const authStore = useAuthStore()

onMounted(() => {
  const role = authStore.userRole

  // Redirigir según el rol del usuario
  switch (role) {
    case 'operario':
      router.replace('/tasks')
      break
    case 'supervisor':
      router.replace('/team/overview')
      break
    case 'admin':
      router.replace('/admin/dashboard')
      break
    default:
      router.replace('/tasks')
  }
})
</script>
