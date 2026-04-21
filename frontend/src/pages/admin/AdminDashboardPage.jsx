import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Navbar from '../../components/Navbar'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import { useUsageReport } from '../../hooks/useReports'
import { useBookings } from '../../hooks/useBookings'
import { formatISTDateTime, formatISTTime, isAfterNowIST, isTodayIST, parseApiDate } from '../../utils/time'

function Shortcut({ title, to, subtitle, badge }) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(to)}
      className="group card flex h-full flex-col items-start gap-4 text-left transition-all duration-200 hover:-translate-y-1 hover:border-primary-400/20"
    >
      <div className="flex w-full items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary-400/20 bg-primary-500/10 text-sm font-bold tracking-[0.22em] text-primary-100">
          {badge}
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/45">
          Open
        </span>
      </div>
      <div>
        <h3 className="text-base font-display font-semibold text-white group-hover:text-primary-100">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-white/45">{subtitle}</p>
      </div>
    </button>
  )
}

function BookingPreview({ booking, label }) {
  const navigate = useNavigate()

  if (!booking) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
        <p className="text-sm text-white/45">No {label.toLowerCase()} bookings found.</p>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => navigate('/admin/bookings')}
      className="w-full rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-left transition-all hover:border-primary-400/20 hover:bg-white/[0.08]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/30">{label}</p>
          <p className="mt-2 text-base font-medium text-white">{booking.purpose}</p>
          <p className="mt-1 text-sm text-white/45">
            {formatISTDateTime(booking.start_time)} - {formatISTTime(booking.end_time)}
          </p>
        </div>
        <span className="chip">{booking.status}</span>
      </div>
    </button>
  )
}

export default function AdminDashboardPage() {
  const { data: report, isLoading: reportLoading } = useUsageReport()
  const { data: bookings = [], isLoading: bookingsLoading } = useBookings()

  const stats = report ? [
    { label: 'Total bookings', value: report.total_bookings },
    { label: 'Pending', value: report.pending_bookings },
    { label: 'Approved', value: report.approved_bookings },
    { label: 'Rejected', value: report.rejected_bookings },
  ] : []

  const { todayBooking, upcomingBooking } = useMemo(() => {
    const ordered = [...bookings].sort((a, b) => parseApiDate(a.start_time) - parseApiDate(b.start_time))
    return {
      todayBooking: ordered.find(b => isTodayIST(b.start_time)) || null,
      upcomingBooking: ordered.find(b => isAfterNowIST(b.start_time)) || null,
    }
  }, [bookings])

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar title="Admin Dashboard" />
        <main className="flex-1 space-y-6 p-4 sm:p-6">
          <section className="space-y-3">
            <div className="page-kicker">Admin overview</div>
            <h1 className="page-title">System-wide operations at a glance</h1>
            <p className="page-copy">
              Monitor booking volume, governance, maintenance, and reporting from a single control surface.
            </p>
          </section>

          {reportLoading ? (
            <LoadingSpinner />
          ) : (
            <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {stats.map(s => (
                <div key={s.label} className="stat-card">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/30">{s.label}</div>
                  <div className="text-3xl font-display font-semibold text-white">{s.value}</div>
                  <div className="h-1 w-16 rounded-full bg-primary-500/30" />
                </div>
              ))}
            </section>
          )}

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-white/35">Action center</h3>
                <p className="mt-1 text-sm text-white/40">Quick view of what is happening today and what is next.</p>
              </div>
              <span className="chip">Bookings</span>
            </div>

            {bookingsLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                <BookingPreview booking={todayBooking} label="Today" />
                <BookingPreview booking={upcomingBooking} label="Upcoming" />
              </div>
            )}
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-white/35">Admin shortcuts</h3>
                <p className="mt-1 text-sm text-white/40">Direct tools for operations and governance.</p>
              </div>
              <span className="chip">Action center</span>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Shortcut badge="RS" title="Manage resources" to="/admin/resources" subtitle="Add, deactivate, and maintain the resource catalog." />
              <Shortcut badge="PL" title="Set policies" to="/admin/policies" subtitle="Control booking windows, duration, and access rules." />
              <Shortcut badge="MN" title="Maintenance" to="/admin/maintenance" subtitle="Schedule blocks and auto-handle affected bookings." />
              <Shortcut badge="RP" title="Reports" to="/admin/reports" subtitle="Track utilization and booking trends." />
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
