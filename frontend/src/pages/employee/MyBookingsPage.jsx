import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Navbar from '../../components/Navbar'
import StatusBadge from '../../components/StatusBadge'
import ConfirmModal from '../../components/ConfirmModal'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import BookingSummary from '../../components/BookingSummary'
import { useBookings, useCancelBooking } from '../../hooks/useBookings'
import { formatISTDateTime, formatISTTime, isAfterNowIST } from '../../utils/time'

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
    <div className="flex min-h-screen flex-col lg:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar title="My Bookings" />
        <main className="flex-1 space-y-6 p-4 sm:p-6">
          <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="page-kicker">Booking history</div>
              <h1 className="page-title">My bookings</h1>
              <p className="page-copy">
                {bookings.length} total booking{bookings.length !== 1 ? 's' : ''}.
              </p>
            </div>
            <button className="btn-primary self-start" onClick={() => navigate('/employee/resources')} id="btn-new-booking">
              + New Booking
            </button>
          </section>

          <BookingSummary
            bookings={bookings}
            title="Status overview"
            subtitle="Track every booking state in a glance."
          />

          {isLoading ? (
            <LoadingSpinner />
          ) : bookings.length === 0 ? (
            <EmptyState icon="BK" title="No bookings yet" description="Make your first booking by browsing available resources." />
          ) : (
            <div className="grid gap-3">
              {bookings.map(b => (
                <div
                  key={b.id}
                  className="card flex cursor-pointer flex-col gap-4 transition-all hover:border-white/20 md:flex-row md:items-center md:justify-between"
                  onClick={() => navigate(`/employee/bookings/${b.id}`)}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-white group-hover:text-primary-400 transition-colors">{b.purpose}</p>
                    <p className="mt-1 text-xs text-white/40">
                      {formatISTDateTime(b.start_time)} - {formatISTTime(b.end_time)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 md:flex-shrink-0">
                    <StatusBadge status={b.status} />
                    {['pending', 'approved'].includes(b.status) && isAfterNowIST(b.start_time) && (
                      <button
                        id={`btn-cancel-${b.id}`}
                        className="rounded-lg px-2 py-1 text-xs text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                        onClick={e => {
                          e.stopPropagation()
                          setCancelId(b.id)
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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
