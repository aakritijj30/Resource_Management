import api from './axiosInstance'

export const getUsageReport  = ()          => api.get('/reports/usage')
export const getTrends       = (months=6)  => api.get('/reports/trends', { params: { months } })
export const getDeptReport   = ()          => api.get('/reports/dept')
