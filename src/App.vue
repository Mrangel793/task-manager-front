<template>
  <div id="app">
    <router-view />
    <ToastContainer />
  </div>
</template>

<script setup>
import ToastContainer from '@/components/common/ToastContainer.vue'

// Aplicar tamaño de texto guardado al iniciar la app
const textSizeMap = { small: '14px', normal: '16px', large: '18px', xlarge: '20px' }
const savedTextSize = localStorage.getItem('app_text_size')
if (savedTextSize && textSizeMap[savedTextSize]) {
  document.documentElement.style.fontSize = textSizeMap[savedTextSize]
}
</script>

<style>
/* Estilos globales si son necesarios */
</style>
