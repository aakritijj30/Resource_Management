import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBookings, getBooking, createBooking, cancelBooking, getAuditTrail, getDepartmentBookings, updateBooking } from '../api/bookingApi';

export function useBookings(params) {
  return useQuery({
    queryKey: ['bookings', params],
    queryFn: () => getBookings(params).then(res => res.data),
  });
}

export function useDepartmentBookings(params) {
  return useQuery({
    queryKey: ['bookings', 'department', params],
    queryFn: () => getDepartmentBookings(params).then(res => res.data),
  });
}

export function useBooking(id) {
  return useQuery({
    queryKey: ['bookings', id],
    queryFn: () => getBooking(id).then(res => res.data),
    enabled: !!id,
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createBooking,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  });
}

export function useAuditTrail(id) {
  return useQuery({
    queryKey: ['auditTrail', id],
    queryFn: () => getAuditTrail(id).then(res => res.data),
    enabled: !!id,
  });
}

export function useUpdateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateBooking(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['bookings', id.toString()] });
    },
  });
}