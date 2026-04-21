import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Navbar from '../../components/Navbar'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import { useResources } from '../../hooks/useResources'
import clsx from 'clsx'

const TYPE_META = {
  conference_room: { label: 'Conference room', short: 'CR' },
  equipment: { label: 'Equipment', short: 'EQ' },
  vehicle: { label: 'Vehicle', short: 'VH' },
  lab: { label: 'Lab', short: 'LB' },
  other: { label: 'Other', short: 'OT' },
}

const ALL_TYPES = ['all', 'conference_room', 'equipment', 'vehicle', 'lab', 'other']

export default function ResourceListPage() {
  const navigate = useNavigate()
  const [typeFilter, setTypeFilter] = useState('all')
  const [search, setSearch] = useState('')
  const { data: resources = [], isLoading } = useResources()

  const filtered = resources.filter(r => {
    const matchType = typeFilter === 'all' || r.type === typeFilter
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.location?.toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch
  })

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar title="Browse Resources" />
        <main className="flex-1 p-6 space-y-6">
          <section className="space-y-3">
            <div className="page-kicker">Resource catalog</div>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="page-title">Browse and book the right asset</h1>
                <p className="page-copy">
                  Search across rooms, equipment, vehicles, and labs, then open a booking flow from any resource card.
                </p>
              </div>
              <div className="chip">{filtered.length} resources shown</div>
            </div>
          </section>

          <section className="section-shell">
            <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr] lg:items-end">
              <div>
                <label className="label" htmlFor="input-resource-search">Search</label>
                <input
                  id="input-resource-search"
                  className="input"
                  placeholder="Search by name or location..."
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
          </section>

          {isLoading ? (
            <LoadingSpinner />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon="RS"
              title="No resources found"
              description="Try a different search term or switch to another resource type."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map(r => {
                const meta = TYPE_META[r.type] || TYPE_META.other
                return (
                  <button
                    key={r.id}
                    type="button"
                    className="group text-left"
                    onClick={() => navigate(`/employee/book/${r.id}`)}
                  >
                    <div className="card h-full transition-all duration-200 hover:-translate-y-1 hover:border-primary-400/20 hover:shadow-[0_18px_50px_rgba(3,10,18,0.38)]">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-bold tracking-[0.18em] text-white/75">
                            {meta.short}
                          </div>
                          <div>
                            <h3 className="text-lg font-display font-semibold text-white group-hover:text-primary-100">{r.name}</h3>
                            <p className="mt-1 text-sm text-white/40">{meta.label}</p>
                          </div>
                        </div>

                        {r.approval_required && (
                          <span className="chip border-yellow-400/20 bg-yellow-500/10 text-yellow-100">
                            Approval required
                          </span>
                        )}
                      </div>

                      <div className="mt-5 grid gap-3">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-white/30">Location</p>
                          <p className="mt-1 text-sm text-white/70">{r.location || 'Location TBD'}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-white/30">Capacity</p>
                          <p className="mt-1 text-sm text-white/70">{r.capacity} people</p>
                        </div>
                      </div>

                      <div className="mt-5">
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
