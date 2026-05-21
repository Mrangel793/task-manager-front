<template>
  <div class="p-4 lg:p-6 pb-24 lg:pb-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Contactos</h1>
        <p class="text-sm text-gray-500 mt-0.5">{{ totalContacts }} contacto{{ totalContacts !== 1 ? 's' : '' }}</p>
      </div>
      <div class="flex items-center gap-2">
        <!-- Exportar CSV -->
        <button
          @click="handleExport"
          :disabled="contactStore.loading || contactStore.contacts.length === 0"
          class="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Exportar CSV
        </button>

        <!-- Gestionar acceso (solo Admin) -->
        <button
          v-if="isAdmin"
          @click="openAccessModal"
          class="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          Acceso
        </button>

        <!-- Nuevo Contacto -->
        <button
          v-if="canManage"
          @click="openCreateModal"
          class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Contacto
        </button>
      </div>
    </div>

    <!-- Filtros -->
    <div class="flex flex-col sm:flex-row gap-3 mb-4">
      <!-- Búsqueda -->
      <div class="relative flex-1">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
        </svg>
        <input
          v-model="searchQuery"
          @input="debouncedSearch"
          type="text"
          placeholder="Buscar por nombre, teléfono, email..."
          class="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      <!-- Filtro por empresa -->
      <select
        v-model="selectedSource"
        @change="loadContacts"
        class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
      >
        <option value="">Todos los municipios</option>
        <option v-for="source in contactStore.sources" :key="source" :value="source">
          {{ source }}
        </option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="contactStore.loading" class="flex items-center justify-center py-16">
      <div class="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Empty state -->
    <div v-else-if="contactStore.contacts.length === 0" class="text-center py-16">
      <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <p class="text-gray-500 font-medium">No hay contactos</p>
      <p class="text-sm text-gray-400 mt-1">
        {{ searchQuery || selectedSource ? 'Intenta con otros filtros' : 'Los contactos creados desde WhatsApp aparecerán aquí' }}
      </p>
    </div>

    <!-- Tabla de contactos (desktop) -->
    <div v-else class="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-200 bg-gray-50">
            <th class="px-4 py-3 text-left font-semibold text-gray-600">Nombre</th>
            <th class="px-4 py-3 text-left font-semibold text-gray-600">Teléfono</th>
            <th class="px-4 py-3 text-left font-semibold text-gray-600">Email</th>
            <th class="px-4 py-3 text-left font-semibold text-gray-600">Municipio</th>
            <th class="px-4 py-3 text-left font-semibold text-gray-600">Notas</th>
            <th v-if="canManage" class="px-4 py-3 text-right font-semibold text-gray-600">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="contact in contactStore.contacts"
            :key="contact.id"
            class="hover:bg-gray-50 transition-colors"
          >
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm flex-shrink-0">
                  {{ contact.name.charAt(0).toUpperCase() }}
                </div>
                <span class="font-medium text-gray-900">{{ contact.name }}</span>
              </div>
            </td>
            <td class="px-4 py-3 text-gray-600">{{ contact.phone || '—' }}</td>
            <td class="px-4 py-3 text-gray-600">{{ contact.email || '—' }}</td>
            <td class="px-4 py-3">
              <span v-if="contact.source" class="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">
                {{ contact.source }}
              </span>
              <span v-else class="text-gray-400">—</span>
            </td>
            <td class="px-4 py-3 text-gray-500 max-w-xs truncate">{{ contact.notes || '—' }}</td>
            <td v-if="canManage" class="px-4 py-3 text-right">
              <div class="flex items-center justify-end gap-2">
                <button
                  @click="openEditModal(contact)"
                  class="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  title="Editar"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  @click="confirmDelete(contact)"
                  class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Cards de contactos (mobile) -->
    <div v-if="!contactStore.loading && contactStore.contacts.length > 0" class="md:hidden space-y-3">
      <div
        v-for="contact in contactStore.contacts"
        :key="contact.id"
        class="bg-white rounded-xl border border-gray-200 p-4"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0">
              {{ contact.name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="font-semibold text-gray-900">{{ contact.name }}</p>
              <span v-if="contact.source" class="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-full mt-0.5">
                {{ contact.source }}
              </span>
            </div>
          </div>
          <div v-if="canManage" class="flex items-center gap-1">
            <button @click="openEditModal(contact)" class="p-1.5 text-gray-400 hover:text-primary-600 rounded-lg">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button @click="confirmDelete(contact)" class="p-1.5 text-gray-400 hover:text-red-600 rounded-lg">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        <div class="mt-3 space-y-1 text-sm text-gray-600">
          <p v-if="contact.phone">📞 {{ contact.phone }}</p>
          <p v-if="contact.email">✉️ {{ contact.email }}</p>
          <p v-if="contact.address">📍 {{ contact.address }}</p>
          <p v-if="contact.notes" class="text-gray-500 italic">{{ contact.notes }}</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Crear/Editar Contacto -->
  <div v-if="showContactModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md">
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">
          {{ editingContact ? 'Editar Contacto' : 'Nuevo Contacto' }}
        </h2>
        <button @click="closeModal" class="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="saveContact" class="p-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
          <input
            v-model="form.name"
            type="text"
            placeholder="Nombre completo"
            required
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
          <input
            v-model="form.phone"
            type="tel"
            placeholder="+57 300 000 0000"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            v-model="form.email"
            type="email"
            placeholder="correo@ejemplo.com"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Municipio / Origen</label>
          <input
            v-model="form.source"
            type="text"
            placeholder="Ej: Bucaramanga, Piedecuesta..."
            list="sources-list"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <datalist id="sources-list">
            <option v-for="source in contactStore.sources" :key="source" :value="source" />
          </datalist>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Notas</label>
          <textarea
            v-model="form.notes"
            rows="3"
            placeholder="Información adicional..."
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
          ></textarea>
        </div>

        <!-- Error -->
        <p v-if="formError" class="text-sm text-red-600">{{ formError }}</p>

        <div class="flex gap-3 pt-2">
          <button
            type="button"
            @click="closeModal"
            class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="saving"
            class="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {{ saving ? 'Guardando...' : editingContact ? 'Guardar cambios' : 'Crear contacto' }}
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Modal Confirmar Eliminación -->
  <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
      <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 text-center mb-2">Eliminar contacto</h3>
      <p class="text-sm text-gray-500 text-center mb-6">
        ¿Estás seguro de que deseas eliminar a <strong>{{ contactToDelete?.name }}</strong>? Esta acción no se puede deshacer.
      </p>
      <div class="flex gap-3">
        <button @click="showDeleteModal = false" class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          Cancelar
        </button>
        <button @click="handleDelete" :disabled="deleting" class="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors">
          {{ deleting ? 'Eliminando...' : 'Eliminar' }}
        </button>
      </div>
    </div>
  </div>

  <!-- Modal Gestionar Acceso (solo Admin) -->
  <div v-if="showAccessModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md">
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Gestionar Acceso</h2>
        <button @click="showAccessModal = false" class="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="p-6 space-y-4">
        <p class="text-sm text-gray-600">Selecciona el usuario al que deseas otorgar o revocar acceso a los contactos.</p>

        <!-- Loading usuarios -->
        <div v-if="loadingUsers" class="flex items-center gap-2 text-sm text-gray-500">
          <div class="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          Cargando usuarios...
        </div>

        <!-- Select de usuarios -->
        <div v-else>
          <label class="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
          <select
            v-model="accessUserId"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
          >
            <option value="">Selecciona un usuario...</option>
            <option
              v-for="u in orgUsers"
              :key="u.id"
              :value="u.id"
            >
              {{ u.name }} — {{ u.role || u.roles?.[0]?.name || '' }}
              {{ u.permissions?.includes('view-contacts') ? '✓ tiene acceso' : '' }}
            </option>
          </select>
        </div>

        <p v-if="accessMessage" class="text-sm" :class="accessError ? 'text-red-600' : 'text-green-600'">
          {{ accessMessage }}
        </p>
        <div class="flex gap-3">
          <button @click="handleRevokeAccess" :disabled="accessLoading || !accessUserId" class="flex-1 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors">
            Revocar acceso
          </button>
          <button @click="handleGrantAccess" :disabled="accessLoading || !accessUserId" class="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors">
            Otorgar acceso
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore, useContactStore } from '@/stores'
import { contactService, userService } from '@/services'

const authStore = useAuthStore()
const contactStore = useContactStore()

const isAdmin = computed(() => authStore.userRole === 'admin')
const canManage = computed(() => {
  const user = authStore.currentUser
  return isAdmin.value || user?.permissions?.includes('manage-contacts')
})

const totalContacts = computed(() => contactStore.contacts.length)

// Filtros
const searchQuery = ref('')
const selectedSource = ref('')
let searchTimeout = null

function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => loadContacts(), 400)
}

