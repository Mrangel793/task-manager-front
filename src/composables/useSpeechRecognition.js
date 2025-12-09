import { ref, onUnmounted } from 'vue'

/**
 * Composable para reconocimiento de voz usando Web Speech API
 * @returns {Object} Estado y métodos del reconocimiento de voz
 */
export function useSpeechRecognition() {
  const isListening = ref(false)
  const isSupported = ref(false)
  const transcript = ref('')
  const error = ref(null)

  let recognition = null

  // Verificar soporte del navegador
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

  if (SpeechRecognition) {
    isSupported.value = true
    recognition = new SpeechRecognition()

    // Configuración
    recognition.continuous = false // Detener después de un resultado
    recognition.interimResults = true // Obtener resultados intermedios
    recognition.lang = 'es-ES' // Idioma español
    recognition.maxAlternatives = 1

    // Eventos
    recognition.onstart = () => {
      isListening.value = true
      error.value = null
      transcript.value = ''
      console.log('[Voice] Escuchando...')
    }

    recognition.onresult = (event) => {
      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPart
        } else {
          interimTranscript += transcriptPart
        }
      }

      // Solo actualizar con resultado final para evitar duplicados
      // Los resultados intermedios solo se muestran en consola
      if (finalTranscript) {
        transcript.value = finalTranscript
        console.log('[Voice] Transcripción final:', transcript.value)
      } else {
        console.log('[Voice] Transcripción intermedia:', interimTranscript)
      }
    }

    recognition.onerror = (event) => {
      console.error('[Voice] Error:', event.error)
      isListening.value = false

      switch (event.error) {
        case 'no-speech':
          error.value = 'No se detectó voz. Intenta de nuevo.'
          break
        case 'audio-capture':
          error.value = 'No se pudo acceder al micrófono.'
          break
        case 'not-allowed':
          error.value = 'Permiso de micrófono denegado.'
          break
        case 'network':
          error.value = 'Error de red. Verifica tu conexión.'
          break
        default:
          error.value = `Error: ${event.error}`
      }
    }

    recognition.onend = () => {
      isListening.value = false
      console.log('[Voice] Detenido')
    }
  } else {
    console.warn('[Voice] API de reconocimiento de voz no soportada en este navegador')
  }

  /**
   * Inicia el reconocimiento de voz
   */
  const start = () => {
    if (!isSupported.value) {
      error.value = 'Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.'
      return
    }

    if (isListening.value) {
      return
    }

    try {
      transcript.value = ''
      error.value = null
      recognition.start()
    } catch (err) {
      console.error('[Voice] Error al iniciar:', err)
      error.value = 'Error al iniciar el reconocimiento de voz'
      isListening.value = false
    }
  }

  /**
   * Detiene el reconocimiento de voz
   */
  const stop = () => {
    if (!isListening.value || !recognition) {
      return
    }

    try {
      recognition.stop()
    } catch (err) {
      console.error('[Voice] Error al detener:', err)
    }
  }

  /**
   * Resetea el estado
   */
  const reset = () => {
    transcript.value = ''
    error.value = null
  }

  // Limpiar al desmontar
  onUnmounted(() => {
    if (recognition && isListening.value) {
      recognition.stop()
    }
  })

  return {
    isListening,
    isSupported,
    transcript,
    error,
    start,
    stop,
    reset
  }
}
