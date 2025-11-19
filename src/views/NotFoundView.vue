<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <h1 class="text-9xl font-bold text-primary-600">404</h1>
      <h2 class="mt-4 text-3xl font-bold text-gray-900">Página no encontrada</h2>
      <p class="mt-2 text-gray-600">Lo sentimos, la página que buscas no existe.</p>
      <div class="mt-6">
        <router-link
          to="/"
          class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Volver al inicio
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
// Vista 404
</script>
