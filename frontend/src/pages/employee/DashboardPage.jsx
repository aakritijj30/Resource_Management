import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Navbar from '../../components/Navbar'
import StatusBadge from '../../components/StatusBadge'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useBookings } from '../../hooks/useBookings'
import { useAuth } from '../../hooks/useAuth'
import { useResource } from '../../hooks/useResources'
import { formatISTDate, formatISTDateTime, formatISTTime, isAfterNowIST } from '../../utils/time'
import { usePriorityAlert } from '../../hooks/useNotifications'
import PriorityAlertModal from '../../components/PriorityAlertModal'

function StatCard({ label, value, hint, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'stat-card text-left transition-all duration-200 hover:-translate-y-1',
        active ? 'border-primary-400/30 bg-primary-500/10' : '',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-3xl font-display font-semibold text-white">{value}</div>
          <div className="mt-1 text-sm text-white/45">{label}</div>
        </div>
        <div className="h-11 w-11 rounded-2xl border border-primary-400/20 bg-primary-500/10" />
      </div>
      <div className="text-xs uppercase tracking-[0.22em] text-white/30">{hint}</div>
    </button>
  )
}

function BookingLine({ booking, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'w-full rounded-2xl border p-4 text-left transition-all',
        active
          ? 'border-primary-400/30 bg-primary-500/10'
          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08]',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{booking.purpose}</p>
          <p className="mt-1 text-xs text-white/40">
            {formatISTDateTime(booking.start_time)} - {formatISTTime(booking.end_time)}
          </p>
        </div>
        <StatusBadge status={booking.status} />
      </div>
    </button>
  )
}



