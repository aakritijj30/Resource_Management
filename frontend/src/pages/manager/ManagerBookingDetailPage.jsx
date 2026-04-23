import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Sidebar from '../../components/Sidebar'
import Navbar from '../../components/Navbar'
import StatusBadge from '../../components/StatusBadge'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorMessage from '../../components/ErrorMessage'
import { useBooking, useAuditTrail } from '../../hooks/useBookings'
import { useResource } from '../../hooks/useResources'
import { useAuth } from '../../hooks/useAuth'
import { decideApproval } from '../../api/approvalApi'
import { formatISTDate, formatISTTime, formatISTDateTime } from '../../utils/time'

export default function ManagerBookingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { user } = useAuth()
  const [comment, setComment] = useState('')
  const [error, setError] = useState(null)

  const { data: booking, isLoading } = useBooking(id)
  const { data: audit = [] } = useAuditTrail(id)
  const { data: resource } = useResource(booking?.resource_id)

  const decide = useMutation({
    mutationFn: ({ decision }) => decideApproval(booking.approval.id, { decision, comment }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] })
      qc.invalidateQueries({ queryKey: ['all-bookings'] })
      qc.invalidateQueries({ queryKey: ['auditTrail', id] })
      setComment('')
      setError(null)
    },
    onError: (err) => setError(err)
  })

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

  const canApprove = useMemo(() => {
    if (!booking || booking.status !== 'pending' || !booking.approval) return false
    return user?.role === 'admin' || booking.approval.manager_id === user?.id
  }, [booking, user])

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
        <main className="flex-1 p-6 space-y-6 max-w-4xl">
          <button className="text-sm text-white/40 hover:text-white transition-colors" onClick={() => navigate(-1)}>
            Back
          </button>

          <div className="card space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-white/30">Requested by</p>
                <h2 className="mt-2 text-2xl font-bold">{booking.user?.full_name || 'Unknown user'}</h2>
                <p className="text-white/40 text-sm mt-1">
                  {booking.user?.email || 'Email not available'} - Booking #{booking.id}
                </p>
              </div>
              <StatusBadge status={booking.status} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-white/40 mb-1">Purpose</p>
                <p className="font-semibold text-white">{booking.purpose}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-white/40 mb-1">Attendees</p>
                <p className="font-semibold text-white">{booking.attendees}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-white/40 mb-1">Start</p>
                <p className="font-semibold text-white">{formatISTDate(booking.start_time)}</p>
                <p className="text-white/60 text-sm">{formatISTTime(booking.start_time)}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-white/40 mb-1">End</p>
                <p className="font-semibold text-white">{formatISTDate(booking.end_time)}</p>
                <p className="text-white/60 text-sm">{formatISTTime(booking.end_time)}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-white/40 mb-1">Resource</p>
                <p className="font-semibold text-white">{resource?.name || `#${booking.resource_id}`}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-white/40 mb-1">Location</p>
                <p className="font-semibold text-white">{resource?.location || 'Not available'}</p>
              </div>
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
          </div>

          {canApprove && (
            <div className="card space-y-4 border-yellow-500/20 bg-yellow-500/[0.02]">
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-semibold text-yellow-100/90">Review Approval</h3>
                <span className="chip border-yellow-400/20 bg-yellow-500/10 text-yellow-100">Action Required</span>
              </div>
              <p className="text-sm text-white/40">Provide a decision note. A comment is required when rejecting.</p>
              <div>
                <label className="label" htmlFor="input-approval-comment">Comment</label>
                <textarea
                  id="input-approval-comment"
                  className="input resize-none"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a decision note for the requester..."
                />
              </div>
              <ErrorMessage error={error} />
              <div className="flex gap-3 pt-2">
                <button
                  id="btn-approve"
                  className="btn-primary flex-1"
                  disabled={decide.isPending}
                  onClick={() => decide.mutate({ decision: 'approved' })}
                >
                  Approve Request
                </button>
                <button
                  id="btn-reject"
                  className="btn-danger flex-1"
                  disabled={decide.isPending || !comment.trim()}
                  onClick={() => decide.mutate({ decision: 'rejected' })}
                >
                  Reject Request
                </button>
              </div>
            </div>
          )}

          <div className="card">
            <h3 className="font-semibold mb-4">Booking timeline</h3>
            <div className="space-y-3 text-sm text-white/70">
              <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                <span>Submitted</span>
                <span>{formatISTDateTime(booking.created_at)}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                <span>Latest update</span>
                <span>{formatISTDateTime(booking.updated_at)}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                <span>Viewed by</span>
                <span>{user?.full_name}</span>
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
                      <span className="text-white/40 ml-2">{formatISTDateTime(log.timestamp)}</span>
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
    </div>
  )
}
