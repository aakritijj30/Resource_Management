import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { useResources } from '../../hooks/useResources';
import { useAuth } from '../../hooks/useAuth';
import clsx from 'clsx';

const TYPE_META = {
  conference_room: { label: 'Conference room', short: 'CR', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  equipment:       { label: 'Equipment',        short: 'EQ', color: 'bg-violet-50 text-violet-600 border-violet-200' },
  vehicle:         { label: 'Vehicle',          short: 'VH', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  lab:             { label: 'Lab',              short: 'LB', color: 'bg-amber-50 text-amber-600 border-amber-200' },
  other:           { label: 'Other',            short: 'OT', color: 'bg-surface-100 text-surface-600 border-surface-200' },
};

const ALL_TYPES = ['all', 'conference_room', 'equipment', 'vehicle', 'lab', 'other'];

const SCOPE_TABS = [
  { key: 'all',        label: 'All Resources' },
  { key: 'common',     label: 'Common' },
  { key: 'department', label: 'My Department' },
];

import { useGlobalFilters } from '../../store/filterContext';

export default function ResourceListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { departmentId: scopeFilter, setDepartmentId: setScopeFilter } = useGlobalFilters();
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('all');
  const { data: resources = [], isLoading } = useResources();

  const filtered = resources.filter(r => {
    if (scopeFilter === 'common' && r.department_id !== null) return false;
    if (scopeFilter === 'department' && r.department_id === null) return false;
    const matchType = typeFilter === 'all' || r.type === typeFilter;
    const matchSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.location || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.description || "").toLowerCase().includes(search.toLowerCase());
    
    const matchApproval = 
      approvalFilter === 'all' || 
      (approvalFilter === 'required' && r.approval_required) ||
      (approvalFilter === 'not_required' && !r.approval_required);

    return matchType && matchSearch && matchApproval;
  });

  const commonCount = resources.filter(r => r.department_id === null).length;
  const deptCount   = resources.filter(r => r.department_id !== null).length;

  return (
    <div className="w-full flex-col flex animate-fade-in relative z-10">
      
      {/* Header */}
      <section className="page-header-card space-y-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="page-kicker">Resource Catalog</div>
            <h1 className="page-title">Browse & Book</h1>
            <p className="page-copy">
              Filter by scope or type, then open a booking flow from any resource card.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-primary-300/30 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary-100 backdrop-blur-md self-start md:self-center">
            {filtered.length} resources available
          </div>
        </div>
      </section>

      {/* Scope Filter Tabs */}
      <section className="card p-5 mb-8">
        <div className="flex flex-col gap-5">
          {/* Scope tabs */}
          <div>
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-widest mb-3">Filter by scope</p>
            <div className="flex flex-wrap gap-2">
              {SCOPE_TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setScopeFilter(tab.key)}
                  className={clsx(
                    'flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all',
                    scopeFilter === tab.key
                      ? 'border-primary-600 bg-primary-600 text-white shadow-lg shadow-primary-500/20 scale-[1.02]'
                      : 'border-surface-200 bg-white text-surface-600 hover:border-surface-300 hover:bg-surface-50 hover:text-surface-900'
                  )}
                >
                  {tab.label}
                  {tab.key === 'common' && (
                    <span className="rounded-full bg-surface-100 text-surface-500 px-2 py-0.5 text-[10px] font-bold">{commonCount}</span>
                  )}
                  {tab.key === 'department' && (
                    <span className="rounded-full bg-surface-100 text-surface-500 px-2 py-0.5 text-[10px] font-bold">{deptCount}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px w-full bg-surface-100" />

          {/* Approval Filter */}
          <div>
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-widest mb-3">Approval Requirement</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setApprovalFilter('all')}
                className={clsx(
                  'rounded-full border px-4 py-2 text-sm font-medium transition-all',
                  approvalFilter === 'all'
                    ? 'border-primary-600 bg-primary-600 text-white shadow-lg shadow-primary-500/20 scale-[1.02]'
                    : 'border-surface-200 bg-white text-surface-600 hover:border-surface-300 hover:bg-surface-50 hover:text-surface-900'
                )}
              >
                Any
              </button>
              <button
                onClick={() => setApprovalFilter('required')}
                className={clsx(
                  'rounded-full border px-4 py-2 text-sm font-medium transition-all',
                  approvalFilter === 'required'
                    ? 'border-primary-600 bg-primary-600 text-white shadow-lg shadow-primary-500/20 scale-[1.02]'
                    : 'border-surface-200 bg-white text-surface-600 hover:border-surface-300 hover:bg-surface-50 hover:text-surface-900'
                )}
              >
                Requires Approval
              </button>
              <button
                onClick={() => setApprovalFilter('not_required')}
                className={clsx(
                  'rounded-full border px-4 py-2 text-sm font-medium transition-all',
                  approvalFilter === 'not_required'
                    ? 'border-primary-600 bg-primary-600 text-white shadow-lg shadow-primary-500/20 scale-[1.02]'
                    : 'border-surface-200 bg-white text-surface-600 hover:border-surface-300 hover:bg-surface-50 hover:text-surface-900'
                )}
              >
                Instant Booking
              </button>
            </div>
          </div>

          <div className="h-px w-full bg-surface-100" />

          {/* Type Filter */}
          <div>
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-widest mb-3">Resource Type</p>
            <div className="flex flex-wrap gap-2">
              {ALL_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={clsx(
                    'rounded-full border px-4 py-2 text-sm font-medium transition-all capitalize',
                    typeFilter === type
                      ? 'border-primary-600 bg-primary-600 text-white shadow-lg shadow-primary-500/20 scale-[1.02]'
                      : 'border-surface-200 bg-white text-surface-600 hover:border-surface-300 hover:bg-surface-50 hover:text-surface-900'
                  )}
                >
                  {type.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px w-full bg-surface-100" />

          {/* Search + Type filters row */}
          <div className="w-full">
            <div className="max-w-xl">
              <label className="text-xs font-semibold text-surface-500 uppercase tracking-widest block mb-2" htmlFor="input-resource-search">Search</label>
              <input
                id="input-resource-search"
                className="input bg-surface-50 border-surface-200 text-surface-900 placeholder:text-surface-400 rounded-xl"
                placeholder="Search by name, location or description..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 pb-10">
          {filtered.map(r => {
            const meta = TYPE_META[r.type] || TYPE_META.other;
            const isCommon = r.department_id === null;
            return (
              <button
                key={r.id}
                type="button"
                className="group text-left"
                onClick={() => navigate(`/employee/book/${r.id}`)}
              >
                <div className="card h-full transition-all duration-200 hover:-translate-y-1 hover:border-primary-200/60 hover:shadow-glow flex flex-col justify-between">

                  <div>
                    {/* Resource Image */}
                    <div className="relative h-48 w-full overflow-hidden rounded-2xl mb-5 group-hover:shadow-lg transition-all duration-300">
                      {r.image_url ? (
                        <img 
                          src={r.image_url} 
                          alt={r.name} 
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        />
                      ) : (
                        <div className={`h-full w-full flex items-center justify-center ${meta.color.split(' ')[0]} opacity-40`}>
                           <span className="text-4xl font-black opacity-20">{meta.short}</span>
                        </div>
                      )}
                      
                      {/* Badge column - Overlaid on image */}
                      <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 shrink-0">
                        {isCommon ? (
                          <span className="chip bg-white/90 text-sky-700 border-sky-200 text-[10px] shadow-sm backdrop-blur-md">
                            Common
                          </span>
                        ) : (
                          <span className="chip bg-white/90 text-indigo-700 border-indigo-200 text-[10px] shadow-sm backdrop-blur-md">
                            My Dept
                          </span>
                        )}
                        {r.approval_required && (
                          <span className="chip bg-white/90 text-amber-700 border-amber-200 text-[10px] shadow-sm backdrop-blur-md">
                            Approval req.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Header row */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className={clsx(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-[10px] font-bold tracking-[0.18em] shadow-sm',
                          meta.color
                        )}>
                          {meta.short}
                        </div>
                        <div>
                          <h3 className="text-lg font-display font-bold text-surface-900 group-hover:text-primary-700 leading-tight transition-colors">
                            {r.name}
                          </h3>
                          <p className="mt-0.5 text-[10px] text-surface-500 font-bold uppercase tracking-widest">{meta.label}</p>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {r.description && (
                      <p className="text-sm text-surface-600 line-clamp-2 leading-relaxed">{r.description}</p>
                    )}

                    {/* Info grid */}
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-surface-200 bg-surface-50/50 px-3 py-2.5">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-surface-400">Location</p>
                        <p className="mt-1 text-sm text-surface-800 font-medium truncate">{r.location || 'TBD'}</p>
                      </div>
                      <div className="rounded-xl border border-surface-200 bg-surface-50/50 px-3 py-2.5">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-surface-400">Capacity</p>
                        <p className="mt-1 text-sm text-surface-800 font-medium">{r.capacity} people</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-5 border-t border-surface-100">
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
    </div>
  )
}
