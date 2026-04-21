import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Navbar from '../../components/Navbar'
import StatusBadge from '../../components/StatusBadge'
import LoadingSpinner from '../../components/LoadingSpinner'
import ConfirmModal from '../../components/ConfirmModal'
import ErrorMessage from '../../components/ErrorMessage'
import { useBooking, useAuditTrail, useCancelBooking } from '../../hooks/useBookings'
import { useResource } from '../../hooks/useResources'
import { formatISTDate, formatISTTime, isAfterNowIST } from '../../utils/time'

function getStatusNote(status) {
  if (status === 'pending') return 'Waiting for manager approval. The slot stays blocked while the request is under review.'
  if (status === 'approved') return 'Confirmed and reserved. You can still cancel before the booking starts.'
  if (status === 'rejected') return 'This request was rejected. Submit a new request if you still need the resource.'
  if (status === 'cancelled') return 'This booking was cancelled and the slot has been released.'
  if (status === 'completed') return 'The booking window has ended and the reservation is now completed.'
  return 'This booking is in progress.'
}

export default function BookingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: booking, isLoading } = useBooking(id)
  const { data: audit = [] } = useAuditTrail(id)
  const { data: resource } = useResource(booking?.resource_id)
  const cancelBooking = useCancelBooking()
  const [showCancelModal, setShowCancelModal] = useState(false)

  const canCancel = booking && ['pending', 'approved'].includes(booking.status) && isAfterNowIST(booking.start_time)

  const handleCancel = async () => {
    await cancelBooking.mutateAsync(Number(id))
    setShowCancelModal(false)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1">
          <Navbar title="Booking Detail" />
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (!booking) return null

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar title="Booking Detail" />
        <main className="flex-1 p-6 space-y-6 max-w-3xl">
          <button className="text-sm text-white/40 hover:text-white transition-colors" onClick={() => navigate(-1)}>
            Back
          </button>

          <div className="card space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">{booking.purpose}</h2>
                <p className="text-white/40 text-sm mt-1">Booking #{booking.id}</p>
              </div>
              <StatusBadge status={booking.status} />
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
              {getStatusNote(booking.status)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-white/40 mb-1">Start</p>
                <p className="font-semibold">{formatISTDate(booking.start_time)}</p>
                <p className="text-white/60 text-sm">{formatISTTime(booking.start_time)}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-white/40 mb-1">End</p>
                <p className="font-semibold">{formatISTDate(booking.end_time)}</p>
                <p className="text-white/60 text-sm">{formatISTTime(booking.end_time)}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-white/40 mb-1">Attendees</p>
                <p className="font-semibold">{booking.attendees}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-white/40 mb-1">Resource</p>
                <p className="font-semibold">{resource?.name || `#${booking.resource_id}`}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 md:col-span-2">
                <p className="text-xs text-white/40 mb-1">Location</p>
                <p className="font-semibold">{resource?.location || 'Not available'}</p>
              </div>
            </div>

            {canCancel && (
              <div className="flex justify-end border-t border-white/10 pt-4">
                <button className="btn-danger" onClick={() => setShowCancelModal(true)}>
                  Cancel Booking
                </button>
              </div>
            )}
          </div>

          <ErrorMessage error={cancelBooking.error} />

          <div className="card">
            <h3 className="font-semibold mb-4">Progress</h3>
            <div className="space-y-3 text-sm text-white/70">
              <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                <span>Submitted</span>
                <span>{formatISTDate(booking.created_at)} {formatISTTime(booking.created_at)}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                <span>Current status</span>
                <StatusBadge status={booking.status} />
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                <span>Latest update</span>
                <span>{formatISTDate(booking.updated_at)} {formatISTTime(booking.updated_at)}</span>
              </div>
            </div>
          </div>

          {audit.length > 0 && (
            <div className="card">
              <h3 className="font-semibold mb-4">Audit Trail</h3>
              <div className="space-y-3">
                {audit.map((log, index) => (
                  <div key={index} className="flex gap-3 text-sm">
                    <div className="w-1.5 shrink-0 bg-primary-600/40 rounded-full mt-1" />
                    <div>
                      <span className="font-medium capitalize">{log.action.replace(/_/g, ' ')}</span>
                      <span className="text-white/40 ml-2">{formatISTDate(log.timestamp)} {formatISTTime(log.timestamp)}</span>
                      {log.detail?.comment && <p className="text-white/50 mt-0.5">"{log.detail.comment}"</p>}
                      {log.detail?.reason && <p className="text-white/50 mt-0.5">{log.detail.reason}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      <ConfirmModal
        isOpen={showCancelModal}
        title="Cancel Booking?"
        message="This will free the slot immediately and keep the cancellation in the audit trail."
        confirmLabel={cancelBooking.isPending ? 'Cancelling...' : 'Yes, Cancel'}
        danger
        onConfirm={handleCancel}
        onCancel={() => setShowCancelModal(false)}
      />
    </div>
  )
}
