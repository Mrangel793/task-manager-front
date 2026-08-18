import api from './api'

export const projectService = {
  async getProjects(filters = {}) {
    const response = await api.get('v1/projects/', { params: filters })
    return response.data
  },

  async getProject(id) {
    const response = await api.get(`v1/projects/${id}/`)
    const data = response.data.data || response.data
    return data
  },

  async createProject(projectData) {
    const response = await api.post('v1/projects/', projectData)
    const data = response.data.data || response.data
    return data
  },

  async updateProject(id, projectData) {
    const response = await api.patch(`v1/projects/${id}/`, projectData)
    const data = response.data.data || response.data
    return data
  },

  async deleteProject(id) {
    const response = await api.delete(`v1/projects/${id}/`)
    return response.data
  },

  async getProjectTasks(id, filters = {}) {
    const response = await api.get(`v1/projects/${id}/tasks/`, { params: filters })
    const data = response.data.data || response.data
    return data
  },

  async getSummary() {
    const response = await api.get('v1/projects/summary/')
    const data = response.data.data || response.data
    return data
  },

  async getMembers(projectId) {
    const response = await api.get(`v1/projects/${projectId}/members`)
    return response.data.data || []
  },

  async addMember(projectId, userId) {
    const response = await api.post(`v1/projects/${projectId}/members`, { user_id: userId })
    return response.data
  },

  async removeMember(projectId, userId) {
    const response = await api.delete(`v1/projects/${projectId}/members/${userId}`)
    return response.data
  }
}
