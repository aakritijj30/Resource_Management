import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmModal from '../../components/ConfirmModal';
import ErrorMessage from '../../components/ErrorMessage';
import { useBooking, useAuditTrail, useCancelBooking, useCheckInBooking, useMarkNoShow } from '../../hooks/useBookings';
import { useResource } from '../../hooks/useResources';
import { useAuth } from '../../hooks/useAuth';
import { formatISTDate, formatISTTime, isAfterNowIST } from '../../utils/time';
import { ArrowLeft } from 'lucide-react';

function getStatusNote(status) {
  if (status === 'pending') return 'Waiting for manager approval. The slot stays blocked while the request is under review.';
  if (status === 'approved') return 'Confirmed and reserved. You can still cancel before the booking starts.';
  if (status === 'rejected') return 'This request was rejected. Submit a new request if you still need the resource.';
  if (status === 'cancelled') return 'This booking was cancelled and the slot has been released.';
  if (status === 'completed') return 'The booking window has ended and the reservation is now completed.';
  return 'This booking is in progress.';
}

export default function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: booking, isLoading } = useBooking(id);
  const { data: audit = [] } = useAuditTrail(id);
  const { data: resource } = useResource(booking?.resource_id);
  const cancelBooking = useCancelBooking();
  const checkInBooking = useCheckInBooking();
  const markNoShow = useMarkNoShow();
  const [showCancelModal, setShowCancelModal] = useState(false);

  const canCancel = booking && ['pending', 'approved'].includes(booking.status) && isAfterNowIST(booking.start_time);
  const now = new Date();
  const startAt = booking ? new Date(booking.start_time) : null;
  const endAt = booking ? new Date(booking.end_time) : null;
  const canCheckIn = booking
    && booking.status === 'approved'
    && booking.attendance_status === 'unknown'
    && startAt <= now
    && endAt >= now
    && (booking.user_id === user?.id || user?.role === 'admin');
  const canMarkNoShow = booking
    && ['admin', 'manager'].includes(user?.role)
    && ['approved', 'completed'].includes(booking.status)
    && booking.attendance_status === 'unknown'
    && startAt <= now;

  const handleCancel = async () => {
    await cancelBooking.mutateAsync(Number(id));
    setShowCancelModal(false);
  };

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  if (!booking) return null;

  return (
    <div className="w-full flex-col flex animate-fade-in relative z-10 max-w-4xl mx-auto pb-12">
      <button 
        className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-800 transition-colors mb-6 self-start" 
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="card space-y-6 pt-8 pb-8 px-6 sm:px-8 bg-white/80 border border-surface-200 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-surface-100 pb-6">
          <div>
            <h2 className="text-3xl font-display font-bold text-surface-900">{booking.purpose}</h2>
            <p className="text-surface-500 font-medium mt-1">Booking #{booking.id}</p>
          </div>
          <div className="shrink-0">
            <StatusBadge status={booking.status} />
          </div>
        </div>

        <div className="rounded-xl border border-primary-200 bg-primary-50 px-5 py-4 text-sm font-medium text-primary-800 flex gap-3 shadow-sm">
          <span className="text-primary-600 shrink-0">ℹ️</span>
          {getStatusNote(booking.status)}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="bg-surface-50 border border-surface-200 rounded-xl p-4">
            <p className="text-[10px] font-bold text-surface-400 mb-1 uppercase tracking-widest">Start</p>
            <p className="font-semibold text-surface-900">{formatISTDate(booking.start_time)}</p>
            <p className="text-surface-600 text-sm mt-0.5 font-medium">{formatISTTime(booking.start_time)}</p>
          </div>
          <div className="bg-surface-50 border border-surface-200 rounded-xl p-4">
            <p className="text-[10px] font-bold text-surface-400 mb-1 uppercase tracking-widest">End</p>
            <p className="font-semibold text-surface-900">{formatISTDate(booking.end_time)}</p>
            <p className="text-surface-600 text-sm mt-0.5 font-medium">{formatISTTime(booking.end_time)}</p>
          </div>
          <div className="bg-surface-50 border border-surface-200 rounded-xl p-4">
            <p className="text-[10px] font-bold text-surface-400 mb-1 uppercase tracking-widest">Attendees</p>
            <p className="font-semibold text-surface-900">{booking.attendees}</p>
          </div>
          <div className="bg-surface-50 border border-surface-200 rounded-xl p-4">
            <p className="text-[10px] font-bold text-surface-400 mb-1 uppercase tracking-widest">Resource</p>
            <p className="font-semibold text-surface-900 truncate">{resource?.name || `#${booking.resource_id}`}</p>
          </div>
          <div className="bg-surface-50 border border-surface-200 rounded-xl p-4">
            <p className="text-[10px] font-bold text-surface-400 mb-1 uppercase tracking-widest">Attendance</p>
            <p className="font-semibold text-surface-900 capitalize">{booking.attendance_status.replace('_', ' ')}</p>
            {booking.checked_in_at && <p className="text-surface-600 text-sm mt-0.5 font-medium">Checked in {formatISTTime(booking.checked_in_at)}</p>}
          </div>
          <div className="bg-surface-50 border border-surface-200 rounded-xl p-4 md:col-span-4">
            <p className="text-[10px] font-bold text-surface-400 mb-1 uppercase tracking-widest">Location</p>
            <p className="font-semibold text-surface-900">{resource?.location || 'Not available'}</p>
          </div>
        </div>

        {(canCancel || canCheckIn || canMarkNoShow) && (
          <div className="flex justify-end gap-3 border-t border-surface-100 pt-6">
            {canCancel && (
              <button 
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-primary-600 bg-primary-50 hover:bg-primary-100 transition-colors"
                onClick={() => navigate(`/employee/bookings/${id}/edit`)}
              >
                Edit Booking
              </button>
            )}
            {canCheckIn && (
              <button
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                onClick={() => checkInBooking.mutate(Number(id))}
                disabled={checkInBooking.isPending}
              >
                {checkInBooking.isPending ? 'Checking In...' : 'Check In'}
              </button>
            )}
            {canMarkNoShow && (
              <button
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors"
                onClick={() => markNoShow.mutate(Number(id))}
                disabled={markNoShow.isPending}
              >
                {markNoShow.isPending ? 'Marking...' : 'Mark No-Show'}
              </button>
            )}
            {canCancel && (
              <button className="rounded-xl px-5 py-2.5 text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors" onClick={() => setShowCancelModal(true)}>
                Cancel Booking
              </button>
            )}
          </div>
        )}
      </div>

      <ErrorMessage error={cancelBooking.error || checkInBooking.error || markNoShow.error} />

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div className="card bg-white/60 border border-surface-200">
          <h3 className="font-bold text-surface-900 mb-4 tracking-tight">Progress Tracking</h3>
          <div className="space-y-3 text-sm font-medium">
            <div className="flex items-center justify-between rounded-xl bg-surface-50 border border-surface-100 px-4 py-3">
              <span className="text-surface-600">Submitted</span>
              <span className="text-surface-900">{formatISTDate(booking.created_at)} {formatISTTime(booking.created_at)}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-surface-50 border border-surface-100 px-4 py-3">
              <span className="text-surface-600">Current status</span>
              <StatusBadge status={booking.status} />
            </div>
            <div className="flex items-center justify-between rounded-xl bg-surface-50 border border-surface-100 px-4 py-3">
              <span className="text-surface-600">Latest update</span>
              <span className="text-surface-900">{formatISTDate(booking.updated_at)} {formatISTTime(booking.updated_at)}</span>
            </div>
          </div>
        </div>

        <div className="card bg-white/60 border border-surface-200">
          <h3 className="font-bold text-surface-900 mb-4 tracking-tight">Audit Trail</h3>
          {audit.length > 0 ? (
            <div className="space-y-4">
              {audit.map((log, index) => (
                <div key={index} className="flex gap-4 text-sm relative">
                  <div className="w-1.5 shrink-0 bg-primary-200 rounded-full my-1 shadow-sm relative z-10" />
                  {index !== audit.length - 1 && (
                    <div className="absolute left-[3px] top-4 bottom-[-16px] w-px bg-surface-200" />
                  )}
                  <div className="flex-1 pb-2">
                    <span className="font-bold text-surface-900 capitalize">{log.action.replace(/_/g, ' ')}</span>
                    <span className="text-surface-400 ml-2 text-xs font-semibold">{formatISTDate(log.timestamp)} {formatISTTime(log.timestamp)}</span>
                    {log.detail?.comment && <p className="text-surface-600 mt-1 italic border-l-2 border-surface-200 pl-3 py-0.5">"{log.detail.comment}"</p>}
                    {log.detail?.reason && <p className="text-surface-600 mt-1 font-medium">{log.detail.reason}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-surface-500 italic">No activity logs recorded yet.</p>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showCancelModal}
        title="Cancel Booking?"
        message="This will free the slot immediately and record the cancellation in the audit trail."
        confirmLabel={cancelBooking.isPending ? 'Cancelling...' : 'Yes, Cancel'}
        danger
        onConfirm={handleCancel}
        onCancel={() => setShowCancelModal(false)}
      />
    </div>
  );
}
