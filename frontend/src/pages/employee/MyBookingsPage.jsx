import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Navbar from '../../components/Navbar'
import StatusBadge from '../../components/StatusBadge'
import ConfirmModal from '../../components/ConfirmModal'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import { useBookings, useCancelBooking } from '../../hooks/useBookings'
import { format } from 'date-fns'

export default function MyBookingsPage() {
  const navigate = useNavigate()
  const { data: bookings = [], isLoading } = useBookings()
  const cancelBooking = useCancelBooking()
  const [cancelId, setCancelId] = useState(null)

  const handleCancel = async () => {
    await cancelBooking.mutateAsync(cancelId)
    setCancelId(null)
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar title="My Bookings" />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">My Bookings</h2>
              <p className="text-white/40 mt-1">{bookings.length} total booking{bookings.length !== 1 ? 's' : ''}</p>
            </div>
            <button className="btn-primary" onClick={() => navigate('/employee/resources')} id="btn-new-booking">+ New Booking</button>
          </div>

          {isLoading ? <LoadingSpinner /> : bookings.length === 0
            ? <EmptyState icon="📅" title="No bookings yet" description="Make your first booking by browsing available resources." />
            : (
              <div className="space-y-3">
                {bookings.map(b => (
                  <div key={b.id}
                    className="card flex items-center justify-between gap-4 hover:border-white/20 transition-all cursor-pointer group"
                    onClick={() => navigate(`/employee/bookings/${b.id}`)}>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold group-hover:text-primary-400 transition-colors truncate">{b.purpose}</p>
                      <p className="text-xs text-white/40 mt-0.5">
                        {format(new Date(b.start_time), 'MMM d, yyyy · h:mm a')} – {format(new Date(b.end_time), 'h:mm a')}
                      </p>
                    </div>
                    <StatusBadge status={b.status} />
                    {['pending', 'approved'].includes(b.status) && new Date(b.start_time) > new Date() && (
                      <button
                        id={`btn-cancel-${b.id}`}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors shrink-0 px-2 py-1 rounded-lg hover:bg-red-500/10"
                        onClick={e => { e.stopPropagation(); setCancelId(b.id) }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )
          }
        </main>
      </div>

      <ConfirmModal
        isOpen={!!cancelId}
        title="Cancel Booking?"
        message="This will free up the slot immediately. This action cannot be undone."
        confirmLabel="Yes, Cancel"
        danger
        onConfirm={handleCancel}
        onCancel={() => setCancelId(null)}
      />
    </div>
  )
}
