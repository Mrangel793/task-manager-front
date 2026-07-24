import api from './api'

export const taskCommentService = {
  async getComments(taskId) {
    const response = await api.get(`v1/tasks/${taskId}/comments`)
    return response.data.data.comments
  },

  async addComment(taskId, { body, attachment }) {
    const formData = new FormData()
    if (body) formData.append('body', body)
    if (attachment) formData.append('attachment', attachment)

    const response = await api.post(`v1/tasks/${taskId}/comments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data.data.comment
  },

  async deleteComment(taskId, commentId) {
    await api.delete(`v1/tasks/${taskId}/comments/${commentId}`)
  },
}
