import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Navbar from '../../components/Navbar'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useUsageReport } from '../../hooks/useReports'

function QuickLink({ icon, label, to, color }) {
  const navigate = useNavigate()
  return (
    <button onClick={() => navigate(to)}
      className="card flex flex-col items-center gap-3 hover:border-primary-500/30 hover:shadow-lg hover:shadow-primary-600/10 transition-all duration-200 py-8 cursor-pointer group">
      <span className="text-3xl">{icon}</span>
      <span className="font-medium text-sm text-white/70 group-hover:text-white transition-colors">{label}</span>
    </button>
  )
}

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const { data: report, isLoading } = useUsageReport()

  const stats = report ? [
    { icon: '📅', label: 'Total Bookings',   value: report.total_bookings },
    { icon: '⏳', label: 'Pending',           value: report.pending_bookings },
    { icon: '✅', label: 'Approved',          value: report.approved_bookings },
    { icon: '❌', label: 'Rejected',          value: report.rejected_bookings },
  ] : []

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar title="Admin Dashboard" />
        <main className="flex-1 p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Admin Overview</h2>
            <p className="text-white/40 mt-1">System-wide booking status at a glance</p>
          </div>

          {isLoading ? <LoadingSpinner /> : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map(s => (
                <div key={s.label} className="stat-card">
                  <span className="text-2xl">{s.icon}</span>
                  <span className="text-3xl font-bold">{s.value}</span>
                  <span className="text-white/40 text-sm">{s.label}</span>
                </div>
              ))}
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-3 text-white/60 text-sm uppercase tracking-wider">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <QuickLink icon="🏢" label="Manage Resources" to="/admin/resources" />
              <QuickLink icon="📋" label="Set Policies"     to="/admin/policies" />
              <QuickLink icon="🔧" label="Maintenance"      to="/admin/maintenance" />
              <QuickLink icon="📅" label="All Bookings"     to="/admin/bookings" />
              <QuickLink icon="📈" label="Reports"          to="/admin/reports" />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