export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: bookings = [], isLoading } = useBookings()
  const [selectedFilter, setSelectedFilter] = useState('upcoming')
  const [selectedId, setSelectedId] = useState(null)
  const priorityAlert = usePriorityAlert()
  const [showAlert, setShowAlert] = useState(false)

  useEffect(() => {
    if (priorityAlert) {
      setShowAlert(true)
    }
  }, [priorityAlert])

  const upcoming = useMemo(
    () => bookings.filter(booking => booking.status === 'approved' && isAfterNowIST(booking.start_time)),
    [bookings]
  )
  const pending = useMemo(() => bookings.filter(booking => booking.status === 'pending'), [bookings])

  const filteredBookings = selectedFilter === 'upcoming'
    ? upcoming
    : selectedFilter === 'pending'
      ? pending
      : selectedFilter === 'all'
        ? bookings
        : []

  const selectedBooking = filteredBookings.find(booking => booking.id === selectedId) || null
  const { data: selectedResource } = useResource(selectedBooking?.resource_id)

  useEffect(() => {
    if (!filteredBookings.some(booking => booking.id === selectedId)) {
      setSelectedId(null)
    }
  }, [filteredBookings, selectedId])

  const cards = [
    { key: 'upcoming', label: 'Upcoming bookings', value: upcoming.length, hint: 'Approved and scheduled' },
    { key: 'pending', label: 'Pending approval', value: pending.length, hint: 'Waiting for review' },
    { key: 'all', label: 'Total bookings', value: bookings.length, hint: 'All tracked requests' },
  ]
  const selectedFilterLabel =
    selectedFilter === 'upcoming'
      ? 'Approved & scheduled bookings'
      : selectedFilter === 'pending'
        ? 'Pending approvals'
        : selectedFilter === 'all'
          ? 'All bookings'
          : ''
  const detailPanelLabel =
    selectedFilter === 'upcoming'
      ? 'Upcoming details'
      : selectedFilter === 'pending'
        ? 'Pending details'
        : selectedFilter === 'all'
          ? 'Booking details'
          : ''

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar title="Dashboard" />

        <main className="flex-1 space-y-6 p-4 sm:p-6">
          <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="page-kicker">Employee overview</div>
              <h1 className="page-title">
                Welcome back, {user?.full_name?.split(' ')[0]}
              </h1>
              <p className="page-copy">
                Click a booking category, then pick a booking to view its details.
              </p>
            </div>

            <button
              className="btn-primary inline-flex items-center gap-2 self-start"
              id="btn-quick-book"
              onClick={() => navigate('/employee/resources')}
            >
              <span className="text-base leading-none">+</span>
              Quick Book
            </button>
          </section>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {cards.map(card => (
              <StatCard
                key={card.key}
                label={card.label}
                value={card.value}
                hint={card.hint}
                active={selectedFilter === card.key}
                onClick={() => {
                  setSelectedFilter(card.key)
                  setSelectedId(null)
                }}
              />
            ))}
          </section>

          {selectedFilter ? (
            <section className="grid gap-6 lg:grid-cols-[1fr_1.05fr]">
              <div className="section-shell">
                {isLoading ? (
                  <LoadingSpinner />
                ) : (
                  <div className="space-y-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="font-display text-lg font-semibold text-white">{selectedFilterLabel}</h3>
                      </div>
                      <span className="chip">{filteredBookings.length} items</span>
                    </div>

                    {filteredBookings.length > 0 ? (
                      <div className="grid gap-3">
                        {filteredBookings.slice(0, 6).map(booking => (
                          <BookingLine
                            key={booking.id}
                            booking={booking}
                            active={selectedBooking?.id === booking.id}
                            onClick={() => setSelectedId(booking.id)}
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              {selectedBooking ? (
                <div className="section-shell lg:sticky lg:top-24 lg:self-start">
                  <div className="space-y-4">
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/30">
                          {detailPanelLabel}
                        </p>
                        <h3 className="mt-2 font-display text-lg font-semibold text-white">Selected booking</h3>
                      </div>
                      <StatusBadge status={selectedBooking.status || 'draft'} />
                    </div>

                    <div className="rounded-2xl border border-primary-400/20 bg-gradient-to-br from-primary-500/15 to-white/[0.06] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.18)]">
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <span className="text-sm font-semibold text-emerald-300">
                            {selectedBooking.status === 'approved'
                              ? 'Approved'
                              : selectedBooking.status === 'pending'
                                ? 'Pending'
                                : selectedBooking.status}
                          </span>
                          <span className="text-xs uppercase tracking-[0.24em] text-white/35">Selected booking</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span className="chip">Booking #{selectedBooking.id}</span>
                          <span className="chip">{selectedBooking.attendees} attendees</span>
                          <span className="chip capitalize">{selectedBooking.status}</span>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/30">Purpose</p>
                          <p className="mt-2 text-2xl font-display font-semibold text-white">
                            {selectedBooking.purpose}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/30">Start</p>
                        <p className="mt-2 text-sm text-white/80">
                          {formatISTDate(selectedBooking.start_time)}
                        </p>
                        <p className="mt-1 text-sm text-white/55">
                          {formatISTTime(selectedBooking.start_time)}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/30">End</p>
                        <p className="mt-2 text-sm text-white/80">
                          {formatISTDate(selectedBooking.end_time)}
                        </p>
                        <p className="mt-1 text-sm text-white/55">
                          {formatISTTime(selectedBooking.end_time)}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/30">Resource</p>
                        <p className="mt-2 text-sm text-white/80">
                          {selectedResource?.name || `#${selectedBooking.resource_id}`}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/30">Location</p>
                        <p className="mt-2 text-sm text-white/80">
                          {selectedResource?.location || 'Not available'}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/30">Status note</p>
                      <p className="mt-2 text-sm leading-6 text-white/65">
                        {selectedBooking.status === 'pending'
                          ? 'This request is waiting for approval. The slot is still held until a manager decides.'
                          : selectedBooking.status === 'approved'
                            ? 'This event is confirmed and scheduled.'
                            : 'This booking is part of your history and can still be reviewed for its current state.'}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        className="btn-primary"
                        onClick={() => navigate(`/employee/bookings/${selectedBooking.id}`)}
                      >
                        Open booking
                      </button>
                      <button className="btn-secondary" onClick={() => navigate('/employee/resources')}>
                        Book another
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </section>
          ) : null}
        </main>
      </div>
      {showAlert && (
        <PriorityAlertModal 
          alert={priorityAlert} 
          onClose={() => setShowAlert(false)} 
        />
      )}
    </div>
  )
}
