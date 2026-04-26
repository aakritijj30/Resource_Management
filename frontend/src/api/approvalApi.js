import api from './axiosInstance'

export const getApprovalQueue   = ()            => api.get('/approvals/queue/')
export const getApprovalHistory = ()            => api.get('/approvals/history/')
export const getApproval      = (id)          => api.get(`/approvals/${id}/`)
export const decideApproval   = (id, data)    => api.post(`/approvals/${id}/decide/`, data)
