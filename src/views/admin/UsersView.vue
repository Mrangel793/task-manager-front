<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <p class="text-sm text-gray-600 mt-1">{{ users.length }} usuarios registrados</p>
      </div>
      <BaseButton variant="primary" @click="createUser">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Nuevo Usuario
      </BaseButton>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input v-model="filters.search" type="text" placeholder="Buscar por nombre, email o teléfono..." class="input-field">
        <select v-model="filters.role" class="input-field">
          <option value="all">Todos los roles</option>
          <option value="admin">Administrador</option>
          <option value="supervisor">Supervisor</option>
          <option value="operario">Operador</option>
        </select>
        <select v-model="filters.status" class="input-field">
          <option value="all">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <!-- Table -->
    <div v-else-if="filteredUsers.length > 0" class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                  <span class="text-sm font-semibold text-primary-600">{{ getUserInitials(user) }}</span>
                </div>
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                  <div class="text-sm text-gray-500">Miembro desde {{ formatDate(user.created_at) }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="getRoleBadgeClass(user.role)" class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium">
                {{ getRoleLabel(user.role) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ user.email || '-' }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ user.phone || '-' }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Activo
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
              <button @click="editUser(user)" class="text-primary-600 hover:text-primary-900">Editar</button>
              <button @click="confirmDelete(user)" class="text-red-600 hover:text-red-900">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-12 bg-white rounded-lg shadow">
      <svg class="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      <h3 class="mt-4 text-lg font-medium text-gray-900">No hay usuarios</h3>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 overflow-y-auto" @click.self="closeDeleteModal">
      <div class="flex min-h-screen items-center justify-center p-4">
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>

        <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div class="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h3 class="text-lg font-bold text-gray-900 text-center mb-2">Eliminar Usuario</h3>
          <p class="text-sm text-gray-600 text-center mb-6">
            ¿Estás seguro de que deseas eliminar a <span class="font-semibold">{{ userToDelete?.name }}</span>?
            Esta acción no se puede deshacer.
          </p>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              @click="closeDeleteModal"
              :disabled="isDeleting"
              class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              @click="deleteUser"
              :disabled="isDeleting"
              class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center"
            >
              <svg v-if="isDeleting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isDeleting ? 'Eliminando...' : 'Eliminar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { userService } from '@/services'
import { useToast } from '@/composables/useToast'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()
const toast = useToast()

const loading = ref(false)
const users = ref([])
const filters = ref({ search: '', role: 'all', status: 'all' })

// Delete modal state
const showDeleteModal = ref(false)
const userToDelete = ref(null)
const isDeleting = ref(false)

const filteredUsers = computed(() => {
  let result = users.value
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    result = result.filter(u => u.name.toLowerCase().includes(search) || (u.email && u.email.toLowerCase().includes(search)) || (u.phone && u.phone.includes(search)))
  }
  if (filters.value.role !== 'all') {
    result = result.filter(u => normalizeRole(u.role) === filters.value.role)
  }
  return result
})

const normalizeRole = (role) => {
  if (!role) return 'user'
  const r = role.toLowerCase()
  if (r === 'administrador' || r === 'admin') return 'admin'
  if (r === 'supervisor') return 'supervisor'
  if (r === 'operador' || r === 'operario') return 'operario'
  return 'user'
}

const getUserInitials = (user) => {
  if (!user.name) return 'U'
  const names = user.name.trim().split(' ')
  return names.length === 1 ? names[0].substring(0, 2).toUpperCase() : (names[0][0] + names[names.length - 1][0]).toUpperCase()
}

const getRoleBadgeClass = (role) => {
  const normalized = normalizeRole(role)
  return { admin: 'bg-purple-100 text-purple-800', supervisor: 'bg-blue-100 text-blue-800', operario: 'bg-green-100 text-green-800' }[normalized] || 'bg-gray-100 text-gray-800'
}

const getRoleLabel = (role) => {
  const normalized = normalizeRole(role)
  return { admin: 'Administrador', supervisor: 'Supervisor', operario: 'Operador' }[normalized] || 'Usuario'
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('es-CO', { year: 'numeric', month: 'short' })
}

const createUser = () => router.push('/admin/users/new')
const editUser = (user) => router.push(`/admin/users/${user.id}/edit`)

const confirmDelete = (user) => {
  userToDelete.value = user
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  if (isDeleting.value) return
  showDeleteModal.value = false
  userToDelete.value = null
}

const deleteUser = async () => {
  if (!userToDelete.value) return

  isDeleting.value = true
  try {
    await userService.deleteUser(userToDelete.value.id)
    users.value = users.value.filter(u => u.id !== userToDelete.value.id)
    toast.success(`Usuario "${userToDelete.value.name}" eliminado correctamente`)
    // Cerrar modal directamente aquí
    showDeleteModal.value = false
    userToDelete.value = null
  } catch (error) {
    const message = error.response?.data?.message || error.response?.data?.detail || 'Error al eliminar el usuario'
    toast.error(message)
  } finally {
    isDeleting.value = false
  }
}

const loadUsers = async () => {
  loading.value = true
  try {
    const data = await userService.getUsers()
    users.value = Array.isArray(data) ? data : data.users || data.data || []
  } catch (error) {
    toast.error('Error al cargar usuarios')
  } finally {
    loading.value = false
  }
}

onMounted(() => loadUsers())
</script>
