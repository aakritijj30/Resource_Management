import api from './axiosInstance'

export const getDepartments = () => api.get('/departments')
