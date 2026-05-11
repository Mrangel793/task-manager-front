import api from './api'

export const googleCalendarService = {
  async getStatus() {
    const response = await api.get('/v1/google-calendar/status')
    return response.data
  },

  async getConnectUrl() {
    const response = await api.get('/v1/google-calendar/connect')
    return response.data.url
  },

  async disconnect() {
    const response = await api.delete('/v1/google-calendar/disconnect')
    return response.data
  },
}
