import { useState } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ConfirmModal from '../../components/ConfirmModal';
import ErrorMessage from '../../components/ErrorMessage';
import { useResources, useCreateResource, useDeactivateResource, useReactivateResource } from '../../hooks/useResources';

import { useQuery } from '@tanstack/react-query';
import { getDepartments } from '../../api/departmentApi';
import { LayoutGrid, ChevronDown } from 'lucide-react';

const TYPES = ['conference_room', 'equipment', 'vehicle', 'lab', 'other'];

import { useGlobalFilters } from '../../store/filterContext';

export default function ResourceManagePage() {
  const { departmentId: scopeFilter, setDepartmentId: setScopeFilter, statusFilter, setStatusFilter } = useGlobalFilters();
  const { data: resources = [], isLoading } = useResources({ active_only: false });
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => getDepartments().then(r => r.data)
  });

  const createResource = useCreateResource();
  const deactivateResource = useDeactivateResource();
  const reactivateResource = useReactivateResource();

  const [showForm, setShowForm] = useState(false);
  const [deactivateId, setDeactivateId] = useState(null);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    name: '',
    type: 'conference_room',
    capacity: 1,
    location: '',
    approval_required: false,
    image_url: '',
    department_id: null
  });

  const filtered = resources.filter(r => {
    // Department Filter
    const matchesScope = scopeFilter === 'all' 
      ? true 
      : scopeFilter === 'common' 
        ? r.department_id === null 
        : r.department_id === scopeFilter;
    
    // Status Filter
    const matchesStatus = statusFilter === 'all'
      ? true
      : statusFilter === 'active'
        ? r.is_active === true
        : r.is_active === false;

    return matchesScope && matchesStatus;
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      await createResource.mutateAsync({ ...form, capacity: parseInt(form.capacity) });
      setShowForm(false);
      setForm({ name: '', type: 'conference_room', capacity: 1, location: '', approval_required: false });
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className="w-full flex-col flex animate-fade-in relative z-10 pb-12">
      <section className="page-header-card space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="page-kicker">Resource Control</div>
            <h1 className="page-title">Manage Resources</h1>
            <p className="page-copy">Add, edit, and orchestrate all bookable instances.</p>
          </div>

          <button 
            className="group flex h-14 items-center gap-3 rounded-full bg-white px-6 font-semibold text-primary-700 shadow-lg shadow-black/10 transition-all hover:bg-surface-50 active:scale-95 self-start md:self-center" 
            id="btn-add-resource" 
            onClick={() => setShowForm(!showForm)}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700">
              <span className="text-xl font-bold leading-none transition-transform duration-300 group-hover:rotate-90">
                {showForm ? '−' : '+'}
              </span>
            </div>
            <span className="pr-2">{showForm ? 'Close form' : 'Add resource'}</span>
          </button>
        </div>
      </section>

      {/* Admin Filters */}
      <div className="card mb-8 bg-white/80 backdrop-blur-md border-surface-200/60 shadow-xl shadow-surface-900/5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest flex items-center gap-2">
              <LayoutGrid size={12} /> Filter by Department
            </p>
            <div className="relative w-full max-w-sm">
              <select
                value={scopeFilter}
                onChange={(e) => setScopeFilter(e.target.value === 'all' || e.target.value === 'common' ? e.target.value : parseInt(e.target.value))}
                className="w-full appearance-none bg-surface-50 border border-surface-200 text-surface-900 text-sm rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none font-medium cursor-pointer hover:bg-white"
              >
                <option value="all">All Resources (Org-Wide)</option>
                <option value="common">Common Resources (No Dept)</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-3 lg:text-right flex flex-col lg:items-end">
            <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest flex items-center gap-2 lg:justify-end">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-500" /> Filter by Status
            </p>
            <div className="flex bg-surface-100 p-1 rounded-2xl w-fit shadow-inner">
              {[
                { key: 'all', label: 'All' },
                { key: 'active', label: 'Active' },
                { key: 'inactive', label: 'Inactive' }
              ].map((s) => (
                <button
                  key={s.key}
                  onClick={() => setStatusFilter(s.key)}
                  className={`px-6 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-widest ${
                    statusFilter === s.key 
                    ? 'bg-primary-600 text-white shadow-md scale-105' 
                    : 'text-surface-500 hover:text-surface-700'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card p-6 sm:p-8 space-y-6 animate-slide-in mb-8 border border-primary-200 bg-primary-50/30">
          <div className="flex items-center justify-between gap-4 border-b border-surface-200 pb-5">
            <div>
              <h3 className="text-xl font-display font-bold text-surface-900">New resource</h3>
              <p className="mt-1 text-sm font-medium text-surface-500">Define the resource once and reuse it across bookings.</p>
            </div>
            <span className="chip bg-primary-100 text-primary-800 border-primary-200">Create mode</span>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-surface-500 uppercase tracking-widest block mb-2">Name</label>
              <input className="input bg-white border-surface-200 text-surface-900 rounded-xl" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <label className="text-xs font-semibold text-surface-500 uppercase tracking-widest block mb-2">Type</label>
              <select className="input bg-white border-surface-200 text-surface-900 rounded-xl" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-surface-500 uppercase tracking-widest block mb-2">Capacity</label>
              <input type="number" min={1} className="input bg-white border-surface-200 text-surface-900 rounded-xl" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} required />
            </div>
            <div>
              <label className="text-xs font-semibold text-surface-500 uppercase tracking-widest block mb-2">Location</label>
              <input className="input bg-white border-surface-200 text-surface-900 rounded-xl" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-surface-500 uppercase tracking-widest block mb-2">Department Ownership</label>
              <select 
                className="input bg-white border-surface-200 text-surface-900 rounded-xl" 
                value={form.department_id || ''} 
                onChange={e => setForm(f => ({ ...f, department_id: e.target.value === '' ? null : parseInt(e.target.value) }))}
              >
                <option value="">Common Resource (Shared)</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-surface-500 uppercase tracking-widest block mb-2">Image URL</label>
              <input className="input bg-white border-surface-200 text-surface-900 rounded-xl" placeholder="/rooms/example.jpg" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} />
              <p className="text-[10px] text-surface-400 mt-1 font-medium italic">Hint: Use paths like <strong>/rooms/room8.webp</strong> for local assets.</p>
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-xl border border-surface-200 bg-white px-4 py-3 cursor-pointer shadow-sm hover:border-primary-200 transition-colors w-fit">
            <input
              type="checkbox"
              checked={form.approval_required}
              onChange={e => setForm(f => ({ ...f, approval_required: e.target.checked }))}
              className="h-4 w-4 rounded-md border-surface-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm font-semibold text-surface-700">Requires manager approval</span>
          </label>

          <ErrorMessage error={error} />

          <div className="pt-2">
            <button type="submit" className="btn-primary w-full sm:w-auto px-8" disabled={createResource.isPending} id="btn-submit-resource">
              {createResource.isPending ? 'Creating...' : 'Create resource'}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="w-full flex justify-center py-20">
          <LoadingSpinner />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="RS" title="No resources" description="No resources match the current filter." />
      ) : (
        <div className="grid gap-4">
          {filtered.map(r => (
            <div key={r.id} className="card p-3 xl:p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border border-surface-200 hover:border-primary-200/60 transition-all hover:shadow-glow bg-white">
              <div className="flex items-center gap-4">
                <div className="h-20 w-28 rounded-xl overflow-hidden bg-surface-50 border border-surface-100 flex-shrink-0">
                  {r.image_url ? (
                    <img src={r.image_url} alt={r.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-surface-300 text-[10px] font-bold">NO IMG</div>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-display text-lg font-bold text-surface-900 leading-tight">{r.name}</p>
                    {!r.is_active && <span className="chip border-rose-200 bg-rose-50 text-rose-700 text-[10px]">Inactive</span>}
                  </div>
                  <p className="text-sm font-medium text-surface-500">
                    <span className="capitalize">{r.type.replace('_', ' ')}</span> <span className="mx-1.5 opacity-50">•</span> 
                    {r.location || 'Location TBD'} <span className="mx-1.5 opacity-50">•</span> 
                    Capacity {r.capacity}
                  </p>
                </div>
              </div>

              {r.is_active ? (
                <button
                  id={`btn-deactivate-${r.id}`}
                  className="rounded-xl border border-rose-200 bg-white px-5 py-2.5 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50 shadow-sm md:mr-2"
                  onClick={() => setDeactivateId(r.id)}
                >
                  Deactivate
                </button>
              ) : (
                <button
                  id={`btn-reactivate-${r.id}`}
                  className="rounded-xl border border-emerald-200 bg-white px-5 py-2.5 text-sm font-semibold text-emerald-600 transition-colors hover:bg-emerald-50 shadow-sm md:mr-2"
                  onClick={async () => {
                    try {
                      await reactivateResource.mutateAsync(r.id);
                    } catch (err) {
                      setError(err);
                    }
                  }}
                  disabled={reactivateResource.isPending}
                >
                  {reactivateResource.isPending ? 'Restoring...' : 'Reactivate'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={!!deactivateId}
        title="Deactivate resource?"
        message="This will prevent new bookings. Existing bookings are not affected."
        confirmLabel="Deactivate"
        danger
        onConfirm={async () => {
          await deactivateResource.mutateAsync(deactivateId);
          setDeactivateId(null);
        }}
        onCancel={() => setDeactivateId(null)}
      />
    </div>
  );
}
