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
    <div className="w-full flex justify-center py-20"><LoadingSpinner /></div>
  )

  const statusPie = report ? [
    { name: 'Approved',  value: report.approved_bookings },
    { name: 'Pending',   value: report.pending_bookings },
    { name: 'Rejected',  value: report.rejected_bookings },
    { name: 'Cancelled', value: report.cancelled_bookings },
    { name: 'Completed', value: report.completed_bookings },
  ].filter(d => d.value > 0) : []

  return (
    <div className="w-full flex-col flex animate-fade-in relative z-10 pb-12">
      <section className="page-header-card space-y-4">
        <div className="page-kicker">Data & Insights</div>
        <h1 className="page-title">Reports</h1>
        <p className="page-copy">Usage statistics and booking trends across your organization.</p>
      </section>

          {/* KPI row */}
          {report && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total',     value: report.total_bookings,     icon: '📦' },
                { label: 'Approved',  value: report.approved_bookings,  icon: '✅' },
                { label: 'Pending',   value: report.pending_bookings,   icon: '⏳' },
                { label: 'Completed', value: report.completed_bookings, icon: '🏁' },
              ].map(k => (
                <div key={k.label} className="stat-card">
                  <span className="text-2xl">{k.icon}</span>
                  <span className="text-3xl font-extrabold text-primary-600">{k.value}</span>
                  <span className="text-xs uppercase tracking-[0.2em] font-bold text-surface-400">{k.label}</span>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trends */}
            <div className="card">
              <h3 className="font-semibold text-surface-900 mb-6 flex items-center gap-2">
                Monthly Booking Trends
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={trends} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="period" tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} dx={-5} />
                  <Tooltip 
                    contentStyle={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: 12, boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' }} 
                    itemStyle={{ fontSize: '13px', fontWeight: 600 }}
                  />
                  <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px', fontSize: '12px', fontWeight: 600, color: '#64748B' }} />
                  <Line type="smooth" dataKey="total_bookings" stroke="#C06C84" strokeWidth={3} dot={{ r: 4, fill: '#C06C84', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} name="Total" />
                  <Line type="smooth" dataKey="approved"        stroke="#10b981" strokeWidth={3} dot={false} name="Approved" />
                  <Line type="smooth" dataKey="rejected"        stroke="#ef4444" strokeWidth={3} dot={false} name="Rejected" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Status pie */}
            <div className="card">
              <h3 className="font-semibold text-surface-900 mb-6">Booking Status Breakdown</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={statusPie} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} labelLine={false}>
                    {statusPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: 12, boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' }} />
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 600, color: '#64748B' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Top resources */}
            {report?.top_resources?.length > 0 && (
              <div className="card lg:col-span-2">
                <h3 className="font-semibold text-surface-900 mb-6">Top Resources by Bookings</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={report.top_resources} margin={{ top: 5, right: 15, left: -20, bottom: 5 }}>
                    <XAxis dataKey="resource_name" tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} dx={-5} />
                    <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: 12 }} />
                    <Bar dataKey="total_bookings" radius={[6,6,0,0]} maxBarSize={50}>
                      {report.top_resources.map((_, i) => <Cell key={i} fill={['#C06C84', '#F67280', '#F8B195', '#355C7D', '#99B898'][i % 5]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
  )
}
