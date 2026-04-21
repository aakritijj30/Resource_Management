import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Navbar from '../../components/Navbar'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import { useResources } from '../../hooks/useResources'
import clsx from 'clsx'

const TYPE_ICONS = {
  conference_room: '🏢', equipment: '🔧', vehicle: '🚗', lab: '🧪', other: '📦'
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
          <div>
            <h2 className="text-2xl font-bold">Browse Resources</h2>
            <p className="text-white/40 mt-1">Find and book the right space or equipment</p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <input
              className="input max-w-xs"
              placeholder="Search by name or location..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              id="input-resource-search"
            />
            <div className="flex gap-2 flex-wrap">
              {ALL_TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                    typeFilter === t
                      ? 'bg-primary-600 text-white'
                      : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-white/10'
                  )}
                >
                  {t === 'all' ? 'All Types' : TYPE_ICONS[t] + ' ' + t.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {isLoading ? <LoadingSpinner /> : filtered.length === 0
            ? <EmptyState icon="🔍" title="No resources found" description="Try a different search or filter." />
            : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(r => (
                  <div key={r.id} className="card hover:border-primary-500/30 hover:shadow-lg hover:shadow-primary-600/10 transition-all duration-200 cursor-pointer group"
                       onClick={() => navigate(`/employee/book/${r.id}`)}>
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-3xl">{TYPE_ICONS[r.type] || '📦'}</span>
                      {r.approval_required && (
                        <span className="badge bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-xs">
                          ✅ Approval needed
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold group-hover:text-primary-400 transition-colors">{r.name}</h3>
                    <p className="text-white/40 text-sm mt-1">{r.location || 'Location TBD'}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-white/50">
                      <span>👥 Capacity: {r.capacity}</span>
                    </div>
                    <button className="btn-primary w-full mt-4 text-sm" id={`btn-book-${r.id}`}>
                      Book Now →
                    </button>
                  </div>
                ))}
              </div>
            )
          }
        </main>
      </div>
    </div>
  )
}
