import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Navbar from '../../components/Navbar'
import StatusBadge from '../../components/StatusBadge'
import LoadingSpinner from '../../components/LoadingSpinner'
import ConfirmModal from '../../components/ConfirmModal'
import ErrorMessage from '../../components/ErrorMessage'
import { useBooking, useAuditTrail, useCancelBooking, useUpdateBooking } from '../../hooks/useBookings'
import { useResource, useResources } from '../../hooks/useResources'
import { useAuth } from '../../hooks/useAuth'
import { formatISTDate, formatISTTime, isAfterNowIST, toISTDateTimeInput } from '../../utils/time'

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
  const { user } = useAuth()
  const { data: booking, isLoading } = useBooking(id)
  const { data: audit = [] } = useAuditTrail(id)
  const { data: resource } = useResource(booking?.resource_id)
  const { data: resources = [] } = useResources()
  const cancelBooking = useCancelBooking()
  const updateBooking = useUpdateBooking()
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editError, setEditError] = useState(null)
  const [editForm, setEditForm] = useState({
    resource_id: '',
    start_time: '',
    end_time: '',
    purpose: '',
    attendees: 1,
  })

  const canCancel = booking && ['pending', 'approved'].includes(booking.status) && isAfterNowIST(booking.start_time)
  const canEdit = booking && booking.user_id === user?.id && ['pending', 'approved'].includes(booking.status) && isAfterNowIST(booking.start_time)
  const editableResources = useMemo(() => resources, [resources])
  const latestAudit = useMemo(() => {
    const preferred = [...audit].reverse().find(entry => ['booking_cancelled', 'booking_rejected', 'booking_approved', 'booking_updated'].includes(entry.action))
    return preferred || audit[audit.length - 1] || null
  }, [audit])

  const latestActorLabel = latestAudit?.detail?.cancelled_by || latestAudit?.user?.full_name || null
  const latestActionLabel =
    latestAudit?.action === 'booking_cancelled'
      ? 'Cancelled'
      : latestAudit?.action === 'booking_rejected'
        ? 'Rejected'
        : latestAudit?.action === 'booking_approved'
          ? 'Approved'
          : latestAudit?.action === 'booking_updated'
            ? 'Updated'
            : null

  useEffect(() => {
    if (!booking) return
    setEditForm({
      resource_id: booking.resource_id,
      start_time: toISTDateTimeInput(booking.start_time),
      end_time: toISTDateTimeInput(booking.end_time),
      purpose: booking.purpose,
      attendees: booking.attendees,
    })
  }, [booking])

  const handleCancel = async () => {
    await cancelBooking.mutateAsync(Number(id))
    setShowCancelModal(false)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setEditError(null)

    try {
      await updateBooking.mutateAsync({
        id: Number(id),
        data: {
          resource_id: Number(editForm.resource_id),
          start_time: editForm.start_time,
          end_time: editForm.end_time,
          purpose: editForm.purpose,
          attendees: Number(editForm.attendees),
        },
      })
      setShowEditForm(false)
    } catch (err) {
      setEditError(err)
    }
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

            {latestActionLabel && latestActorLabel && (
              <div className="rounded-xl border border-primary-400/20 bg-primary-500/10 px-4 py-3 text-sm text-white/80">
                {latestActionLabel} by {latestActorLabel}
              </div>
            )}

            {latestAudit?.detail?.comment && (
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75">
                <p className="text-xs uppercase tracking-[0.22em] text-white/30">Decision note</p>
                <p className="mt-1">{latestAudit.detail.comment}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-white/40 mb-1">Booked by</p>
                <p className="font-semibold text-white">{booking.user?.full_name || user?.full_name}</p>
                <p className="text-white/60 text-sm">{booking.user?.email || user?.email}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-white/40 mb-1">Reason</p>
                <p className="font-semibold text-white">{booking.purpose}</p>
              </div>
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

            {(canEdit || canCancel) && (
              <div className="flex flex-wrap justify-end gap-3 border-t border-white/10 pt-4">
                {canEdit && (
                  <button className="btn-secondary" onClick={() => setShowEditForm(v => !v)}>
                    {showEditForm ? 'Close Edit' : 'Edit Booking'}
                  </button>
                )}
                {canCancel && (
                  <button className="btn-danger" onClick={() => setShowCancelModal(true)}>
                    Cancel Booking
                  </button>
                )}
              </div>
            )}
          </div>

          <ErrorMessage error={cancelBooking.error} />
          {showEditForm && canEdit && (
            <form className="card space-y-4" onSubmit={handleUpdate}>
              <div>
                <h3 className="font-semibold">Edit booking</h3>
                <p className="mt-1 text-sm text-white/40">
                  Update the booking details. Changes are synced immediately to the admin and manager views.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="label" htmlFor="edit-resource">Resource</label>
                  <select
                    id="edit-resource"
                    className="input"
                    value={editForm.resource_id}
                    onChange={e => setEditForm(f => ({ ...f, resource_id: e.target.value }))}
                  >
                    {editableResources.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="edit-attendees">Attendees</label>
                  <input
                    id="edit-attendees"
                    type="number"
                    min={1}
                    className="input"
                    value={editForm.attendees}
                    onChange={e => setEditForm(f => ({ ...f, attendees: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label" htmlFor="edit-start">Start</label>
                  <input
                    id="edit-start"
                    type="datetime-local"
                    className="input"
                    value={editForm.start_time}
                    onChange={e => setEditForm(f => ({ ...f, start_time: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label" htmlFor="edit-end">End</label>
                  <input
                    id="edit-end"
                    type="datetime-local"
                    className="input"
                    value={editForm.end_time}
                    onChange={e => setEditForm(f => ({ ...f, end_time: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="label" htmlFor="edit-purpose">Purpose</label>
                <textarea
                  id="edit-purpose"
                  className="input min-h-[110px] resize-none"
                  value={editForm.purpose}
                  onChange={e => setEditForm(f => ({ ...f, purpose: e.target.value }))}
                />
              </div>

              <ErrorMessage error={editError} />

              <div className="flex flex-wrap gap-3">
                <button type="submit" className="btn-primary" disabled={updateBooking.isPending}>
                  {updateBooking.isPending ? 'Saving...' : 'Save changes'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowEditForm(false)}
                >
                  Cancel edit
                </button>
              </div>
            </form>
          )}

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
