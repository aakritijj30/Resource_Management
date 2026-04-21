import Sidebar from '../../components/Sidebar'
import Navbar from '../../components/Navbar'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useUsageReport, useTrends } from '../../hooks/useReports'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6']

export default function ReportsDashboardPage() {
  const { data: report, isLoading }    = useUsageReport()
  const { data: trends = [], isLoading: trendsLoading } = useTrends(6)

  if (isLoading || trendsLoading) return (
    <div className="flex min-h-screen"><Sidebar /><div className="flex-1"><Navbar title="Reports" /><LoadingSpinner /></div></div>
  )

  const statusPie = report ? [
    { name: 'Approved',  value: report.approved_bookings },
    { name: 'Pending',   value: report.pending_bookings },
    { name: 'Rejected',  value: report.rejected_bookings },
    { name: 'Cancelled', value: report.cancelled_bookings },
    { name: 'Completed', value: report.completed_bookings },
  ].filter(d => d.value > 0) : []

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar title="Reports Dashboard" />
        <main className="flex-1 p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Reports &amp; Analytics</h2>
            <p className="text-white/40 mt-1">System-wide booking insights</p>
          </div>

          {/* KPI row */}
          {report && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total',     value: report.total_bookings,     icon: '📦' },
                { label: 'Approved',  value: report.approved_bookings,  icon: '✅' },
                { label: 'Pending',   value: report.pending_bookings,   icon: '⏳' },
                { label: 'Completed', value: report.completed_bookings, icon: '🏁' },
              ].map(k => (
                <div key={k.label} className="stat-card">
                  <span className="text-2xl">{k.icon}</span>
                  <span className="text-3xl font-bold">{k.value}</span>
                  <span className="text-white/40 text-sm">{k.label}</span>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trends */}
            <div className="card">
              <h3 className="font-semibold mb-4">Monthly Booking Trends</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trends}>
                  <XAxis dataKey="period" tick={{ fill: '#ffffff60', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#ffffff60', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                  <Legend />
                  <Line type="monotone" dataKey="total_bookings" stroke="#6366f1" strokeWidth={2} dot={false} name="Total" />
                  <Line type="monotone" dataKey="approved"        stroke="#10b981" strokeWidth={2} dot={false} name="Approved" />
                  <Line type="monotone" dataKey="rejected"        stroke="#ef4444" strokeWidth={2} dot={false} name="Rejected" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Status pie */}
            <div className="card">
              <h3 className="font-semibold mb-4">Booking Status Breakdown</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {statusPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Top resources */}
            {report?.top_resources?.length > 0 && (
              <div className="card lg:col-span-2">
                <h3 className="font-semibold mb-4">Top Resources by Bookings</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={report.top_resources} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                    <XAxis dataKey="resource_name" tick={{ fill: '#ffffff60', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#ffffff60', fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                    <Bar dataKey="total_bookings" radius={[6,6,0,0]}>
                      {report.top_resources.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
