import api from './axiosInstance'

export const getBookings   = (params) => api.get('/bookings', { params })
export const getBooking    = (id)     => api.get(`/bookings/${id}`)
export const createBooking = (data)   => api.post('/bookings', data)
export const cancelBooking = (id)     => api.patch(`/bookings/${id}/cancel`)
export const getAuditTrail = (id)     => api.get(`/bookings/${id}/audit`)