async function loadContacts() {
  const params = {}
  if (searchQuery.value) params.search = searchQuery.value
  if (selectedSource.value) params.source = selectedSource.value
  await contactStore.fetchContacts(params)
}

onMounted(() => loadContacts())

// Exportar
async function handleExport() {
  try {
    await contactStore.exportContacts(selectedSource.value || null)
  } catch {
    alert('Error al exportar los contactos.')
  }
}

// Modal Crear/Editar
const showContactModal = ref(false)
const editingContact = ref(null)
const saving = ref(false)
const formError = ref('')
const form = ref({
  name: '',
  phone: '',
  email: '',
  source: '',
  notes: ''
})

function openCreateModal() {
  editingContact.value = null
  form.value = { name: '', phone: '', email: '', source: '', notes: '' }
  formError.value = ''
  showContactModal.value = true
}

function openEditModal(contact) {
  editingContact.value = contact
  form.value = {
    name: contact.name || '',
    phone: contact.phone || '',
    email: contact.email || '',
    source: contact.source || '',
    notes: contact.notes || ''
  }
  formError.value = ''
  showContactModal.value = true
}

function closeModal() {
  showContactModal.value = false
  editingContact.value = null
}

async function saveContact() {
  formError.value = ''
  saving.value = true
  try {
    const data = {
      name: form.value.name,
      phone: form.value.phone || null,
      email: form.value.email || null,
      source: form.value.source || null,
      notes: form.value.notes || null
    }
    if (editingContact.value) {
      await contactStore.updateContact(editingContact.value.id, data)
    } else {
      await contactStore.createContact(data)
    }
    closeModal()
    await loadContacts()
  } catch (err) {
    formError.value = err.response?.data?.message || 'Error al guardar el contacto.'
  } finally {
    saving.value = false
  }
}

