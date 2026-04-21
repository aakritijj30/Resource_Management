import api from './axiosInstance'

export const getResources  = (params) => api.get('/resources', { params })
export const getResource   = (id)     => api.get(`/resources/${id}`)
export const createResource = (data)  => api.post('/resources', data)
export const updateResource = (id, data) => api.patch(`/resources/${id}`, data)
export const deactivateResource = (id) => api.delete(`/resources/${id}`)
export const getPolicy     = (id)     => api.get(`/resources/${id}/policy`)
export const setPolicy     = (id, data) => api.put(`/resources/${id}/policy`, data)
