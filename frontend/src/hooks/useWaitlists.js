import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cancelWaitlist, createWaitlist, getMyWaitlists } from '../api/waitlistApi'

export function useMyWaitlists() {
  return useQuery({
    queryKey: ['waitlists', 'mine'],
    queryFn: () => getMyWaitlists().then(res => res.data),
  })
}

export function useCreateWaitlist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createWaitlist,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['waitlists'] })
      qc.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useCancelWaitlist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: cancelWaitlist,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['waitlists'] }),
  })
}
