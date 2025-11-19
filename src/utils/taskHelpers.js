/**
 * Utilidades para manejo de tareas
 */

// Estados disponibles de tareas (valores en español como espera el backend)
export const TASK_STATUSES = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En Progreso',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada'
}

// Prioridades de tareas
export const TASK_PRIORITIES = {
  BAJA: 'Baja',
  MEDIA: 'Media',
  ALTA: 'Alta'
}

// Configuración de estados
export const STATUS_CONFIG = {
  [TASK_STATUSES.PENDING]: {
    label: 'Pendiente',
    color: 'yellow',
    bgClass: 'bg-yellow-100',
    textClass: 'text-yellow-800',
    borderClass: 'border-yellow-300',
    badgeClass: 'bg-yellow-100 text-yellow-800',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  [TASK_STATUSES.IN_PROGRESS]: {
    label: 'En Progreso',
    color: 'blue',
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-800',
    borderClass: 'border-blue-300',
    badgeClass: 'bg-blue-100 text-blue-800',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z'
  },
  [TASK_STATUSES.COMPLETED]: {
    label: 'Completada',
    color: 'green',
    bgClass: 'bg-green-100',
    textClass: 'text-green-800',
    borderClass: 'border-green-300',
    badgeClass: 'bg-green-100 text-green-800',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  [TASK_STATUSES.CANCELLED]: {
    label: 'Cancelada',
    color: 'gray',
    bgClass: 'bg-gray-100',
    textClass: 'text-gray-800',
    borderClass: 'border-gray-300',
    badgeClass: 'bg-gray-100 text-gray-800',
    icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
  }
}

// Configuración de prioridades
export const PRIORITY_CONFIG = {
  [TASK_PRIORITIES.BAJA]: {
    label: 'Baja',
    color: 'blue',
    bgClass: 'bg-blue-500',
    textClass: 'text-blue-700',
    badgeClass: 'bg-blue-100 text-blue-800',
    order: 1
  },
  [TASK_PRIORITIES.MEDIA]: {
    label: 'Media',
    color: 'yellow',
    bgClass: 'bg-yellow-500',
    textClass: 'text-yellow-700',
    badgeClass: 'bg-yellow-100 text-yellow-800',
    order: 2
  },
  [TASK_PRIORITIES.ALTA]: {
    label: 'Alta',
    color: 'red',
    bgClass: 'bg-red-500',
    textClass: 'text-red-700',
    badgeClass: 'bg-red-100 text-red-800',
    order: 3
  }
}

// Niveles de urgencia
export const URGENCY_LEVELS = {
  OVERDUE: 'overdue',
  URGENT: 'urgent',
  SOON: 'soon',
  NORMAL: 'normal'
}

/**
 * Obtiene la configuración de un estado
 */
export function getStatusConfig(status) {
  return STATUS_CONFIG[status] || STATUS_CONFIG[TASK_STATUSES.PENDING]
}

/**
 * Obtiene la configuración de una prioridad
 */
export function getPriorityConfig(priority) {
  return PRIORITY_CONFIG[priority] || PRIORITY_CONFIG[TASK_PRIORITIES.MEDIA]
}

/**
 * Calcula el nivel de urgencia de una tarea basado en su fecha límite
 */
export function getTaskUrgency(task) {
  // Si está completada o cancelada, no es urgente
  if (task.status === TASK_STATUSES.COMPLETED || task.status === TASK_STATUSES.CANCELLED) {
    return {
      level: URGENCY_LEVELS.NORMAL,
      message: '',
      cardClass: '',
      textClass: ''
    }
  }

  if (!task.due_date) {
    return {
      level: URGENCY_LEVELS.NORMAL,
      message: '',
      cardClass: '',
      textClass: ''
    }
  }

  const now = new Date()
  const dueDate = new Date(task.due_date)

  // Si tiene hora, combinarla
  if (task.due_time) {
    const [hours, minutes] = task.due_time.split(':')
    dueDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0)
  } else {
    // Si no tiene hora, usar fin del día
    dueDate.setHours(23, 59, 59, 999)
  }

  const diffMs = dueDate - now
  const diffHours = diffMs / (1000 * 60 * 60)
  const diffDays = diffMs / (1000 * 60 * 60 * 24)

  // Vencida
  if (diffMs < 0) {
    const overdueDays = Math.abs(Math.floor(diffDays))
    return {
      level: URGENCY_LEVELS.OVERDUE,
      message: overdueDays === 0 ? 'Vencida hoy' : `Vencida hace ${overdueDays} ${overdueDays === 1 ? 'día' : 'días'}`,
      cardClass: 'border-2 border-red-500 bg-red-50',
      textClass: 'text-red-700',
      badgeClass: 'bg-red-600 text-white'
    }
  }

  // Vence en menos de 24 horas (urgente)
  if (diffHours <= 24) {
    const hoursLeft = Math.ceil(diffHours)
    return {
      level: URGENCY_LEVELS.URGENT,
      message: hoursLeft <= 1 ? 'Vence en menos de 1 hora' : `Vence en ${hoursLeft} horas`,
      cardClass: 'border-2 border-orange-500 bg-orange-50',
      textClass: 'text-orange-700',
      badgeClass: 'bg-orange-600 text-white'
    }
  }

  // Vence en menos de 48 horas (pronto)
  if (diffHours <= 48) {
    const hoursLeft = Math.ceil(diffHours)
    return {
      level: URGENCY_LEVELS.SOON,
      message: `Vence en ${hoursLeft} horas`,
      cardClass: 'border border-yellow-400 bg-yellow-50',
      textClass: 'text-yellow-700',
      badgeClass: 'bg-yellow-500 text-white'
    }
  }

  // Normal
  return {
    level: URGENCY_LEVELS.NORMAL,
    message: '',
    cardClass: '',
    textClass: ''
  }
}

/**
 * Formatea la fecha de vencimiento
 */
export function formatDueDate(dueDate, dueTime) {
  if (!dueDate) return 'Sin fecha'

  const date = new Date(dueDate)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)

  let dateStr = ''

  // Hoy
  if (date >= today && date < tomorrow) {
    dateStr = 'Hoy'
  }
  // Mañana
  else if (date >= tomorrow && date < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)) {
    dateStr = 'Mañana'
  }
  // Otra fecha
  else {
    dateStr = date.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  // Agregar hora si existe
  if (dueTime) {
    return `${dateStr} • ${dueTime}`
  }

  return dateStr
}

