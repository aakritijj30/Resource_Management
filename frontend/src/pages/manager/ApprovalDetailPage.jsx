import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import Sidebar from '../../components/Sidebar'
import Navbar from '../../components/Navbar'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorMessage from '../../components/ErrorMessage'
import { getApproval, decideApproval } from '../../api/approvalApi'
import { useBooking } from '../../hooks/useBookings'
import { useResource } from '../../hooks/useResources'

export default function ApprovalDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const approvalId = parseInt(id, 10)
  const [comment, setComment] = useState('')
  const [error, setError] = useState(null)

  const { data: approval, isLoading: approvalLoading } = useQuery({
    queryKey: ['approvals', approvalId],
    queryFn: () => getApproval(approvalId).then((r) => r.data),
    enabled: Number.isFinite(approvalId)
  })
  const { data: booking, isLoading: bookingLoading } = useBooking(approval?.booking_id)
  const { data: resource } = useResource(booking?.resource_id)

  const decide = useMutation({
    mutationFn: ({ decision }) => decideApproval(approvalId, { decision, comment }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['approvals'] })
      qc.invalidateQueries({ queryKey: ['booking', approval?.booking_id] })
      qc.invalidateQueries({ queryKey: ['audit', approval?.booking_id] })
      navigate('/manager/approvals')
    },
    onError: (err) => setError(err)
  })

  if (approvalLoading || bookingLoading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1">
          <Navbar title="Review Approval" />
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (!approval || !booking) return null

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar title="Review Approval" />
        <main className="flex-1 p-6 space-y-6 max-w-2xl">
          <button className="text-sm text-white/40 hover:text-white transition-colors" onClick={() => navigate(-1)}>
            Back to Queue
          </button>

          <div className="card space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Booking Request #{booking.id}</h2>
                <p className="text-white/40 text-sm mt-1">
                  Submitted {format(new Date(approval.created_at), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
              <span className="badge bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">Pending</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-xs text-white/40 mb-1">Purpose</p>
                <p className="font-medium">{booking.purpose}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-xs text-white/40 mb-1">Attendees</p>
                <p className="font-medium">{booking.attendees}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-xs text-white/40 mb-1">Start</p>
                <p className="font-medium">{format(new Date(booking.start_time), 'MMM d, h:mm a')}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-xs text-white/40 mb-1">End</p>
                <p className="font-medium">{format(new Date(booking.end_time), 'h:mm a')}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-xs text-white/40 mb-1">Resource</p>
                <p className="font-medium">{resource?.name || `#${booking.resource_id}`}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-xs text-white/40 mb-1">Location</p>
                <p className="font-medium">{resource?.location || 'Not available'}</p>
              </div>
            </div>
          </div>

          <div className="card space-y-4">
            <h3 className="font-semibold">Your Decision</h3>
            <p className="text-sm text-white/40">A comment is required when rejecting.</p>
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
                Approve
              </button>
              <button
                id="btn-reject"
                className="btn-danger flex-1"
                disabled={decide.isPending || !comment.trim()}
                onClick={() => decide.mutate({ decision: 'rejected' })}
              >
                Reject
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
