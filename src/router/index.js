import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores'
import AppLayout from '@/layouts/AppLayout.vue'

const routes = [
  // Public routes (no layout)
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/verification',
    name: 'verification',
    component: () => import('@/views/auth/VerificationView.vue'),
    meta: { requiresGuest: true }
  },
  // Protected routes (with layout)
  {
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue'),
        meta: {
          requiresAuth: true,
          title: 'Dashboard'
        }
      },
      // Tasks routes
      {
        path: 'tasks',
        name: 'tasks',
        component: () => import('@/views/tasks/TaskListView.vue'),
        meta: {
          requiresAuth: true,
          title: 'Mis Tareas',
          subtitle: 'Gestiona tus tareas diarias'
        }
      },
      {
        path: 'tasks/:id',
        name: 'task-detail',
        component: () => import('@/views/tasks/TaskDetailView.vue'),
        meta: {
          requiresAuth: true,
          title: 'Detalle de Tarea'
        }
      },
      // Profile routes
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/views/profile/ProfileView.vue'),
        meta: {
          requiresAuth: true,
          title: 'Mi Perfil',
          subtitle: 'Información personal y configuración'
        }
      },
      {
        path: 'profile/edit',
        name: 'profile-edit',
        component: () => import('@/views/profile/EditProfileView.vue'),
        meta: {
          requiresAuth: true,
          title: 'Editar Perfil'
        }
      },
      {
        path: 'profile/settings',
        name: 'profile-settings',
        component: () => import('@/views/profile/SettingsView.vue'),
        meta: {
          requiresAuth: true,
          title: 'Configuración',
          subtitle: 'Preferencias y notificaciones'
        }
      },
      {
        path: 'profile/notifications',
        name: 'profile-notifications',
        component: () => import('@/views/profile/NotificationSettingsView.vue'),
        meta: {
          requiresAuth: true,
          title: 'Notificaciones Push',
          subtitle: 'Configuración y pruebas de notificaciones'
        }
      },
      // Notifications
      {
        path: 'notifications',
        name: 'notifications',
        component: () => import('@/views/notifications/NotificationsView.vue'),
        meta: {
          requiresAuth: true,
          title: 'Notificaciones',
          subtitle: 'Alertas y actualizaciones'
        }
      },
      // Team routes (Supervisor & Admin)
      {
        path: 'team/overview',
        name: 'team-overview',
        component: () => import('@/views/team/TeamOverviewView.vue'),
        meta: {
          requiresAuth: true,
          requiresRole: ['supervisor', 'admin'],
          title: 'Resumen del Equipo',
          subtitle: 'Monitorea el rendimiento de tu equipo'
        }
      },
      {
        path: 'team/member/:id',
        name: 'team-member',
        component: () => import('@/views/team/TeamMemberView.vue'),
        meta: {
          requiresAuth: true,
          requiresRole: ['supervisor', 'admin'],
          title: 'Detalle del Operador'
        }
      },
      {
        path: 'team/tasks',
        name: 'team-tasks',
        component: () => import('@/views/tasks/AllTasksView.vue'),
        meta: {
          requiresAuth: true,
          requiresRole: ['supervisor', 'admin'],
          title: 'Todas las Tareas',
          subtitle: 'Gestión completa de tareas'
        }
      },
      // Admin routes
      {
        path: 'admin/dashboard',
        name: 'admin-dashboard',
        component: () => import('@/views/admin/AdminDashboardView.vue'),
        meta: {
          requiresAuth: true,
          requiresRole: ['admin'],
          title: 'Panel de Administración',
          subtitle: 'Vista general del sistema'
        }
      },
      {
        path: 'admin/users',
        name: 'admin-users',
        component: () => import('@/views/admin/UsersView.vue'),
        meta: {
          requiresAuth: true,
          requiresRole: ['admin'],
          title: 'Gestión de Usuarios',
          subtitle: 'Administración de usuarios del sistema'
        }
      },
      {
        path: 'admin/users/new',
        name: 'admin-users-create',
        component: () => import('@/views/admin/UserFormView.vue'),
        meta: {
          requiresAuth: true,
          requiresRole: ['admin'],
          title: 'Nuevo Usuario'
        }
      },
      {
        path: 'admin/users/:id/edit',
        name: 'admin-users-edit',
        component: () => import('@/views/admin/UserFormView.vue'),
        meta: {
          requiresAuth: true,
          requiresRole: ['admin'],
          title: 'Editar Usuario'
        }
      },
      {
        path: 'admin/reports',
        name: 'admin-reports',
        component: () => import('@/views/admin/ReportsView.vue'),
        meta: {
          requiresAuth: true,
          requiresRole: ['admin'],
          title: 'Reportes',
          subtitle: 'Estadísticas y análisis'
        }
      },
      {
        path: 'admin/config',
        name: 'admin-config',
        component: () => import('@/views/admin/SettingsView.vue'),
        meta: {
          requiresAuth: true,
          requiresRole: ['admin'],
          title: 'Configuración del Sistema',
          subtitle: 'Ajustes generales'
        }
      }
    ]
  },
  // 404
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated
  const userRole = authStore.userRole

  // Verificar autenticación
  if (to.meta.requiresAuth && !isAuthenticated) {
    // Ruta requiere autenticación y el usuario no está autenticado
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  // Verificar si es ruta de invitado
  if (to.meta.requiresGuest && isAuthenticated) {
    // Ruta es solo para invitados y el usuario está autenticado
    next({ name: 'tasks' })
    return
  }

  // Verificar roles requeridos
  if (to.meta.requiresRole && isAuthenticated) {
    const requiredRoles = Array.isArray(to.meta.requiresRole)
      ? to.meta.requiresRole
      : [to.meta.requiresRole]

    if (!requiredRoles.includes(userRole)) {
      // Usuario no tiene el rol requerido, redirigir a tareas
      next({ name: 'tasks' })
      return
    }
  }

  next()
})

export default router
