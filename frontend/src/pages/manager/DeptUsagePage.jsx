import Sidebar from '../../components/Sidebar'
import Navbar from '../../components/Navbar'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import { useDeptReport } from '../../hooks/useReports'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function DeptUsagePage() {
  const { data: depts = [], isLoading } = useDeptReport()

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar title="Department Usage" />
        <main className="flex-1 p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Department Booking Usage</h2>
            <p className="text-white/40 mt-1">Overview of bookings by department</p>
          </div>

          {isLoading ? <LoadingSpinner /> : depts.length === 0
            ? <EmptyState icon="📊" title="No data yet" description="Bookings will appear here once made." />
            : (
              <>
                <div className="card">
                  <h3 className="font-semibold mb-4">Total Bookings by Department</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={depts} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                      <XAxis dataKey="department_name" tick={{ fill: '#ffffff60', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#ffffff60', fontSize: 12 }} />
                      <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                      <Bar dataKey="total_bookings" radius={[6,6,0,0]}>
                        {depts.map((_, i) => <Cell key={i} fill={['#6366f1','#8b5cf6','#0ea5e9'][i % 3]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-3">
                  {depts.map(d => (
                    <div key={d.department_id} className="card flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{d.department_name}</p>
                        <p className="text-sm text-white/40">{d.total_bookings} total bookings</p>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <span className="text-emerald-400">✅ {d.approved_count}</span>
                        <span className="text-red-400">❌ {d.rejected_count}</span>
                        <span className="text-white/40">⚫ {d.cancelled_count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )
          }
        </main>
      </div>
    </div>
  )
}
