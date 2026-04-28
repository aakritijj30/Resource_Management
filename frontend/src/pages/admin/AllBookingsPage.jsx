import { useState } from 'react'
import StatusBadge from '../../components/StatusBadge'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import { useQuery } from '@tanstack/react-query'
import api from '../../api/axiosInstance'
import { getDepartments } from '../../api/departmentApi'
import clsx from 'clsx'
import { formatISTDateTime, formatISTTime } from '../../utils/time'
import { Filter, Calendar, LayoutGrid, ChevronDown } from 'lucide-react'

const STATUSES = ['all', 'pending', 'approved', 'rejected', 'cancelled', 'completed']

import { useGlobalFilters } from '../../store/filterContext'

export default function AllBookingsPage() {
  const { statusFilter, setStatusFilter, departmentId: scopeFilter, setDepartmentId: setScopeFilter } = useGlobalFilters()
  const [sortOrder, setSortOrder] = useState('latest') // 'latest', 'earliest'

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => getDepartments().then(r => r.data)
  })

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['all-bookings', statusFilter, scopeFilter, sortOrder],
    queryFn: () => {
      const params = {
        skip: 0,
        limit: 100,
        sort: sortOrder,
      }
      if (scopeFilter === 'common') params.is_common = true
      else if (scopeFilter !== 'all') params.department_id = scopeFilter
      
      return api.get('/bookings', { params }).then(r => r.data)
    }
  })

  // We still filter status on frontend if we want, or we could add it to backend too.
  // The backend supports filtering by status? No, I didn't add it yet.
  // Let's stick to frontend status filtering for now as it's already there and fast.
  const filtered = statusFilter === 'all' ? bookings : bookings.filter(b => b.status === statusFilter)

  return (
    <div className="w-full flex-col flex animate-fade-in relative z-10 pb-12">
      <section className="page-header-card space-y-4">
        <div className="page-kicker">Admin booking view</div>
        <h1 className="page-title">All bookings</h1>
        <p className="page-copy">{filtered.length} bookings shown across the system tracking all resource activity.</p>
      </section>

      {/* Filters Section */}
      <div className="card mb-8 space-y-6 bg-white/80 backdrop-blur-md border-surface-200/60 shadow-xl shadow-surface-900/5">
        <div className="flex flex-wrap items-center justify-between gap-6">
          
          {/* Status Filter */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest flex items-center gap-2">
              <Filter size={12} /> Status Filter
            </p>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={clsx(
                    'rounded-full border px-4 py-1.5 text-xs font-bold capitalize transition-all duration-200',
                    statusFilter === s
                      ? 'border-primary-600 bg-primary-600 text-white shadow-lg shadow-primary-500/20 scale-[1.02]'
                      : 'border-surface-200 bg-white text-surface-500 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Order */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest flex items-center gap-2">
              <Calendar size={12} /> Sort Order
            </p>
            <div className="flex bg-surface-100 p-1 rounded-xl">
              <button
                onClick={() => setSortOrder('latest')}
                className={clsx(
                  'px-4 py-1.5 rounded-lg text-xs font-bold transition-all',
                  sortOrder === 'latest' ? 'bg-white text-primary-600 shadow-sm' : 'text-surface-500'
                )}
              >
                Latest
              </button>
              <button
                onClick={() => setSortOrder('earliest')}
                className={clsx(
                  'px-4 py-1.5 rounded-lg text-xs font-bold transition-all',
                  sortOrder === 'earliest' ? 'bg-white text-primary-600 shadow-sm' : 'text-surface-500'
                )}
              >
                Earliest
              </button>
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-surface-100" />

        {/* Scope/Department Filter */}
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest flex items-center gap-2">
            <LayoutGrid size={12} /> Departmental Scope
          </p>
          <div className="relative w-full max-w-sm">
            <select
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value === 'common' || e.target.value === 'all' ? e.target.value : parseInt(e.target.value))}
              className="w-full appearance-none bg-surface-50 border border-surface-200 text-surface-900 text-sm rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none font-medium cursor-pointer hover:bg-white"
            >
              <option value="all">All Departments & Common</option>
              <option value="common">Common Resources Only</option>
              <optgroup label="Specific Departments">
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </optgroup>
            </select>
            <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20">
          <LoadingSpinner />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="BK" title="No bookings found" subtitle="Try adjusting your filters to find what you're looking for." />
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

          <div className="card hidden overflow-x-auto md:block border-surface-200/60 shadow-xl shadow-surface-900/5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-100 text-[10px] uppercase tracking-[0.15em] text-surface-400 font-bold">
                  <th className="pb-4 pt-2 text-left px-4">ID</th>
                  <th className="pb-4 pt-2 text-left px-4">User</th>
                  <th className="pb-4 pt-2 text-left px-4">Resource</th>
                  <th className="pb-4 pt-2 text-left px-4">Start</th>
                  <th className="pb-4 pt-2 text-left px-4">End</th>
                  <th className="pb-4 pt-2 text-left px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50">
                {filtered.map(b => (
                  <tr key={b.id} className="transition-colors hover:bg-primary-50/30">
                    <td className="py-4 px-4 text-surface-500 font-medium">#{b.id}</td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="text-surface-900 font-bold">{b.user_name || 'System User'}</span>
                        <span className="text-[10px] text-surface-400">ID: {b.user_id}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="text-primary-700 font-bold uppercase tracking-tight">{b.resource_name || `Resource #${b.resource_id}`}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-surface-700 font-semibold">{formatISTDateTime(b.start_time, false)}</td>
                    <td className="py-4 px-4 text-surface-700 font-semibold">{formatISTTime(b.end_time)}</td>
                    <td className="py-4 px-4"><StatusBadge status={b.status} /></td>
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
