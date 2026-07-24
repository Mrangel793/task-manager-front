import { defineStore } from 'pinia'
import { projectService } from '@/services/project.service'

export const useProjectStore = defineStore('project', {
  state: () => ({
    projects: [],
    currentProject: null,
    summary: null,
    loading: false,
    error: null
  }),

  getters: {
    activeProjects: (state) => state.projects.filter(p => p.status === 'Activo'),
    pausedProjects: (state) => state.projects.filter(p => p.status === 'Pausado'),
    completedProjects: (state) => state.projects.filter(p => p.status === 'Completado'),
    archivedProjects: (state) => state.projects.filter(p => p.status === 'Archivado'),
    atRiskProjects: (state) => state.projects.filter(p => p.health === 'at_risk'),
    projectsCount: (state) => state.projects.length
  },

  actions: {
    async fetchProjects(filters = {}) {
      this.loading = true
      this.error = null
      try {
        const response = await projectService.getProjects(filters)
        this.projects = response.data || response
      } catch (error) {
        this.error = error.message || 'Error al cargar proyectos'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchProject(id) {
      this.loading = true
      try {
        this.currentProject = await projectService.getProject(id)
        return this.currentProject
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async createProject(data) {
      try {
        const project = await projectService.createProject(data)
        this.projects.unshift(project)
        return project
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async updateProject(id, data) {
      try {
        const updated = await projectService.updateProject(id, data)
        const index = this.projects.findIndex(p => p.id === id)
        if (index !== -1) {
          this.projects[index] = updated
        }
        if (this.currentProject?.id === id) {
          this.currentProject = updated
        }
        return updated
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async deleteProject(id) {
      try {
        await projectService.deleteProject(id)
        this.projects = this.projects.filter(p => p.id !== id)
        if (this.currentProject?.id === id) {
          this.currentProject = null
        }
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async fetchSummary() {
      try {
        this.summary = await projectService.getSummary()
        return this.summary
      } catch (error) {
        console.error('Error al cargar resumen:', error)
      }
    }
  }
})
