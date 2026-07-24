<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden flex flex-col" style="height: 480px">
    <!-- Header -->
    <div class="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-4 flex-shrink-0">
      <h2 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        Comentarios
        <span v-if="comments.length" class="text-sm font-normal text-gray-500">({{ comments.length }})</span>
      </h2>
    </div>

    <!-- Messages list -->
    <div ref="messagesEl" class="flex-1 overflow-y-auto p-4 space-y-4">
      <!-- Loading -->
      <div v-if="loading" class="flex justify-center items-center h-full">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>

      <!-- Empty -->
      <div v-else-if="!comments.length" class="flex flex-col items-center justify-center h-full text-gray-400">
        <svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p class="text-sm">Sé el primero en comentar</p>
      </div>

      <!-- Comments -->
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="flex gap-3"
        :class="isOwn(comment) ? 'flex-row-reverse' : ''"
      >
        <!-- Avatar -->
        <div
          class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
          :class="isOwn(comment) ? 'bg-primary-600' : 'bg-gray-400'"
        >
          {{ initials(comment.user) }}
        </div>

        <!-- Bubble -->
        <div class="max-w-xs sm:max-w-sm lg:max-w-md space-y-1" :class="isOwn(comment) ? 'items-end' : 'items-start'">
          <!-- Name + time -->
          <div class="flex items-center gap-2" :class="isOwn(comment) ? 'flex-row-reverse' : ''">
            <span class="text-xs font-medium text-gray-700">{{ comment.user?.name }}</span>
            <span class="text-xs text-gray-400">{{ formatTime(comment.created_at) }}</span>
          </div>

          <!-- Content -->
          <div
            class="rounded-2xl px-4 py-2 shadow-sm"
            :class="isOwn(comment)
              ? 'bg-primary-600 text-white rounded-tr-none'
              : 'bg-gray-100 text-gray-900 rounded-tl-none'"
          >
            <p v-if="comment.body" class="text-sm whitespace-pre-wrap break-words">{{ comment.body }}</p>

            <!-- Attachment -->
            <div v-if="comment.attachment_path" class="mt-2">
              <img
                :src="storageUrl(comment.attachment_path)"
                alt="Adjunto"
                class="rounded-lg max-h-48 cursor-pointer object-cover w-full"
                @click="openImage(storageUrl(comment.attachment_path))"
              />
            </div>
          </div>

          <!-- Delete button (own comments) -->
          <button
            v-if="isOwn(comment) || canDeleteAny"
            @click="handleDelete(comment)"
            class="text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- Input area -->
    <div class="flex-shrink-0 border-t border-gray-200 p-3 bg-gray-50">
      <!-- Image preview -->
      <div v-if="previewUrl" class="mb-2 relative inline-block">
        <img :src="previewUrl" class="h-20 rounded-lg object-cover border border-gray-300" />
        <button
          @click="clearAttachment"
          class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
        >
          ×
        </button>
      </div>

      <div class="flex items-end gap-2">
        <!-- Attach image -->
        <label class="flex-shrink-0 cursor-pointer p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-200 rounded-full transition-colors" title="Adjuntar pantallazo">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <input
            ref="fileInput"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            class="hidden"
            @change="handleFileChange"
          />
        </label>

        <!-- Text input -->
        <textarea
          v-model="newBody"
          placeholder="Escribe un comentario..."
          rows="1"
          class="flex-1 resize-none rounded-2xl border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
          style="max-height: 96px; overflow-y: auto"
          @input="autoResize"
          @keydown.enter.exact.prevent="submit"
        ></textarea>

        <!-- Send -->
        <button
          @click="submit"
          :disabled="sending || (!newBody.trim() && !selectedFile)"
          class="flex-shrink-0 p-2 rounded-full bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <svg v-if="!sending" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          <div v-else class="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
        </button>
      </div>
    </div>

    <!-- Lightbox -->
    <div
      v-if="lightboxUrl"
      class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      @click="lightboxUrl = null"
    >
      <img :src="lightboxUrl" class="max-w-full max-h-full rounded-lg shadow-2xl object-contain" @click.stop />
      <button
        class="absolute top-4 right-4 text-white text-3xl leading-none hover:text-gray-300"
        @click="lightboxUrl = null"
      >×</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'
import { useAuthStore } from '@/stores'
import { taskCommentService } from '@/services'
import { useToast } from '@/composables/useToast'

const props = defineProps({
  taskId: { type: String, required: true },
})

const authStore = useAuthStore()
const toast = useToast()

const comments = ref([])
const loading = ref(false)
const sending = ref(false)
const newBody = ref('')
const selectedFile = ref(null)
const previewUrl = ref(null)
const lightboxUrl = ref(null)
const messagesEl = ref(null)
const fileInput = ref(null)

// Construye la URL de storage a partir de VITE_API_URL (https://host/api → https://host/storage/)
const storageBase = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') + '/storage/'
const storageUrl = (path) => storageBase + path

const canDeleteAny = computed(() => {
  const role = authStore.userRole
  return role === 'admin' || role === 'supervisor'
})

const isOwn = (comment) => comment.user_id === authStore.currentUser?.id

const initials = (user) => {
  if (!user?.name) return '?'
  return user.name.split(' ').slice(0, 2).map(w => w[0].toUpperCase()).join('')
}

const formatTime = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return 'ahora'
  if (minutes < 60) return `hace ${minutes}m`
  if (hours < 24) return `hace ${hours}h`
  if (days < 7) return `hace ${days}d`
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesEl.value) {
    messagesEl.value.scrollTop = messagesEl.value.scrollHeight
  }
}

const loadComments = async () => {
  loading.value = true
  try {
    comments.value = await taskCommentService.getComments(props.taskId)
    await scrollToBottom()
  } catch {
    toast.error('Error al cargar comentarios')
  } finally {
    loading.value = false
  }
}

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
}

const clearAttachment = () => {
  selectedFile.value = null
  previewUrl.value = null
  if (fileInput.value) fileInput.value.value = ''
}

const autoResize = (e) => {
  e.target.style.height = 'auto'
  e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px'
}

const submit = async () => {
  if (sending.value) return
  if (!newBody.value.trim() && !selectedFile.value) return

  sending.value = true
  try {
    const comment = await taskCommentService.addComment(props.taskId, {
      body: newBody.value.trim() || null,
      attachment: selectedFile.value,
    })
    comments.value.push(comment)
    newBody.value = ''
    clearAttachment()
    await scrollToBottom()
  } catch (err) {
    toast.error(err?.message || 'Error al enviar el comentario')
  } finally {
    sending.value = false
  }
}

const handleDelete = async (comment) => {
  if (!confirm('¿Eliminar este comentario?')) return
  try {
    await taskCommentService.deleteComment(props.taskId, comment.id)
    comments.value = comments.value.filter(c => c.id !== comment.id)
  } catch {
    toast.error('Error al eliminar el comentario')
  }
}

const openImage = (url) => {
  lightboxUrl.value = url
}

onMounted(loadComments)
</script>
