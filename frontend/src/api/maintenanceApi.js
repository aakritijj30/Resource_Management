import api from './axiosInstance'

export const getMaintenanceBlocks = () => api.get('/maintenance/')
export const getRelevantMaintenance = () => api.get('/maintenance/relevant')
export const createMaintenanceBlock = (data) => api.post('/maintenance/', data)
export const deleteMaintenanceBlock = (id) => api.delete(`/maintenance/${id}`)
