<template>
  <div class="max-w-2xl mx-auto">
    <button @click="goBack" class="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Volver a usuarios
    </button>

    <div class="bg-white rounded-lg shadow">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-2xl font-bold text-gray-900">{{ isEdit ? 'Editar Usuario' : 'Nuevo Usuario' }}</h2>
      </div>

      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <div v-if="submitError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {{ submitError }}
        </div>

        <BaseInput v-model="formData.name" label="Nombre completo" placeholder="Juan Pérez" :error="errors.name" required />
        <BaseInput v-model="formData.phone" label="Teléfono" placeholder="+57 3XX XXX XXXX" :error="errors.phone" required />

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Rol <span class="text-red-500">*</span></label>
          <select v-model="formData.role" class="input-field w-full" :class="{ 'border-red-500': errors.role }">
            <option value="">Seleccionar rol</option>
            <option value="admin">Administrador</option>
            <option value="supervisor">Supervisor</option>
            <option value="operario">Operador</option>
          </select>
          <p v-if="errors.role" class="mt-1 text-sm text-red-600">{{ errors.role }}</p>
        </div>

        <BaseInput v-if="!isEdit" v-model="formData.password" type="password" label="Contraseña" placeholder="Mínimo 8 caracteres" :error="errors.password" required />
        <BaseInput v-if="!isEdit" v-model="formData.confirmPassword" type="password" label="Confirmar contraseña" placeholder="Repite la contraseña" :error="errors.confirmPassword" required />

        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <BaseButton type="button" variant="secondary" @click="goBack">Cancelar</BaseButton>
          <BaseButton type="submit" variant="primary" :loading="isSubmitting" loading-text="Guardando...">
            {{ isEdit ? 'Guardar cambios' : 'Crear usuario' }}
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from '@/composables/useToast'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const formData = reactive({ name: '', phone: '', role: '', password: '', confirmPassword: '' })
const errors = reactive({ name: '', phone: '', role: '', password: '', confirmPassword: '' })
const isSubmitting = ref(false)
const submitError = ref('')
const isEdit = computed(() => !!route.params.id)

const goBack = () => router.push('/admin/users')

const handleSubmit = async () => {
  isSubmitting.value = true
  submitError.value = ''
  try {
    // TODO: Implement API call
    toast.success(isEdit.value ? 'Usuario actualizado' : 'Usuario creado correctamente')
    setTimeout(() => router.push('/admin/users'), 1000)
  } catch (error) {
    submitError.value = error.message || 'Error al guardar el usuario'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  if (isEdit.value) {
    // TODO: Load user data
  }
})
</script>