// Eliminar
const showDeleteModal = ref(false)
const contactToDelete = ref(null)
const deleting = ref(false)

function confirmDelete(contact) {
  contactToDelete.value = contact
  showDeleteModal.value = true
}

async function handleDelete() {
  deleting.value = true
  try {
    await contactStore.deleteContact(contactToDelete.value.id)
    showDeleteModal.value = false
    contactToDelete.value = null
  } catch {
    alert('Error al eliminar el contacto.')
  } finally {
    deleting.value = false
  }
}

// Gestionar acceso
const showAccessModal = ref(false)
const accessUserId = ref('')
const accessLoading = ref(false)
const accessMessage = ref('')
const accessError = ref(false)
const orgUsers = ref([])
const loadingUsers = ref(false)

async function openAccessModal() {
  showAccessModal.value = true
  accessUserId.value = ''
  accessMessage.value = ''
  accessError.value = false
  loadingUsers.value = true
  try {
    const data = await userService.getUsers()
    // Excluir al Admin actual (no tiene sentido gestionar su propio acceso)
    const currentId = authStore.currentUser?.id
    orgUsers.value = (Array.isArray(data) ? data : data.users || [])
      .filter(u => u.id !== currentId)
  } catch {
    orgUsers.value = []
  } finally {
    loadingUsers.value = false
  }
}

async function handleGrantAccess() {
  if (!accessUserId.value) return
  accessLoading.value = true
  accessMessage.value = ''
  try {
    const res = await contactService.grantAccess(accessUserId.value)
    accessMessage.value = res.message || 'Acceso otorgado.'
    accessError.value = false
    // Refrescar lista para actualizar indicadores de acceso
    await openAccessModal()
  } catch (err) {
    accessMessage.value = err.response?.data?.message || 'Error al otorgar acceso.'
    accessError.value = true
  } finally {
    accessLoading.value = false
  }
}

async function handleRevokeAccess() {
  if (!accessUserId.value) return
  accessLoading.value = true
  accessMessage.value = ''
  try {
    const res = await contactService.revokeAccess(accessUserId.value)
    accessMessage.value = res.message || 'Acceso revocado.'
    accessError.value = false
    await openAccessModal()
  } catch (err) {
    accessMessage.value = err.response?.data?.message || 'Error al revocar acceso.'
    accessError.value = true
  } finally {
    accessLoading.value = false
  }
}
</script>
