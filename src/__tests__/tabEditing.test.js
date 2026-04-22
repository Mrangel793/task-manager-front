/**
 * Tests para la funcionalidad de edición de pestañas personalizadas.
 * Verifica el comportamiento de editingTabId, openEditTabModal,
 * y que el modal muestre el título/botón correcto según el modo.
 */

import { describe, it, expect, vi } from 'vitest'
import { ref, computed } from 'vue'

// Recrear la lógica de gestión de tabs de TaskListView
function createTabManager() {
  const isTabModalOpen = ref(false)
  const editingTabId = ref(null)
  const newTabData = ref({ label: '', status: 'all', assigneeIds: [] })
  const customTabs = ref([
    { id: 'tab1', label: 'Mi pestaña', filters: { status: 'Pendiente', assigneeIds: [1, 2] } },
    { id: 'tab2', label: 'Urgentes', filters: { status: 'En Progreso', assigneeIds: [] } },
  ])

  const modalTitle = computed(() =>
    editingTabId.value ? 'Editar Pestaña' : 'Nueva Pestaña'
  )

  const submitButtonText = computed(() =>
    editingTabId.value ? 'Guardar Cambios' : 'Crear Pestaña'
  )

  const openTabModal = () => {
    editingTabId.value = null
    newTabData.value = { label: '', status: 'all', assigneeIds: [] }
    isTabModalOpen.value = true
  }

  const openEditTabModal = (tab) => {
    editingTabId.value = tab.id
    newTabData.value = {
      label: tab.label,
      status: tab.filters.status || 'all',
      assigneeIds: tab.filters.assigneeIds ? [...tab.filters.assigneeIds] : []
    }
    isTabModalOpen.value = true
  }

  const closeTabModal = () => {
    isTabModalOpen.value = false
    editingTabId.value = null
    newTabData.value = { label: '', status: 'all', assigneeIds: [] }
  }

  const tabService = {
    createTab: vi.fn().mockResolvedValue({ id: 'new1', label: 'Nueva', filters: {} }),
    updateTab: vi.fn().mockImplementation((id, data) =>
      Promise.resolve({ id, label: data.label, filters: data.filters })
    ),
  }

  const toast = { success: vi.fn(), error: vi.fn() }

  const handleCreateTab = async () => {
    if (editingTabId.value) {
      // Modo edición
      const updated = await tabService.updateTab(editingTabId.value, {
        label: newTabData.value.label,
        filters: {
          status: newTabData.value.status || 'all',
          assigneeIds: newTabData.value.assigneeIds || []
        }
      })
      const index = customTabs.value.findIndex(t => t.id === editingTabId.value)
      if (index !== -1) {
        customTabs.value[index] = { id: updated.id, label: updated.label, filters: updated.filters || {} }
      }
      closeTabModal()
      toast.success('Pestaña actualizada correctamente')
    } else {
      // Modo creación
      const created = await tabService.createTab({ label: newTabData.value.label, filters: {} })
      customTabs.value.push({ id: created.id, label: created.label, filters: {} })
      closeTabModal()
      toast.success('Pestaña creada')
    }
  }

  return {
    isTabModalOpen, editingTabId, newTabData, customTabs,
    modalTitle, submitButtonText,
    openTabModal, openEditTabModal, closeTabModal, handleCreateTab,
    tabService, toast,
  }
}

describe('Gestión de pestañas - modo creación', () => {
  it('openTabModal pone editingTabId en null', () => {
    const { openTabModal, editingTabId } = createTabManager()
    editingTabId.value = 'tab1' // simular que estaba editando
    openTabModal()
    expect(editingTabId.value).toBeNull()
  })

  it('openTabModal limpia newTabData', () => {
    const { openTabModal, newTabData } = createTabManager()
    newTabData.value = { label: 'algo', status: 'Pendiente', assigneeIds: [1] }
    openTabModal()
    expect(newTabData.value.label).toBe('')
    expect(newTabData.value.status).toBe('all')
    expect(newTabData.value.assigneeIds).toEqual([])
  })

  it('modalTitle es "Nueva Pestaña" cuando editingTabId es null', () => {
    const { openTabModal, modalTitle } = createTabManager()
    openTabModal()
    expect(modalTitle.value).toBe('Nueva Pestaña')
  })

  it('submitButtonText es "Crear Pestaña" cuando editingTabId es null', () => {
    const { openTabModal, submitButtonText } = createTabManager()
    openTabModal()
    expect(submitButtonText.value).toBe('Crear Pestaña')
  })
})

