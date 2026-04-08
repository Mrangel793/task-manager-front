import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { registerSW } from 'virtual:pwa-register'
import router from './router'
import './style.css'
import App from './App.vue'
import { useAuthStore } from './stores'

// Registrar service worker para PWA
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('Nueva versión disponible. ¿Desea actualizar?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('App lista para funcionar offline')
  },
})

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)

// Manejar sesión expirada desde el interceptor de api.js
window.addEventListener('auth:session-expired', () => {
  const authStore = useAuthStore()
  authStore.isAuthenticated = false
  authStore.user = null
  authStore.token = null
  router.push('/login')
})

app.mount('#app')
