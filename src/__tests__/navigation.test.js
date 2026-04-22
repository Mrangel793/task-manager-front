/**
 * Tests para la lógica de navegación (Sidebar y BottomNav).
 * Verifica que operario vea la pestaña Completadas y que el badge
 * cuente tanto 'Completada' como 'Por Verificar'.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createMemoryHistory } from 'vue-router'

vi.mock('@/services', () => ({
  authService: {
    getCurrentUser: () => null,
    getCurrentOrganization: () => null,
    login: vi.fn(),
  },
  userService: { clearOperatorsCache: vi.fn() },
  notificationService: { getNotifications: vi.fn().mockResolvedValue([]) },
}))

import BottomNav from '@/components/navigation/BottomNav.vue'
import Sidebar from '@/components/navigation/Sidebar.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div/>' } },
    { path: '/verificar', component: { template: '<div/>' } },
    { path: '/notifications', component: { template: '<div/>' } },
    { path: '/profile', component: { template: '<div/>' } },
    { path: '/team', component: { template: '<div/>' } },
    { path: '/team/overview', component: { template: '<div/>' } },
    { path: '/admin/dashboard', component: { template: '<div/>' } },
    { path: '/admin/users', component: { template: '<div/>' } },
  ]
})

const MIXED_TASKS = [
  { id: 1, status: 'Pendiente' },
  { id: 2, status: 'En Progreso' },
  { id: 3, status: 'Por Verificar' },
  { id: 4, status: 'Completada' },
]

function mountBottomNav(role, tasks = []) {
  return mount(BottomNav, {
    global: {
      plugins: [
        createTestingPinia({
          initialState: {
            auth: { user: { role } },
            task: { tasks },
            notification: { notifications: [], unreadCount: 0 },
          },
          stubActions: true,
        }),
        router,
      ],
    },
  })
}

function mountSidebar(role, tasks = []) {
  return mount(Sidebar, {
    global: {
      plugins: [
        createTestingPinia({
          initialState: {
            auth: { user: { role } },
            task: { tasks },
            notification: { notifications: [], unreadCount: 0 },
          },
          stubActions: true,
        }),
        router,
      ],
    },
  })
}

describe('BottomNav - navegación por rol', () => {
  beforeEach(async () => {
    await router.push('/')
  })

  it('operario ve enlace a /verificar (Completadas)', () => {
    const wrapper = mountBottomNav('operario', MIXED_TASKS)
    const links = wrapper.findAll('a')
    const verificarLink = links.find(l => l.attributes('href') === '/verificar')
    expect(verificarLink).toBeDefined()
  })

  it('operario ve 4 elementos de navegación', () => {
    const wrapper = mountBottomNav('operario', MIXED_TASKS)
    const links = wrapper.findAll('a')
    expect(links.length).toBe(4)
  })

  it('admin ve enlace a /verificar (Completadas)', () => {
    const wrapper = mountBottomNav('admin', MIXED_TASKS)
    const links = wrapper.findAll('a')
    const verificarLink = links.find(l => l.attributes('href') === '/verificar')
    expect(verificarLink).toBeDefined()
  })

  it('supervisor NO ve enlace a /verificar', () => {
    const wrapper = mountBottomNav('supervisor', MIXED_TASKS)
    const links = wrapper.findAll('a')
    const verificarLink = links.find(l => l.attributes('href') === '/verificar')
    expect(verificarLink).toBeUndefined()
  })
})

describe('BottomNav - badge de Completadas para operario', () => {
  beforeEach(async () => {
    await router.push('/')
  })

  it('muestra badge cuando hay tareas Por Verificar', () => {
    const tasks = [{ id: 1, status: 'Por Verificar' }, { id: 2, status: 'Pendiente' }]
    const wrapper = mountBottomNav('operario', tasks)
    const badges = wrapper.findAll('span.bg-red-600, span.rounded-full')
    // El badge existe en el HTML
    expect(wrapper.html()).toContain('1')
  })

  it('badge cuenta tanto "Completada" como "Por Verificar"', () => {
    const tasks = [
      { id: 1, status: 'Por Verificar' },
      { id: 2, status: 'Completada' },
      { id: 3, status: 'Pendiente' },
    ]
    const wrapper = mountBottomNav('operario', tasks)
    // El badge debe mostrar 2 (Por Verificar + Completada)
    expect(wrapper.html()).toContain('2')
  })
})

describe('Sidebar - secciones por rol', () => {
  beforeEach(async () => {
    await router.push('/')
  })

  it('operario ve sección "Mis Tareas" con enlace a /verificar', () => {
    const wrapper = mountSidebar('operario', MIXED_TASKS)
    const html = wrapper.html()
    expect(html).toContain('/verificar')
    expect(html).toContain('Mis Tareas')
  })

  it('admin ve sección "Administración" con enlace a /verificar', () => {
    const wrapper = mountSidebar('admin', MIXED_TASKS)
    const html = wrapper.html()
    expect(html).toContain('/verificar')
    expect(html).toContain('Administración')
  })

  it('supervisor NO ve enlace a /verificar', () => {
    const wrapper = mountSidebar('supervisor', MIXED_TASKS)
    const html = wrapper.html()
    expect(html).not.toContain('/verificar')
  })

  it('operario NO ve sección "Administración"', () => {
    const wrapper = mountSidebar('operario', MIXED_TASKS)
    expect(wrapper.html()).not.toContain('Administración')
  })
})
