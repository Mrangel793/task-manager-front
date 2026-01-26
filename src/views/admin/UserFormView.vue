<template>
  <div class="max-w-2xl mx-auto">
    <button @click="goBack" class="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Volver a usuarios
    </button>

    <!-- Loading state -->
    <div v-if="loadingUser" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <div v-else class="bg-white rounded-lg shadow">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-2xl font-bold text-gray-900">{{ isEdit ? 'Editar Usuario' : 'Nuevo Usuario' }}</h2>
        <p v-if="isEdit" class="text-sm text-gray-600 mt-1">Modificando datos de {{ originalName }}</p>
      </div>

      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <div v-if="submitError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {{ submitError }}
        </div>

        <BaseInput
          v-model="formData.name"
          label="Nombre completo"
          placeholder="Juan Pérez"
          :error="errors.name"
          :disabled="isSubmitting"
          required
        />

        <BaseInput
          v-model="formData.email"
          type="email"
          label="Correo electrónico"
          placeholder="usuario@ejemplo.com"
          :error="errors.email"
          :disabled="isSubmitting"
          required
        />

        <BaseInput
          v-model="formData.phone"
          label="Teléfono"
          placeholder="+57 3XX XXX XXXX"
          :error="errors.phone"
          :disabled="isSubmitting"
        />

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Rol <span class="text-red-500">*</span></label>
          <select
            v-model="formData.role"
            class="input-field w-full"
            :class="{ 'border-red-500': errors.role }"
            :disabled="isSubmitting"
          >
            <option value="">Seleccionar rol</option>
            <option value="Admin">Administrador</option>
            <option value="Supervisor">Supervisor</option>
            <option value="Operador">Operador</option>
          </select>
          <p v-if="errors.role" class="mt-1 text-sm text-red-600">{{ errors.role }}</p>
        </div>

        <!-- Password fields only for new users -->
        <template v-if="!isEdit">
          <BaseInput
            v-model="formData.password"
            type="password"
            label="Contraseña"
            placeholder="Mínimo 8 caracteres"
            :error="errors.password"
            :disabled="isSubmitting"
            required
          />
          <BaseInput
            v-model="formData.confirmPassword"
            type="password"
            label="Confirmar contraseña"
            placeholder="Repite la contraseña"
            :error="errors.confirmPassword"
            :disabled="isSubmitting"
            required
          />
        </template>

        <!-- Optional: Reset password for existing users -->
        <div v-if="isEdit" class="bg-gray-50 p-4 rounded-lg">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-sm font-medium text-gray-900">Restablecer contraseña</h4>
              <p class="text-xs text-gray-500 mt-1">Dejar en blanco para mantener la contraseña actual</p>
            </div>
            <button
              type="button"
              @click="showPasswordFields = !showPasswordFields"
              class="text-sm text-primary-600 hover:text-primary-800"
            >
              {{ showPasswordFields ? 'Cancelar' : 'Cambiar' }}
            </button>
          </div>
          <template v-if="showPasswordFields">
            <div class="mt-4 space-y-4">
              <BaseInput
                v-model="formData.password"
                type="password"
                label="Nueva contraseña"
                placeholder="Mínimo 8 caracteres"
                :error="errors.password"
                :disabled="isSubmitting"
              />
              <BaseInput
                v-model="formData.confirmPassword"
                type="password"
                label="Confirmar nueva contraseña"
                placeholder="Repite la contraseña"
                :error="errors.confirmPassword"
                :disabled="isSubmitting"
              />
            </div>
          </template>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <BaseButton type="button" variant="secondary" @click="goBack" :disabled="isSubmitting">
            Cancelar
          </BaseButton>
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
import { userService } from '@/services'
import { useToast } from '@/composables/useToast'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const formData = reactive({
  name: '',
  email: '',
  phone: '',
  role: '',
  password: '',
  confirmPassword: ''
})

const errors = reactive({
  name: '',
  email: '',
  phone: '',
  role: '',
  password: '',
  confirmPassword: ''
})

const isSubmitting = ref(false)
const loadingUser = ref(false)
const submitError = ref('')
const showPasswordFields = ref(false)
const originalName = ref('')

const isEdit = computed(() => !!route.params.id)
const userId = computed(() => route.params.id)

const goBack = () => router.push('/admin/users')

const clearErrors = () => {
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
  submitError.value = ''
}

const validateForm = () => {
  clearErrors()
  let isValid = true

  if (!formData.name || formData.name.trim().length < 2) {
    errors.name = 'El nombre debe tener al menos 2 caracteres'
    isValid = false
  }

  if (!formData.email) {
    errors.email = 'El correo electrónico es requerido'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Correo electrónico inválido'
    isValid = false
  }

  if (!formData.role) {
    errors.role = 'El rol es requerido'
    isValid = false
  }

  // Password validation for new users or when changing password
  const needsPassword = !isEdit.value || (isEdit.value && showPasswordFields.value && formData.password)

  if (!isEdit.value && !formData.password) {
    errors.password = 'La contraseña es requerida'
    isValid = false
  } else if (needsPassword && formData.password && formData.password.length < 8) {
    errors.password = 'La contraseña debe tener al menos 8 caracteres'
    isValid = false
  }

  if (needsPassword && formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Las contraseñas no coinciden'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true
  submitError.value = ''

  try {
    const userData = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      role: formData.role
    }

    // Add phone if provided
    if (formData.phone) {
      userData.phone = formData.phone.trim()
    }

    // Add password if creating or changing
    if (!isEdit.value || (showPasswordFields.value && formData.password)) {
      userData.password = formData.password
    }

    if (isEdit.value) {
      await userService.updateUser(userId.value, userData)
      toast.success('Usuario actualizado correctamente')
    } else {
      await userService.createUser(userData)
      toast.success('Usuario creado correctamente')
    }

    setTimeout(() => router.push('/admin/users'), 1000)
  } catch (error) {
    const message = error.response?.data?.message || error.response?.data?.detail || error.message || 'Error al guardar el usuario'
    submitError.value = message
    toast.error(message)
  } finally {
    isSubmitting.value = false
  }
}

const loadUser = async () => {
  if (!userId.value) return

  loadingUser.value = true
  try {
    const user = await userService.getUser(userId.value)

    formData.name = user.name || ''
    formData.email = user.email || ''
    formData.phone = user.phone || ''
    formData.role = normalizeRole(user.role)
    originalName.value = user.name || ''
  } catch (error) {
    toast.error('Error al cargar los datos del usuario')
    router.push('/admin/users')
  } finally {
    loadingUser.value = false
  }
}

const normalizeRole = (role) => {
  if (!role) return ''
  const r = role.toLowerCase()
  if (r === 'administrador' || r === 'admin') return 'Admin'
  if (r === 'supervisor') return 'Supervisor'
  if (r === 'operador' || r === 'operario') return 'Operador'
  return ''
}

onMounted(() => {
  if (isEdit.value) {
    loadUser()
  }
})
</script>
