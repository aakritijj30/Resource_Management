import api from './axiosInstance'

export const getUsageReport  = (department_id)          => api.get('/reports/usage', { params: { department_id } })
export const getTrends       = (months=6, department_id) => api.get('/reports/trends', { params: { months, department_id } })
export const getDeptReport   = (department_id)          => api.get('/reports/dept', { params: { department_id } })
