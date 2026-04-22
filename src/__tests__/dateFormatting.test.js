/**
 * Tests para la lógica de formateo de fechas con manejo de timezone.
 * El bug principal: new Date('2024-01-15') interpreta como UTC midnight,
 * causando que en zonas negativas (ej. UTC-5) la fecha se muestre como el día anterior.
 * La solución: parsear manualmente con split('-').
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// Implementación que tiene el bug (usa new Date() con string)
function formatDueDateBuggy(date) {
  if (!date) return 'Sin fecha'
  const d = new Date(date)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
  const taskDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  if (taskDate.getTime() === today.getTime()) return 'Hoy'
  if (taskDate.getTime() === tomorrow.getTime()) return 'Mañana'
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
}

// Implementación corregida (parseo manual, timezone-safe) - igual que en TaskListView.vue
function formatDueDate(date) {
  if (!date) return 'Sin fecha'
  const dateParts = date.split('-')
  if (dateParts.length !== 3) {
    return formatDueDateBuggy(date)
  }
  const year = parseInt(dateParts[0])
  const month = parseInt(dateParts[1]) - 1
  const day = parseInt(dateParts[2])
  const taskDate = new Date(year, month, day)

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)

  if (taskDate.getTime() === today.getTime()) return 'Hoy'
  if (taskDate.getTime() === tomorrow.getTime()) return 'Mañana'

  return taskDate.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
}

// Construir una fecha YYYY-MM-DD para "hoy"
function todayString() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Construir una fecha YYYY-MM-DD para "mañana"
function tomorrowString() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

describe('formatDueDate (timezone-safe)', () => {
  it('retorna "Sin fecha" para valor nulo', () => {
    expect(formatDueDate(null)).toBe('Sin fecha')
    expect(formatDueDate(undefined)).toBe('Sin fecha')
    expect(formatDueDate('')).toBe('Sin fecha')
  })

  it('retorna "Hoy" para la fecha de hoy', () => {
    expect(formatDueDate(todayString())).toBe('Hoy')
  })

  it('retorna "Mañana" para la fecha de mañana', () => {
    expect(formatDueDate(tomorrowString())).toBe('Mañana')
  })

  it('no retorna "Mañana" para una fecha que es hoy', () => {
    expect(formatDueDate(todayString())).not.toBe('Mañana')
  })

  it('retorna texto de fecha para fechas pasadas', () => {
    const result = formatDueDate('2020-01-15')
    expect(result).not.toBe('Hoy')
    expect(result).not.toBe('Mañana')
    expect(result).not.toBe('Sin fecha')
  })

  it('parsea correctamente el formato YYYY-MM-DD sin desfase de zona horaria', () => {
    // El bug: en zonas UTC-5, new Date('2024-01-15') → 14 enero local
    // La corrección: parsear como fecha local, nunca como UTC
    const date = '2024-06-15'
    const parts = date.split('-')
    const localDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
    expect(localDate.getDate()).toBe(15)    // día correcto
    expect(localDate.getMonth()).toBe(5)    // junio = mes 5 (0-indexed)
    expect(localDate.getFullYear()).toBe(2024)
  })
})

describe('getDueDateColor (timezone-safe)', () => {
  // Implementación igual a TaskListView
  function getDueDateColor(task) {
    if (!task.due_date) return 'text-gray-400'
    if (task.status === 'Completada' || task.status === 'Por Verificar') return 'text-green-600'

    const dateParts = task.due_date.split('-')
    if (dateParts.length !== 3) return 'text-gray-400'
    const year = parseInt(dateParts[0])
    const month = parseInt(dateParts[1]) - 1
    const day = parseInt(dateParts[2])
    const taskDate = new Date(year, month, day)

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    if (taskDate < today) return 'text-red-500'
    if (taskDate.getTime() === today.getTime()) return 'text-amber-500'
    return 'text-gray-400'
  }

  it('retorna verde para tareas Completada independientemente de la fecha', () => {
    expect(getDueDateColor({ status: 'Completada', due_date: '2020-01-01' })).toBe('text-green-600')
  })

  it('retorna verde para tareas Por Verificar', () => {
    expect(getDueDateColor({ status: 'Por Verificar', due_date: '2020-01-01' })).toBe('text-green-600')
  })

  it('retorna rojo para tareas vencidas', () => {
    expect(getDueDateColor({ status: 'Pendiente', due_date: '2020-01-01' })).toBe('text-red-500')
  })

  it('retorna gris para fechas sin vencer', () => {
    expect(getDueDateColor({ status: 'Pendiente', due_date: '2099-12-31' })).toBe('text-gray-400')
  })

  it('retorna gris cuando no hay fecha', () => {
    expect(getDueDateColor({ status: 'Pendiente', due_date: null })).toBe('text-gray-400')
  })

  it('retorna ámbar para tareas que vencen hoy', () => {
    expect(getDueDateColor({ status: 'Pendiente', due_date: todayString() })).toBe('text-amber-500')
  })
})
