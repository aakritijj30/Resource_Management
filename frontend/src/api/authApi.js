import api from './axiosInstance'

export const login = (data) => api.post('/auth/login', data)
export const signup = (data) => api.post('/auth/signup', data)
export const checkEmail = (email) => api.get('/auth/check-email', { params: { email } })
export const getMe = () => api.get('/auth/me')
export const getDepartments = () => api.get('/departments/')
