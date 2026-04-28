import api from './axiosInstance'

export const getMyWaitlists = () => api.get('/waitlists/mine/')
export const createWaitlist = (data) => api.post('/waitlists/', data)
export const cancelWaitlist = (id) => api.delete(`/waitlists/${id}/`)
