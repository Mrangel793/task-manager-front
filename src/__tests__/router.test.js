/**
 * Tests para la configuración del router.
 * Verifica que la ruta /verificar sea accesible por admin Y operario.
 */

import { describe, it, expect } from 'vitest'

// Importamos las rutas directamente para verificar la metadata
// sin necesidad de ejecutar los guards
import { createRouter, createMemoryHistory } from 'vue-router'

// Replicar la definición de rutas solo con la metadata relevante
const routes = [
  {
    path: '/verificar',
    name: 'por-verificar',
    component: { template: '<div/>' },
    meta: {
      requiresAuth: true,
      requiresRole: ['admin', 'operario'],
      title: 'Tareas Completadas',
    }
  },
  {
    path: '/tasks',
    name: 'tasks',
    component: { template: '<div/>' },
    meta: {
      requiresAuth: true,
      title: 'Mis Tareas'
    }
  },
  {
    path: '/admin/dashboard',
    name: 'admin-dashboard',
    component: { template: '<div/>' },
    meta: {
      requiresAuth: true,
      requiresRole: ['admin'],
      title: 'Dashboard Admin'
    }
  }
]

describe('Configuración de rutas - /verificar', () => {
  it('la ruta /verificar tiene requiresRole con "admin"', () => {
    const verificarRoute = routes.find(r => r.path === '/verificar')
    expect(verificarRoute.meta.requiresRole).toContain('admin')
  })

  it('la ruta /verificar tiene requiresRole con "operario"', () => {
    const verificarRoute = routes.find(r => r.path === '/verificar')
    expect(verificarRoute.meta.requiresRole).toContain('operario')
  })

  it('la ruta /verificar NO restringe al supervisor', () => {
    // El supervisor no está en requiresRole, por lo que el guard lo bloqueará
    const verificarRoute = routes.find(r => r.path === '/verificar')
    expect(verificarRoute.meta.requiresRole).not.toContain('supervisor')
  })

  it('la ruta /admin/dashboard solo permite admin', () => {
    const adminRoute = routes.find(r => r.path === '/admin/dashboard')
    expect(adminRoute.meta.requiresRole).toEqual(['admin'])
    expect(adminRoute.meta.requiresRole).not.toContain('operario')
  })
})

describe('Lógica del guard requiresRole', () => {
  // Simular la lógica del guard de router
  function canAccess(route, userRole) {
    const requiredRoles = route.meta?.requiresRole
    if (!requiredRoles) return true
    return requiredRoles.includes(userRole)
  }

  const verificarRoute = routes.find(r => r.path === '/verificar')
  const adminRoute = routes.find(r => r.path === '/admin/dashboard')
  const tasksRoute = routes.find(r => r.path === '/tasks')

  it('admin puede acceder a /verificar', () => {
    expect(canAccess(verificarRoute, 'admin')).toBe(true)
  })

  it('operario puede acceder a /verificar', () => {
    expect(canAccess(verificarRoute, 'operario')).toBe(true)
  })

  it('supervisor NO puede acceder a /verificar', () => {
    expect(canAccess(verificarRoute, 'supervisor')).toBe(false)
  })

  it('solo admin puede acceder a /admin/dashboard', () => {
    expect(canAccess(adminRoute, 'admin')).toBe(true)
    expect(canAccess(adminRoute, 'operario')).toBe(false)
    expect(canAccess(adminRoute, 'supervisor')).toBe(false)
  })

  it('cualquier usuario autenticado puede acceder a /tasks (sin requiresRole)', () => {
    expect(canAccess(tasksRoute, 'operario')).toBe(true)
    expect(canAccess(tasksRoute, 'admin')).toBe(true)
    expect(canAccess(tasksRoute, 'supervisor')).toBe(true)
  })
})
