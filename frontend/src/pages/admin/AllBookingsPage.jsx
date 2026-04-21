import { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import Navbar from '../../components/Navbar'
import StatusBadge from '../../components/StatusBadge'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import { useQuery } from '@tanstack/react-query'
import api from '../../api/axiosInstance'
import { format } from 'date-fns'
import clsx from 'clsx'

const STATUSES = ['all', 'pending', 'approved', 'rejected', 'cancelled', 'completed']

export default function AllBookingsPage() {
  const [statusFilter, setStatusFilter] = useState('all')
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['all-bookings'],
    queryFn: () => api.get('/bookings').then(r => r.data)
  })

  const filtered = statusFilter === 'all' ? bookings : bookings.filter(b => b.status === statusFilter)

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar title="All Bookings" />
        <main className="flex-1 p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold">All Bookings</h2>
            <p className="text-white/40 mt-1">{filtered.length} bookings shown</p>
          </div>

          <div className="flex gap-2 flex-wrap">
            {STATUSES.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={clsx('px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all',
                  statusFilter === s ? 'bg-primary-600 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10 border border-white/10')}>
                {s}
              </button>
            ))}
          </div>

          {isLoading ? <LoadingSpinner /> : filtered.length === 0
            ? <EmptyState icon="📭" title="No bookings match" />
            : (
              <div className="card overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-wider">
                      <th className="pb-3 text-left">ID</th>
                      <th className="pb-3 text-left">User</th>
                      <th className="pb-3 text-left">Resource</th>
                      <th className="pb-3 text-left">Start</th>
                      <th className="pb-3 text-left">End</th>
                      <th className="pb-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filtered.map(b => (
                      <tr key={b.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 text-white/40">#{b.id}</td>
                        <td className="py-3">User #{b.user_id}</td>
                        <td className="py-3">Resource #{b.resource_id}</td>
                        <td className="py-3 text-white/60">{format(new Date(b.start_time), 'MMM d, h:mm a')}</td>
                        <td className="py-3 text-white/60">{format(new Date(b.end_time), 'h:mm a')}</td>
                        <td className="py-3"><StatusBadge status={b.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </main>
      </div>
    </div>
  )
}