/**
 * Obtiene el siguiente estado disponible
 */
export function getNextStatus(currentStatus) {
  const statusFlow = {
    [TASK_STATUSES.PENDING]: TASK_STATUSES.IN_PROGRESS,
    [TASK_STATUSES.IN_PROGRESS]: TASK_STATUSES.COMPLETED,
    [TASK_STATUSES.COMPLETED]: null,
    [TASK_STATUSES.CANCELLED]: null
  }

  return statusFlow[currentStatus]
}

/**
 * Obtiene todos los estados disponibles
 */
export function getAvailableStatuses() {
  return Object.values(TASK_STATUSES).map(status => ({
    value: status,
    ...STATUS_CONFIG[status]
  }))
}

/**
 * Verifica si una tarea puede cambiar a un estado específico
 */
export function canChangeToStatus(task, newStatus, userRole, userId) {
  // Admin y supervisor pueden cambiar a cualquier estado
  if (userRole === 'admin' || userRole === 'supervisor') {
    return true
  }

  // Operario solo puede cambiar si está asignado
  if (userRole === 'operario' || userRole === 'operador') {
    // Soportar diferentes estructuras de datos del backend
    const assigneeId = task.assignee?.id || task.assignee_id || task.assigned_to
    const isAssigned = assigneeId === userId

    if (!isAssigned) {
      return false
    }

    // No puede cancelar tareas
    if (newStatus === TASK_STATUSES.CANCELLED) {
      return false
    }

    return true
  }

  return false
}

/**
 * Ordena tareas por urgencia y prioridad
 */
export function sortTasksByUrgency(tasks) {
  return [...tasks].sort((a, b) => {
    const urgencyA = getTaskUrgency(a)
    const urgencyB = getTaskUrgency(b)

    // Orden de urgencia
    const urgencyOrder = {
      [URGENCY_LEVELS.OVERDUE]: 4,
      [URGENCY_LEVELS.URGENT]: 3,
      [URGENCY_LEVELS.SOON]: 2,
      [URGENCY_LEVELS.NORMAL]: 1
    }

    const urgencyDiff = urgencyOrder[urgencyB.level] - urgencyOrder[urgencyA.level]
    if (urgencyDiff !== 0) return urgencyDiff

    // Si tienen la misma urgencia, ordenar por prioridad
    const priorityA = getPriorityConfig(a.priority)
    const priorityB = getPriorityConfig(b.priority)

    return priorityB.order - priorityA.order
  })
}

/**
 * Filtra tareas por estado
 */
export function filterTasksByStatus(tasks, status) {
  if (!status || status === 'all') return tasks
  return tasks.filter(task => task.status === status)
}

/**
 * Obtiene estadísticas de tareas
 */
export function getTaskStats(tasks) {
  const stats = {
    total: tasks.length,
    pending: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    overdue: 0,
    urgent: 0
  }

  tasks.forEach(task => {
    // Por estado
    if (task.status === TASK_STATUSES.PENDING) stats.pending++
    else if (task.status === TASK_STATUSES.IN_PROGRESS) stats.inProgress++
    else if (task.status === TASK_STATUSES.COMPLETED) stats.completed++
    else if (task.status === TASK_STATUSES.CANCELLED) stats.cancelled++

    // Por urgencia
    const urgency = getTaskUrgency(task)
    if (urgency.level === URGENCY_LEVELS.OVERDUE) stats.overdue++
    else if (urgency.level === URGENCY_LEVELS.URGENT) stats.urgent++
  })

  stats.completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  return stats
}
