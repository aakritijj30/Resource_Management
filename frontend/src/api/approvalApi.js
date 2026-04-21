import api from './axiosInstance'

export const getApprovalQueue = ()            => api.get('/approvals/queue')
export const getApproval      = (id)          => api.get(`/approvals/${id}`)
export const decideApproval   = (id, data)    => api.post(`/approvals/${id}/decide`, data)
