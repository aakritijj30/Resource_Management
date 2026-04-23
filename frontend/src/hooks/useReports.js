import { useQuery } from '@tanstack/react-query'
import { getUsageReport, getTrends, getDeptReport } from '../api/reportApi'

export function useUsageReport() {
  return useQuery({
    queryKey: ['reports', 'usage'],
    queryFn: () => getUsageReport().then(r => r.data),
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  })
}

export function useTrends(months = 6) {
  return useQuery({
    queryKey: ['reports', 'trends', months],
    queryFn: () => getTrends(months).then(r => r.data),
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  })
}

export function useDeptReport() {
  return useQuery({
    queryKey: ['reports', 'dept'],
    queryFn: () => getDeptReport().then(r => r.data),
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  })
}
