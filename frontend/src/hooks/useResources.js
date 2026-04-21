import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getResources, getResource, createResource, updateResource, deactivateResource } from '../api/resourceApi'

export function useResources(params) {
  return useQuery({ queryKey: ['resources', params], queryFn: () => getResources(params).then(r => r.data) })
}

export function useResource(id) {
  return useQuery({ queryKey: ['resource', id], queryFn: () => getResource(id).then(r => r.data), enabled: !!id })
}

export function useCreateResource() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: createResource, onSuccess: () => qc.invalidateQueries(['resources']) })
}

export function useUpdateResource() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: ({ id, data }) => updateResource(id, data), onSuccess: () => qc.invalidateQueries(['resources']) })
}

export function useDeactivateResource() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: deactivateResource, onSuccess: () => qc.invalidateQueries(['resources']) })
}
