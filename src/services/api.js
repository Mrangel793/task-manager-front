import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - Agregar token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Manejar errores y refresh token
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Manejar error 401 (no autorizado)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const currentToken = localStorage.getItem('accessToken')

        if (!currentToken) {
          throw new Error('No access token available')
        }

        // Intentar refrescar el token (Sanctum usa el token actual para generar uno nuevo)
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}v1/auth/refresh-token/`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${currentToken}`
            }
          }
        )

        // El backend envuelve la respuesta en { success, message, data }
        const responseData = response.data.data || response.data
        const newAccessToken = responseData.access_token

        if (newAccessToken) {
          // Guardar nuevo token
          localStorage.setItem('accessToken', newAccessToken)

          // Reintentar la petición original con el nuevo token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          return api(originalRequest)
        } else {
          throw new Error('No new token received')
        }
      } catch (refreshError) {
        // Si falla el refresh, hacer logout
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')

        // Redirigir al login
        window.location.href = '/login'

        return Promise.reject(refreshError)
      }
    }

    // Manejar otros errores
    console.error('API Error:', error.response?.data)

    let errorMessage = 'Error desconocido'

    if (error.response?.data?.message) {
      // Mensaje de error principal
      errorMessage = error.response.data.message
    } else if (error.response?.data?.detail) {
      // FastAPI devuelve errores de validación en 'detail'
      if (Array.isArray(error.response.data.detail)) {
        // Errores de validación múltiples
        errorMessage = error.response.data.detail.map(err =>
          `${err.loc ? err.loc.join('.') + ': ' : ''}${err.msg}`
        ).join(', ')
      } else if (typeof error.response.data.detail === 'string') {
        errorMessage = error.response.data.detail
      } else {
        errorMessage = JSON.stringify(error.response.data.detail)
      }
    } else if (error.message) {
      errorMessage = error.message
    }

    return Promise.reject({
      status: error.response?.status,
      message: errorMessage,
      data: error.response?.data
    })
  }
)

export default api
