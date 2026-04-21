import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Navbar from '../../components/Navbar'
import StatusBadge from '../../components/StatusBadge'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import { useBookings } from '../../hooks/useBookings'
import { useAuth } from '../../hooks/useAuth'
import { format } from 'date-fns'

function StatCard({ icon, label, value, color }) {
  return (
    <div className="stat-card">
      <div className={`text-3xl`}>{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-white/40 text-sm">{label}</div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: bookings = [], isLoading } = useBookings()

  const upcoming = bookings.filter(b => b.status === 'approved' && new Date(b.start_time) > new Date())
  const pending  = bookings.filter(b => b.status === 'pending')

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar title="Dashboard" />
        <main className="flex-1 p-6 space-y-6">
          {/* Welcome */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Welcome back, {user?.full_name?.split(' ')[0]} 👋</h2>
              <p className="text-white/40 mt-1">Here's your booking overview for today</p>
            </div>
            <button className="btn-primary flex items-center gap-2" id="btn-quick-book" onClick={() => navigate('/employee/resources')}>
              <span>+</span> Quick Book
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard icon="📅" label="Upcoming Bookings" value={upcoming.length} />
            <StatCard icon="⏳" label="Pending Approval" value={pending.length} />
            <StatCard icon="📦" label="Total Bookings" value={bookings.length} />
          </div>

          {/* Upcoming list */}
          <div className="card">
            <h3 className="font-semibold mb-4">Upcoming Confirmed Bookings</h3>
            {isLoading ? <LoadingSpinner /> : upcoming.length === 0
              ? <EmptyState icon="📭" title="No upcoming bookings" description="Browse resources to make your first booking." />
              : (
                <div className="space-y-3">
                  {upcoming.slice(0, 5).map(b => (
                    <div key={b.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer"
                         onClick={() => navigate(`/employee/bookings/${b.id}`)}>
                      <div>
                        <p className="font-medium text-sm">{b.purpose}</p>
                        <p className="text-xs text-white/40 mt-0.5">
                          {format(new Date(b.start_time), 'MMM d, h:mm a')} – {format(new Date(b.end_time), 'h:mm a')}
                        </p>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        </main>
      </div>
    </div>
  )
}