describe('Gestión de pestañas - modo edición', () => {
  it('openEditTabModal setea editingTabId con el id de la pestaña', () => {
    const { openEditTabModal, editingTabId, customTabs } = createTabManager()
    openEditTabModal(customTabs.value[0])
    expect(editingTabId.value).toBe('tab1')
  })

  it('openEditTabModal rellena newTabData con los datos de la pestaña', () => {
    const { openEditTabModal, newTabData, customTabs } = createTabManager()
    openEditTabModal(customTabs.value[0])
    expect(newTabData.value.label).toBe('Mi pestaña')
    expect(newTabData.value.status).toBe('Pendiente')
    expect(newTabData.value.assigneeIds).toEqual([1, 2])
  })

  it('openEditTabModal copia assigneeIds (no referencia)', () => {
    const { openEditTabModal, newTabData, customTabs } = createTabManager()
    openEditTabModal(customTabs.value[0])
    newTabData.value.assigneeIds.push(99)
    // El original no debe verse afectado
    expect(customTabs.value[0].filters.assigneeIds).toEqual([1, 2])
  })

  it('modalTitle es "Editar Pestaña" cuando editingTabId tiene valor', () => {
    const { openEditTabModal, modalTitle, customTabs } = createTabManager()
    openEditTabModal(customTabs.value[0])
    expect(modalTitle.value).toBe('Editar Pestaña')
  })

  it('submitButtonText es "Guardar Cambios" cuando editingTabId tiene valor', () => {
    const { openEditTabModal, submitButtonText, customTabs } = createTabManager()
    openEditTabModal(customTabs.value[0])
    expect(submitButtonText.value).toBe('Guardar Cambios')
  })

  it('abre el modal al editar', () => {
    const { openEditTabModal, isTabModalOpen, customTabs } = createTabManager()
    openEditTabModal(customTabs.value[0])
    expect(isTabModalOpen.value).toBe(true)
  })
})

describe('Gestión de pestañas - cerrar modal', () => {
  it('closeTabModal resetea editingTabId a null', () => {
    const { openEditTabModal, closeTabModal, editingTabId, customTabs } = createTabManager()
    openEditTabModal(customTabs.value[0])
    closeTabModal()
    expect(editingTabId.value).toBeNull()
  })

  it('closeTabModal cierra el modal', () => {
    const { openEditTabModal, closeTabModal, isTabModalOpen, customTabs } = createTabManager()
    openEditTabModal(customTabs.value[0])
    closeTabModal()
    expect(isTabModalOpen.value).toBe(false)
  })
})

describe('Gestión de pestañas - handleCreateTab', () => {
  it('llama a updateTab cuando editingTabId tiene valor', async () => {
    const mgr = createTabManager()
    mgr.openEditTabModal(mgr.customTabs.value[0])
    mgr.newTabData.value.label = 'Pestaña editada'
    await mgr.handleCreateTab()
    expect(mgr.tabService.updateTab).toHaveBeenCalledWith('tab1', expect.objectContaining({
      label: 'Pestaña editada'
    }))
    expect(mgr.tabService.createTab).not.toHaveBeenCalled()
  })

  it('llama a createTab cuando editingTabId es null', async () => {
    const mgr = createTabManager()
    mgr.openTabModal()
    mgr.newTabData.value.label = 'Pestaña nueva'
    await mgr.handleCreateTab()
    expect(mgr.tabService.createTab).toHaveBeenCalled()
    expect(mgr.tabService.updateTab).not.toHaveBeenCalled()
  })

  it('muestra toast de éxito al actualizar', async () => {
    const mgr = createTabManager()
    mgr.openEditTabModal(mgr.customTabs.value[0])
    await mgr.handleCreateTab()
    expect(mgr.toast.success).toHaveBeenCalledWith('Pestaña actualizada correctamente')
  })

  it('cierra el modal después de guardar', async () => {
    const mgr = createTabManager()
    mgr.openEditTabModal(mgr.customTabs.value[0])
    await mgr.handleCreateTab()
    expect(mgr.isTabModalOpen.value).toBe(false)
    expect(mgr.editingTabId.value).toBeNull()
  })
})
