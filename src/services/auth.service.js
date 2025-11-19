import api from './api'

export const authService = {
  /**
   * Iniciar sesión
   */
  async login(credentials) {
    const response = await api.post('v1/auth/login/', credentials)

    // El backend envuelve la respuesta en { success, message, data }
    const responseData = response.data.data || response.data

    // Extraer access_token de la estructura correcta
    const accessToken = responseData.access_token
    const user = responseData.user
    const tokenType = responseData.token_type || 'Bearer'

    if (accessToken && user) {
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('user', JSON.stringify(user))
    }

    // Devolver en formato camelCase para consistencia
    return {
      accessToken,
      user,
      tokenType
    }
  },

  /**
   * Registrar nuevo usuario
   */
  async register(userData) {
    const response = await api.post('v1/auth/register/', userData)

    // El backend envuelve la respuesta en { success, message, data }
    const responseData = response.data.data || response.data

    // Con email-based auth, el usuario recibe el token inmediatamente
    const accessToken = responseData.access_token
    const user = responseData.user
    const tokenType = responseData.token_type || 'Bearer'

    if (accessToken && user) {
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('user', JSON.stringify(user))
    }

    return {
      accessToken,
      user,
      tokenType
    }
  },

  /**
   * Verificar código de verificación
   */
  async verifyCode(verificationData) {
    const response = await api.post('v1/auth/verify/', verificationData)

    // El backend envuelve la respuesta en { success, message, data }
    const responseData = response.data.data || response.data

    // Extraer access_token de la estructura correcta
    const accessToken = responseData.access_token
    const user = responseData.user
    const tokenType = responseData.token_type || 'Bearer'

    if (accessToken && user) {
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('user', JSON.stringify(user))
    }

    // Devolver en formato camelCase para consistencia
    return {
      accessToken,
      user,
      tokenType
    }
  },

  /**
   * Reenviar código de verificación
   */
  async resendCode(phone) {
    const response = await api.post('v1/auth/resend/', { phone })

    // El backend envuelve la respuesta en { success, message, data }
    const responseData = response.data.data || response.data

    return responseData
  },

  /**
   * Cerrar sesión
   */
  async logout() {
    try {
      await api.post('v1/auth/logout/')
    } catch (error) {
      console.error('Error during logout:', error)
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
    }
  },

  /**
   * Obtener información del usuario autenticado
   */
  async getMe() {
    const response = await api.get('v1/auth/me/')

    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data))
    }

    return response.data
  },

  /**
   * Obtener usuario actual del localStorage
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated() {
    return !!localStorage.getItem('accessToken')
  }
}
