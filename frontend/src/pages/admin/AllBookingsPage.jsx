import { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import Navbar from '../../components/Navbar'
import StatusBadge from '../../components/StatusBadge'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import { useQuery } from '@tanstack/react-query'
import api from '../../api/axiosInstance'
import clsx from 'clsx'
import { formatISTDateTime, formatISTTime } from '../../utils/time'

const STATUSES = ['all', 'pending', 'approved', 'rejected', 'cancelled', 'completed']

export default function AllBookingsPage() {
  const [statusFilter, setStatusFilter] = useState('all')
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['all-bookings'],
    queryFn: () => api.get('/bookings').then(r => r.data)
  })

  const filtered = statusFilter === 'all' ? bookings : bookings.filter(b => b.status === statusFilter)

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar title="All Bookings" />
        <main className="flex-1 space-y-6 p-4 sm:p-6">
          <section className="space-y-3">
            <div className="page-kicker">Admin booking view</div>
            <h1 className="page-title">All bookings</h1>
            <p className="page-copy">{filtered.length} bookings shown across the system.</p>
          </section>

          <div className="flex flex-wrap gap-2">
            {STATUSES.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={clsx(
                  'rounded-full border px-4 py-2 text-sm font-medium capitalize transition-all',
                  statusFilter === s
                    ? 'border-primary-400/30 bg-primary-500/15 text-primary-100'
                    : 'border-white/10 bg-white/5 text-white/50 hover:bg-white/[0.08] hover:text-white'
                )}
              >
                {s}
              </button>
            ))}
          </div>

          {isLoading ? (
            <LoadingSpinner />
          ) : filtered.length === 0 ? (
            <EmptyState icon="BK" title="No bookings match" />
          ) : (
            <>
              <div className="grid gap-3 md:hidden">
                {filtered.map(b => (
                  <div key={b.id} className="card space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">Booking #{b.id}</p>
                        <p className="mt-1 text-xs text-white/40">User #{b.user_id} · Resource #{b.resource_id}</p>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>
                    <div className="grid grid-cols-1 gap-2 text-sm text-white/65">
                      <div className="rounded-xl bg-white/[0.06] p-3">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-white/30">Start</p>
                        <p className="mt-1">{formatISTDateTime(b.start_time, false)}</p>
                      </div>
                      <div className="rounded-xl bg-white/[0.06] p-3">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-white/30">End</p>
                        <p className="mt-1">{formatISTTime(b.end_time)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="card hidden overflow-x-auto md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/40">
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
                      <tr key={b.id} className="transition-colors hover:bg-white/5">
                        <td className="py-3 text-white/40">#{b.id}</td>
                        <td className="py-3">User #{b.user_id}</td>
                        <td className="py-3">Resource #{b.resource_id}</td>
                        <td className="py-3 text-white/60">{formatISTDateTime(b.start_time, false)}</td>
                        <td className="py-3 text-white/60">{formatISTTime(b.end_time)}</td>
                        <td className="py-3"><StatusBadge status={b.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
