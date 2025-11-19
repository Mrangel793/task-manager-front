import * as yup from 'yup'

// Validación de teléfono en formato E.164 (internacional)
const phoneRegex = /^\+[1-9]\d{1,14}$/

// Schema de login
export const loginSchema = yup.object({
  email: yup
    .string()
    .required('El correo electrónico es requerido')
    .email('El correo electrónico debe ser válido'),
  password: yup
    .string()
    .required('La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
})

// Schema de registro
export const registerSchema = yup.object({
  name: yup
    .string()
    .required('El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede tener más de 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras'),
  email: yup
    .string()
    .required('El correo electrónico es requerido')
    .email('El correo electrónico debe ser válido')
    .max(255, 'El correo electrónico no puede tener más de 255 caracteres'),
  phone: yup
    .string()
    .nullable()
    .test('phone-format', 'Número de teléfono inválido (formato: +573001234567)', function(value) {
      // Si está vacío, es válido (campo opcional)
      if (!value || value === '') return true
      // Si tiene valor, debe cumplir el formato E.164
      return phoneRegex.test(value)
    }),
  password: yup
    .string()
    .required('La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña no puede tener más de 100 caracteres')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    ),
  confirmPassword: yup
    .string()
    .required('Debes confirmar tu contraseña')
    .oneOf([yup.ref('password')], 'Las contraseñas no coinciden'),
  acceptTerms: yup
    .boolean()
    .oneOf([true], 'Debes aceptar los términos y condiciones')
})

// Función para validar fuerza de contraseña
export const getPasswordStrength = (password) => {
  if (!password) return { strength: 0, label: '', color: '' }

  let strength = 0
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  }

  // Calcular puntuación
  if (checks.length) strength++
  if (checks.lowercase) strength++
  if (checks.uppercase) strength++
  if (checks.number) strength++
  if (checks.special) strength++

  // Determinar nivel
  if (strength <= 2) {
    return { strength: 1, label: 'Débil', color: 'red' }
  } else if (strength === 3) {
    return { strength: 2, label: 'Media', color: 'yellow' }
  } else if (strength === 4) {
    return { strength: 3, label: 'Buena', color: 'blue' }
  } else {
    return { strength: 4, label: 'Fuerte', color: 'green' }
  }
}

// Schema de tarea
export const taskSchema = yup.object({
  title: yup
    .string()
    .required('El título es requerido')
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(255, 'El título no puede tener más de 255 caracteres'),
  description: yup
    .string()
    .max(1000, 'La descripción no puede tener más de 1000 caracteres'),
  due_date: yup
    .string()
    .required('La fecha es requerida')
    .test('is-future', 'La fecha debe ser hoy o futura', function(value) {
      if (!value) return false
      const inputDate = new Date(value)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return inputDate >= today
    }),
  due_time: yup
    .string()
    .nullable()
    .test('valid-time', 'Formato de hora inválido', function(value) {
      // Si está vacío, es válido (campo opcional)
      if (!value || value === '') return true
      // Validar formato HH:MM (input type="time" siempre devuelve este formato)
      return /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(value)
    }),
  priority: yup
    .string()
    .required('La prioridad es requerida')
    .oneOf(['Baja', 'Media', 'Alta'], 'La prioridad debe ser: Baja, Media o Alta'),
  assignee_id: yup
    .mixed()
    .nullable()
    .test('required-assignee', 'Debe asignar la tarea a un operador', function(value) {
      // Permitir null, pero si hay un valor, debe ser válido
      // El backend manejará el caso cuando es null para operarios
      return value !== undefined && value !== ''
    })
})

// Validar un solo campo
export const validateField = async (schema, fieldName, value) => {
  try {
    await schema.validateAt(fieldName, { [fieldName]: value })
    return { isValid: true, error: null }
  } catch (error) {
    return { isValid: false, error: error.message }
  }
}
