import { defineStore } from 'pinia'
import { ref } from 'vue'
import { contactService } from '@/services'

export const useContactStore = defineStore('contact', () => {
  const contacts = ref([])
  const sources = ref([])
  const pagination = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchContacts(params = {}) {
    loading.value = true
    error.value = null
    try {
      const data = await contactService.getContacts(params)
      contacts.value = data.contacts?.data || data.contacts || []
      sources.value = data.sources || []
      pagination.value = data.contacts
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createContact(contactData) {
    const data = await contactService.createContact(contactData)
    const contact = data.contact || data
    contacts.value.unshift(contact)
    return contact
  }

  async function updateContact(id, contactData) {
    const data = await contactService.updateContact(id, contactData)
    const updated = data.contact || data
    const index = contacts.value.findIndex(c => c.id === id)
    if (index !== -1) contacts.value[index] = updated
    return updated
  }

  async function deleteContact(id) {
    await contactService.deleteContact(id)
    contacts.value = contacts.value.filter(c => c.id !== id)
  }

  async function exportContacts(source = null) {
    const blob = await contactService.exportContacts(source)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `contactos_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  function clearError() {
    error.value = null
  }

  return {
    contacts,
    sources,
    pagination,
    loading,
    error,
    fetchContacts,
    createContact,
    updateContact,
    deleteContact,
    exportContacts,
    clearError
  }
})
