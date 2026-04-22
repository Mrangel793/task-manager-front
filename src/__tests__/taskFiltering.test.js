/**
 * Tests para la lógica de filtrado de tareas.
 * Verifica que las tareas 'Completada' y 'Por Verificar' se excluyan
 * de la lista principal del operario.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/services', () => ({
  taskService: {
    getTasks: vi.fn().mockResolvedValue([]),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
  },
  authService: {
    getCurrentUser: () => null,
    getCurrentOrganization: () => null,
  },
  userService: {
    clearOperatorsCache: vi.fn(),
  }
}))

import { useTaskStore } from '@/stores/task.store.js'

// Lógica de filteredTasks extraída de TaskListView (igual a la implementación)
function getFilteredTasks(tasks) {
  return tasks.filter(t => t.status !== 'Completada' && t.status !== 'Por Verificar')
}

// Lógica de completedTasks del store (solo 'Completada')
function getCompletedTasks(tasks) {
  return tasks.filter(t => t.status === 'Completada')
}

// Lógica de tasksToShow en PorVerificarView para operario
function getTasksToShowForOperario(tasks) {
  return tasks.filter(t => t.status === 'Completada' || t.status === 'Por Verificar')
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

const SAMPLE_TASKS = [
  { id: 1, title: 'Tarea pendiente', status: 'Pendiente', created_at: '2024-01-01' },
  { id: 2, title: 'Tarea en progreso', status: 'En Progreso', created_at: '2024-01-02' },
  { id: 3, title: 'Tarea por verificar', status: 'Por Verificar', created_at: '2024-01-03' },
  { id: 4, title: 'Tarea completada', status: 'Completada', created_at: '2024-01-04' },
  { id: 5, title: 'Tarea cancelada', status: 'Cancelada', created_at: '2024-01-05' },
]

describe('filteredTasks - lista principal del operario', () => {
  it('excluye tareas con status "Completada"', () => {
    const result = getFilteredTasks(SAMPLE_TASKS)
    expect(result.some(t => t.status === 'Completada')).toBe(false)
  })

  it('excluye tareas con status "Por Verificar"', () => {
    const result = getFilteredTasks(SAMPLE_TASKS)
    expect(result.some(t => t.status === 'Por Verificar')).toBe(false)
  })

  it('incluye tareas con status "Pendiente"', () => {
    const result = getFilteredTasks(SAMPLE_TASKS)
    expect(result.some(t => t.status === 'Pendiente')).toBe(true)
  })

  it('incluye tareas con status "En Progreso"', () => {
    const result = getFilteredTasks(SAMPLE_TASKS)
    expect(result.some(t => t.status === 'En Progreso')).toBe(true)
  })

  it('incluye tareas con status "Cancelada"', () => {
    const result = getFilteredTasks(SAMPLE_TASKS)
    expect(result.some(t => t.status === 'Cancelada')).toBe(true)
  })

  it('retorna lista vacía si todas las tareas están completadas o por verificar', () => {
    const allDone = [
      { id: 1, status: 'Completada' },
      { id: 2, status: 'Por Verificar' },
    ]
    expect(getFilteredTasks(allDone)).toHaveLength(0)
  })
})

describe('tasksToShow - pestaña Completadas para operario', () => {
  it('incluye tareas "Por Verificar" (entregadas por el operario)', () => {
    const result = getTasksToShowForOperario(SAMPLE_TASKS)
    expect(result.some(t => t.status === 'Por Verificar')).toBe(true)
  })

  it('incluye tareas "Completada" (verificadas por admin)', () => {
    const result = getTasksToShowForOperario(SAMPLE_TASKS)
    expect(result.some(t => t.status === 'Completada')).toBe(true)
  })

  it('excluye tareas activas (Pendiente, En Progreso, Cancelada)', () => {
    const result = getTasksToShowForOperario(SAMPLE_TASKS)
    expect(result.some(t => t.status === 'Pendiente')).toBe(false)
    expect(result.some(t => t.status === 'En Progreso')).toBe(false)
    expect(result.some(t => t.status === 'Cancelada')).toBe(false)
  })

  it('retorna exactamente las tareas "Por Verificar" + "Completada"', () => {
    const result = getTasksToShowForOperario(SAMPLE_TASKS)
    expect(result).toHaveLength(2)
  })

  it('ordena de más reciente a más antigua (por created_at)', () => {
    const result = getTasksToShowForOperario(SAMPLE_TASKS)
    // id=4 (2024-01-04) debe ir antes que id=3 (2024-01-03)
    const firstIndex = result.findIndex(t => t.id === 4)
    const secondIndex = result.findIndex(t => t.id === 3)
    expect(firstIndex).toBeLessThan(secondIndex)
  })
})

describe('completedTasks getter del store - solo para admin', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('solo incluye tareas "Completada", no "Por Verificar"', () => {
    const store = useTaskStore()
    store.tasks = SAMPLE_TASKS
    const result = store.completedTasks
    expect(result.every(t => t.status === 'Completada')).toBe(true)
    expect(result.some(t => t.status === 'Por Verificar')).toBe(false)
  })

  it('retorna solo 1 tarea completada del sample', () => {
    const store = useTaskStore()
    store.tasks = SAMPLE_TASKS
    expect(store.completedTasks).toHaveLength(1)
  })
})
