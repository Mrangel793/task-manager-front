<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Proyectos</h1>
        <p class="text-sm text-gray-500 mt-1">
          {{ projectStore.activeProjects.length }} activos
          <span v-if="projectStore.atRiskProjects.length"> · {{ projectStore.atRiskProjects.length }} en riesgo</span>
        </p>
      </div>
      <button
        @click="openCreateModal"
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium text-sm"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Nuevo proyecto
      </button>
    </div>

    <!-- Filters -->
    <div class="mb-6 flex flex-col sm:flex-row gap-3">
      <div class="flex-1">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="search"
            type="text"
            placeholder="Buscar proyectos..."
            class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>
      <select
        v-model="statusFilter"
        class="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-sm"
      >
        <option value="all">Todos los estados</option>
        <option value="Activo">Activos</option>
        <option value="Pausado">Pausados</option>
        <option value="Completado">Completados</option>
        <option value="Archivado">Archivados</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="loading && projectStore.projects.length === 0" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>

    <!-- Empty state -->
    <div v-else-if="filteredProjects.length === 0" class="text-center py-16 bg-white rounded-lg shadow">
      <svg class="mx-auto h-20 w-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
      <h3 class="mt-4 text-lg font-semibold text-gray-900">
        {{ search || statusFilter !== 'all' ? 'No se encontraron proyectos' : 'Sin proyectos' }}
      </h3>
      <p class="mt-2 text-sm text-gray-500">
        {{ search || statusFilter !== 'all' ? 'Intenta con otros filtros' : 'Crea tu primer proyecto para organizar tus tareas' }}
      </p>
      <button
        v-if="!search && statusFilter === 'all'"
        @click="openCreateModal"
        class="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm font-medium"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Crear proyecto
      </button>
    </div>

    <!-- Projects grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <ProjectCard
        v-for="project in filteredProjects"
        :key="project.id"
        :project="project"
        @click="goToProject"
        @edit="openEditModal"
        @delete="handleDelete"
      />
    </div>

    <!-- Project Modal -->
    <ProjectModal
      :is-open="isModalOpen"
      :project="selectedProject"
      @save="handleSave"
      @cancel="closeModal"
    />

    <!-- Delete Confirm -->
    <ConfirmDialog
      :visible="confirmDelete.visible"
      title="Eliminar proyecto"
      :message="`¿Eliminar '${confirmDelete.project?.name}'? Las tareas no se eliminan, solo se desasocian del proyecto.`"
      confirm-text="Eliminar"
      cancel-text="Cancelar"
      @confirm="confirmDeleteProject"
      @cancel="confirmDelete.visible = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectStore } from '@/stores/project.store'
import { useToast } from '@/composables/useToast'
import ProjectCard from '@/components/projects/ProjectCard.vue'
import ProjectModal from '@/components/projects/ProjectModal.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const router = useRouter()
const projectStore = useProjectStore()
const toast = useToast()

const loading = ref(false)
const search = ref('')
const statusFilter = ref('all')
const isModalOpen = ref(false)
const selectedProject = ref(null)
const confirmDelete = ref({ visible: false, project: null })

const filteredProjects = computed(() => {
  let projects = projectStore.projects

  if (statusFilter.value !== 'all') {
    projects = projects.filter(p => p.status === statusFilter.value)
  }

  if (search.value) {
    const s = search.value.toLowerCase()
    projects = projects.filter(p =>
      p.name.toLowerCase().includes(s) ||
      (p.description && p.description.toLowerCase().includes(s))
    )
  }

  return projects
})

const goToProject = (project) => {
  router.push(`/projects/${project.id}`)
}

const openCreateModal = () => {
  selectedProject.value = null
  isModalOpen.value = true
}

const openEditModal = (project) => {
  selectedProject.value = project
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedProject.value = null
}

const handleSave = async (data) => {
  try {
    if (selectedProject.value) {
      await projectStore.updateProject(selectedProject.value.id, data)
      toast.success('Proyecto actualizado')
    } else {
      await projectStore.createProject(data)
      toast.success('Proyecto creado')
    }
    closeModal()
  } catch (error) {
    toast.error(error.message || 'Error al guardar el proyecto')
  }
}

const handleDelete = (project) => {
  confirmDelete.value = { visible: true, project }
}

const confirmDeleteProject = async () => {
  try {
    await projectStore.deleteProject(confirmDelete.value.project.id)
    toast.success('Proyecto eliminado')
    confirmDelete.value = { visible: false, project: null }
  } catch (error) {
    toast.error('Error al eliminar el proyecto')
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await projectStore.fetchProjects()
  } catch {
    toast.error('Error al cargar proyectos')
  } finally {
    loading.value = false
  }
})
</script>
