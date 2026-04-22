import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Navbar from '../../components/Navbar'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import { useResources } from '../../hooks/useResources'
import { useAuth } from '../../hooks/useAuth'
import clsx from 'clsx'

const TYPE_META = {
  conference_room: { label: 'Conference room', short: 'CR', color: 'bg-blue-500/15 text-blue-100 border-blue-400/20' },
  equipment:       { label: 'Equipment',        short: 'EQ', color: 'bg-violet-500/15 text-violet-100 border-violet-400/20' },
  vehicle:         { label: 'Vehicle',          short: 'VH', color: 'bg-emerald-500/15 text-emerald-100 border-emerald-400/20' },
  lab:             { label: 'Lab',              short: 'LB', color: 'bg-amber-500/15 text-amber-100 border-amber-400/20' },
  other:           { label: 'Other',            short: 'OT', color: 'bg-white/10 text-white/70 border-white/10' },
}

const ALL_TYPES = ['all', 'conference_room', 'equipment', 'vehicle', 'lab', 'other']

// Scope filter tabs
const SCOPE_TABS = [
  { key: 'all',        label: 'All Resources' },
  { key: 'common',     label: 'Common' },
  { key: 'department', label: 'My Department' },
]

export default function ResourceListPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [typeFilter, setTypeFilter] = useState('all')
  const [scopeFilter, setScopeFilter] = useState('all')
  const [search, setSearch] = useState('')
  const { data: resources = [], isLoading } = useResources()

  const filtered = resources.filter(r => {
    // Scope filter
    if (scopeFilter === 'common' && r.department_id !== null) return false
    if (scopeFilter === 'department' && r.department_id === null) return false

    // Type filter
    const matchType = typeFilter === 'all' || r.type === typeFilter

    // Search
    const matchSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.location?.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase())

    return matchType && matchSearch
  })

  const commonCount = resources.filter(r => r.department_id === null).length
  const deptCount   = resources.filter(r => r.department_id !== null).length

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar title="Browse Resources" />
        <main className="flex-1 p-6 space-y-6">

          {/* Header */}
          <section className="space-y-3">
            <div className="page-kicker">Resource catalog</div>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="page-title">Browse and book the right asset</h1>
                <p className="page-copy">
                  Filter by scope or type, then open a booking flow from any resource card.
                </p>
              </div>
              <div className="chip">{filtered.length} resources shown</div>
            </div>
          </section>

          {/* Scope Filter Tabs */}
          <section className="section-shell">
            <div className="flex flex-col gap-4">

              {/* Scope tabs */}
              <div>
                <p className="label mb-2">Filter by scope</p>
                <div className="flex flex-wrap gap-2">
                  {SCOPE_TABS.map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setScopeFilter(tab.key)}
                      className={clsx(
                        'flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all',
                        scopeFilter === tab.key
                          ? 'border-primary-400/30 bg-primary-500/15 text-primary-100'
                          : 'border-white/10 bg-white/5 text-white/55 hover:border-white/20 hover:bg-white/[0.08] hover:text-white'
                      )}
                    >
                      {tab.label}
                      {tab.key === 'common' && (
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold">{commonCount}</span>
                      )}
                      {tab.key === 'department' && (
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold">{deptCount}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search + Type filters row */}
              <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr] lg:items-end">
                <div>
                  <label className="label" htmlFor="input-resource-search">Search</label>
                  <input
                    id="input-resource-search"
                    className="input"
                    placeholder="Search by name, location or description..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>

                <div className="flex flex-wrap gap-2 lg:justify-end">
                  {ALL_TYPES.map(t => (
                    <button
                      key={t}
                      onClick={() => setTypeFilter(t)}
                      className={clsx(
                        'rounded-full border px-4 py-2 text-sm font-medium transition-all',
                        typeFilter === t
                          ? 'border-primary-400/30 bg-primary-500/15 text-primary-100'
                          : 'border-white/10 bg-white/5 text-white/55 hover:border-white/20 hover:bg-white/[0.08] hover:text-white'
                      )}
                    >
                      {t === 'all' ? 'All types' : TYPE_META[t].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Results */}
          {isLoading ? (
            <LoadingSpinner />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon="RS"
              title="No resources found"
              description="Try a different search term, scope, or resource type."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map(r => {
                const meta = TYPE_META[r.type] || TYPE_META.other
                const isCommon = r.department_id === null
                return (
                  <button
                    key={r.id}
                    type="button"
                    className="group text-left"
                    onClick={() => navigate(`/employee/book/${r.id}`)}
                  >
                    <div className="card h-full transition-all duration-200 hover:-translate-y-1 hover:border-primary-400/20 hover:shadow-[0_18px_50px_rgba(3,10,18,0.38)]">

                      {/* Header row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={clsx(
                            'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-sm font-bold tracking-[0.18em]',
                            meta.color
                          )}>
                            {meta.short}
                          </div>
                          <div>
                            <h3 className="text-lg font-display font-semibold text-white group-hover:text-primary-100 leading-tight">
                              {r.name}
                            </h3>
                            <p className="mt-0.5 text-sm text-white/40">{meta.label}</p>
                          </div>
                        </div>

                        {/* Badge column */}
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          {isCommon ? (
                            <span className="chip border-cyan-400/20 bg-cyan-500/10 text-cyan-200 text-[10px]">
                              Common
                            </span>
                          ) : (
                            <span className="chip border-indigo-400/20 bg-indigo-500/10 text-indigo-200 text-[10px]">
                              My Dept
                            </span>
                          )}
                          {r.approval_required && (
                            <span className="chip border-yellow-400/20 bg-yellow-500/10 text-yellow-100 text-[10px]">
                              Approval req.
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      {r.description && (
                        <p className="mt-3 text-sm text-white/45 line-clamp-2">{r.description}</p>
                      )}

                      {/* Info grid */}
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2.5">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-white/30">Location</p>
                          <p className="mt-1 text-sm text-white/70 truncate">{r.location || 'TBD'}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2.5">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-white/30">Capacity</p>
                          <p className="mt-1 text-sm text-white/70">{r.capacity} people</p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <span className="btn-primary inline-flex w-full items-center justify-center">
                          Book now
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
