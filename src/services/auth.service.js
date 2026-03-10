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

    const organization = responseData.organization
    if (organization) {
      localStorage.setItem('organization', JSON.stringify(organization))
    }

    // Devolver en formato camelCase para consistencia
    return {
      accessToken,
      user,
      tokenType,
      organization
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

    const organization = responseData.organization
    if (organization) {
      localStorage.setItem('organization', JSON.stringify(organization))
    }

    return {
      accessToken,
      user,
      tokenType,
      organization
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
      localStorage.removeItem('organization')
    }
  },

  /**
   * Obtener información del usuario autenticado
   */
  async getMe() {
    const response = await api.get('v1/auth/me/')

    const userData = response.data
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData))
      // Organization puede venir dentro de la respuesta de /me
      if (userData.organization) {
        localStorage.setItem('organization', JSON.stringify(userData.organization))
      }
    }

    return userData
  },

  /**
   * Obtener usuario actual del localStorage
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  /**
   * Obtener organización actual del localStorage
   */
  getCurrentOrganization() {
    const orgStr = localStorage.getItem('organization')
    return orgStr ? JSON.parse(orgStr) : null
  },

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated() {
    return !!localStorage.getItem('accessToken')
  },

  /**
   * Cambiar contraseña
   */
  async changePassword(passwordData) {
    const response = await api.post('v1/auth/change-password/', passwordData)
    return response.data
  },

  /**
   * Actualizar perfil del usuario autenticado
   */
  async updateProfile(profileData) {
    const response = await api.patch('v1/auth/me/', profileData)

    // El backend puede envolver la respuesta en { success, message, data }
    const updatedUser = response.data.data || response.data

    // Actualizar el usuario en localStorage
    if (updatedUser) {
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }

    return updatedUser
  }
}
