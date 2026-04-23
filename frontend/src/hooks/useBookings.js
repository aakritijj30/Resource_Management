import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBookings, getDepartmentBookings, getBooking, createBooking, updateBooking, cancelBooking, getAuditTrail } from '../api/bookingApi';

function invalidateBookingCaches(qc) {
  qc.invalidateQueries({ queryKey: ['bookings'] });
  qc.invalidateQueries({ queryKey: ['all-bookings'] });
  qc.invalidateQueries({ queryKey: ['auditTrail'] });
  qc.invalidateQueries({ queryKey: ['approvals'] });
  qc.invalidateQueries({ queryKey: ['reports'] });
}

export function useBookings(params) {
  return useQuery({
    queryKey: ['bookings', params],
    queryFn: () => getBookings(params).then(res => res.data),
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });
}

export function useDepartmentBookings(params) {
  return useQuery({
    queryKey: ['bookings', 'department', params],
    queryFn: () => getDepartmentBookings(params).then(res => res.data),
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });
}

export function useBooking(id) {
  return useQuery({
    queryKey: ['bookings', id],
    queryFn: () => getBooking(id).then(res => res.data),
    enabled: !!id,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createBooking,
    onSuccess: () => invalidateBookingCaches(qc),
  });
}

export function useUpdateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateBooking(id, data),
    onSuccess: () => invalidateBookingCaches(qc),
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => invalidateBookingCaches(qc),
  });
}

export function useAuditTrail(id) {
  return useQuery({
    queryKey: ['auditTrail', id],
    queryFn: () => getAuditTrail(id).then(res => res.data),
    enabled: !!id,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });
}
