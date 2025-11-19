import { onMounted, onUnmounted } from 'vue'

/**
 * Detecta clicks fuera de un elemento
 * @param {Ref} elementRef - Referencia al elemento DOM
 * @param {Function} callback - Función a ejecutar cuando se hace click fuera
 */
export function useClickOutside(elementRef, callback) {
  const handleClickOutside = (event) => {
    if (elementRef.value && !elementRef.value.contains(event.target)) {
      callback()
    }
  }

  onMounted(() => {
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
  })

  onUnmounted(() => {
    document.removeEventListener('mousedown', handleClickOutside)
    document.removeEventListener('touchstart', handleClickOutside)
  })
}
