import api from './api'

export const tabService = {
  /**
   * Obtener todas las pestañas del usuario autenticado
   */
  async getTabs(viewType = null) {
    const params = viewType ? { view_type: viewType } : {}
    const response = await api.get('v1/tabs/', { params })
    return response.data.data || response.data
  },

  /**
   * Crear una nueva pestaña
   */
  async createTab(tabData) {
    const response = await api.post('v1/tabs/', tabData)
    return response.data.data || response.data
  },

  /**
   * Actualizar una pestaña existente
   */
  async updateTab(id, tabData) {
    const response = await api.patch(`v1/tabs/${id}`, tabData)
    return response.data.data || response.data
  },

  /**
   * Eliminar una pestaña
   */
  async deleteTab(id) {
    const response = await api.delete(`v1/tabs/${id}`)
    return response.data
  },

  /**
   * Reordenar pestañas
   */
  async reorderTabs(tabIds) {
    const response = await api.post('v1/tabs/reorder', { tab_ids: tabIds })
    return response.data.data || response.data
  }
}
