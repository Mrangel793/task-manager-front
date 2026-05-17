import api from './api'

export const contactService = {
  async getContacts(params = {}) {
    const response = await api.get('v1/contacts', { params })
    return response.data.data || response.data
  },

  async getContact(id) {
    const response = await api.get(`v1/contacts/${id}`)
    return response.data.data || response.data
  },

  async createContact(data) {
    const response = await api.post('v1/contacts', data)
    return response.data.data || response.data
  },

  async updateContact(id, data) {
    const response = await api.patch(`v1/contacts/${id}`, data)
    return response.data.data || response.data
  },

  async deleteContact(id) {
    const response = await api.delete(`v1/contacts/${id}`)
    return response.data
  },

  getExportUrl(source = null) {
    const token = localStorage.getItem('accessToken')
    const base = api.defaults.baseURL || ''
    const params = new URLSearchParams()
    if (source) params.set('source', source)
    params.set('token', token) // fallback si la API no usa header en download
    return `${base}v1/contacts/export?${params.toString()}`
  },

  async exportContacts(source = null) {
    const params = {}
    if (source) params.source = source
    const response = await api.get('v1/contacts/export', {
      params,
      responseType: 'blob'
    })
    return response.data
  },

  async grantAccess(userId) {
    const response = await api.post('v1/contacts/grant-access', { user_id: userId })
    return response.data
  },

  async revokeAccess(userId) {
    const response = await api.post('v1/contacts/revoke-access', { user_id: userId })
    return response.data
  }
}
