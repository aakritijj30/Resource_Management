import api from './axiosInstance'

export const getBookings   = (params) => api.get('/bookings/', { params })
export const getBooking    = (id)     => api.get(`/bookings/${id}/`)
export const createBooking = (data)   => api.post('/bookings/', data)
export const cancelBooking = (id)     => api.patch(`/bookings/${id}/cancel`)
export const checkInBooking = (id)    => api.patch(`/bookings/${id}/check-in`)
export const markNoShow = (id)        => api.patch(`/bookings/${id}/mark-no-show`)
export const getDepartmentBookings = (params) => api.get('/bookings/department/', { params })
export const getAuditTrail = (id)     => api.get(`/bookings/${id}/audit`)
export const updateBooking = (id, data) => api.patch(`/bookings/${id}`, data)
