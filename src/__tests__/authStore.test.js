/**
 * Tests para el auth store: normalización de roles del backend.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Mock de los servicios que el auth store importa
vi.mock('@/services', () => ({
  authService: {
    getCurrentUser: () => null,
    getCurrentOrganization: () => null,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    refreshToken: vi.fn(),
  },
  userService: {
    clearOperatorsCache: vi.fn(),
  }
}))

import { useAuthStore } from '@/stores/auth.store.js'

describe('useAuthStore - userRole getter', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('retorna "admin" para rol "admin"', () => {
    const store = useAuthStore()
    store.user = { role: 'admin' }
    expect(store.userRole).toBe('admin')
  })

  it('retorna "admin" para rol "administrador" (español)', () => {
    const store = useAuthStore()
    store.user = { role: 'administrador' }
    expect(store.userRole).toBe('admin')
  })

  it('retorna "admin" para rol "Administrador" (capitalizado)', () => {
    const store = useAuthStore()
    store.user = { role: 'Administrador' }
    expect(store.userRole).toBe('admin')
  })

  it('retorna "supervisor" para rol "supervisor"', () => {
    const store = useAuthStore()
    store.user = { role: 'supervisor' }
    expect(store.userRole).toBe('supervisor')
  })

  it('retorna "operario" para rol "operario"', () => {
    const store = useAuthStore()
    store.user = { role: 'operario' }
    expect(store.userRole).toBe('operario')
  })

  it('retorna "operario" para rol "operador" (español alternativo)', () => {
    const store = useAuthStore()
    store.user = { role: 'operador' }
    expect(store.userRole).toBe('operario')
  })

  it('retorna "user" para rol desconocido', () => {
    const store = useAuthStore()
    store.user = { role: 'desconocido' }
    expect(store.userRole).toBe('user')
  })

  it('retorna "user" cuando no hay usuario', () => {
    const store = useAuthStore()
    store.user = null
    expect(store.userRole).toBe('user')
  })
})
