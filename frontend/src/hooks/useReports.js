import { useQuery } from '@tanstack/react-query'
import { getUsageReport, getTrends, getDeptReport } from '../api/reportApi'

export function useUsageReport(departmentId) {
  return useQuery({ queryKey: ['reports', 'usage', departmentId], queryFn: () => getUsageReport(departmentId).then(r => r.data) })
}

export function useTrends(months = 6, departmentId) {
  return useQuery({ queryKey: ['reports', 'trends', months, departmentId], queryFn: () => getTrends(months, departmentId).then(r => r.data) })
}

export function useDeptReport(departmentId) {
  return useQuery({ queryKey: ['reports', 'dept', departmentId], queryFn: () => getDeptReport(departmentId).then(r => r.data) })
}
