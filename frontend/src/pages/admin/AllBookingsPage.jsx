import { useState } from 'react'
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
    <div className="w-full flex-col flex animate-fade-in relative z-10 pb-12">
      <section className="page-header-card space-y-4">
        <div className="page-kicker">Admin booking view</div>
        <h1 className="page-title">All bookings</h1>
        <p className="page-copy">{filtered.length} bookings shown across the system tracking all resource activity.</p>
      </section>

      <div className="flex flex-wrap gap-2 mb-6">
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={clsx(
              'rounded-full border px-5 py-2 text-sm font-bold capitalize transition-all duration-200',
              statusFilter === s
                ? 'border-primary-200 bg-primary-100 text-primary-700 shadow-sm'
                : 'border-surface-200 bg-white text-surface-500 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700'
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
                    <p className="text-sm font-semibold text-surface-900">Booking #{b.id}</p>
                    <p className="mt-1 text-xs text-primary-600 font-bold uppercase tracking-wider pb-2">
                       {b.user_name || `User #${b.user_id}`} · {b.resource_name || `Resource #${b.resource_id}`}
                    </p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
                <div className="grid grid-cols-1 gap-2 text-sm text-surface-900/65">
                  <div className="rounded-xl bg-surface-50 p-3 border border-surface-100">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-primary-600 font-bold">Start</p>
                    <p className="mt-1">{formatISTDateTime(b.start_time, false)}</p>
                  </div>
                  <div className="rounded-xl bg-surface-50 p-3 border border-surface-100">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-primary-600 font-bold">End</p>
                    <p className="mt-1">{formatISTTime(b.end_time)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-100 text-xs uppercase tracking-wider text-surface-500 font-medium">
                  <th className="pb-3 text-left">ID</th>
                  <th className="pb-3 text-left">User</th>
                  <th className="pb-3 text-left">Resource</th>
                  <th className="pb-3 text-left">Start</th>
                  <th className="pb-3 text-left">End</th>
                  <th className="pb-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filtered.map(b => (
                  <tr key={b.id} className="transition-colors hover:bg-surface-50">
                    <td className="py-4 text-surface-500 font-medium">#{b.id}</td>
                    <td className="py-4 text-primary-600 font-bold">{b.user_name || `User #${b.user_id}`}</td>
                    <td className="py-4 text-primary-600 font-bold uppercase tracking-tight">{b.resource_name || `Resource #${b.resource_id}`}</td>
                    <td className="py-4 text-surface-500 font-medium">{formatISTDateTime(b.start_time, false)}</td>
                    <td className="py-4 text-surface-500 font-medium">{formatISTTime(b.end_time)}</td>
                    <td className="py-4"><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
