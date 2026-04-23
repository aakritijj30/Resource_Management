import axios from './axiosInstance'

export const getNotifications = async () => {
  const { data } = await axios.get('/notifications/')
  return data
}

export const markAsRead = async (id) => {
  const { data } = await axios.patch(`/notifications/${id}`, { is_read: true })
  return data
}

export const markAllRead = async () => {
  const { data } = await axios.post('/notifications/mark-all-read')
  return data
}
