import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(authService.getCurrentUser())
  const token = ref(localStorage.getItem('accessToken'))
  const isAuthenticated = ref(!!localStorage.getItem('accessToken'))
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const currentUser = computed(() => user.value)
  const userName = computed(() => user.value?.name || '')
  const userEmail = computed(() => user.value?.email || '')
  const userPhone = computed(() => user.value?.phone || '')
  const userRole = computed(() => {
    if (!user.value?.role) return 'user'

    // Normalizar el rol del backend (puede venir en español o inglés)
    const role = user.value.role.toLowerCase()

    // Mapeo de roles en español a inglés
    const roleMap = {
      'administrador': 'admin',
      'admin': 'admin',
      'supervisor': 'supervisor',
      'operador': 'operario',
      'operario': 'operario'
    }

    return roleMap[role] || 'user'
  })

  // Actions
  async function login(credentials) {
    loading.value = true
    error.value = null

    try {
      const data = await authService.login(credentials)
      user.value = data.user
      token.value = data.accessToken
      isAuthenticated.value = true
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function register(userData) {
    loading.value = true
    error.value = null

    try {
      const data = await authService.register(userData)
      // Con email-based auth, el usuario está autenticado inmediatamente
      user.value = data.user
      token.value = data.accessToken
      isAuthenticated.value = true
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    error.value = null

    try {
      await authService.logout()
      user.value = null
      token.value = null
      isAuthenticated.value = false
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function getMe() {
    loading.value = true
    error.value = null

    try {
      const data = await authService.getMe()
      user.value = data
      return data
    } catch (err) {
      error.value = err.message
      // Si falla getMe, probablemente el token expiró
      user.value = null
      token.value = null
      isAuthenticated.value = false
      throw err
    } finally {
      loading.value = false
    }
  }

  async function verifyCode(verificationData) {
    loading.value = true
    error.value = null

    try {
      const data = await authService.verifyCode(verificationData)
      user.value = data.user
      token.value = data.accessToken
      isAuthenticated.value = true
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function resendCode(phone) {
    loading.value = true
    error.value = null

    try {
      const data = await authService.resendCode(phone)
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    user,
    token,
    isAuthenticated,
    loading,
    error,
    // Getters
    currentUser,
    userName,
    userEmail,
    userPhone,
    userRole,
    // Actions
    login,
    register,
    logout,
    getMe,
    verifyCode,
    resendCode,
    clearError
  }
})
