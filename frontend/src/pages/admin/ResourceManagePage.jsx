import { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import Navbar from '../../components/Navbar'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import ConfirmModal from '../../components/ConfirmModal'
import ErrorMessage from '../../components/ErrorMessage'
import { useResources, useCreateResource, useDeactivateResource } from '../../hooks/useResources'

const TYPES = ['conference_room', 'equipment', 'vehicle', 'lab', 'other']

export default function ResourceManagePage() {
  const { data: resources = [], isLoading } = useResources({ active_only: false })
  const createResource   = useCreateResource()
  const deactivateResource = useDeactivateResource()

  const [showForm, setShowForm] = useState(false)
  const [deactivateId, setDeactivateId] = useState(null)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ name: '', type: 'conference_room', capacity: 1, location: '', approval_required: false })

  const handleCreate = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      await createResource.mutateAsync({ ...form, capacity: parseInt(form.capacity) })
      setShowForm(false)
      setForm({ name: '', type: 'conference_room', capacity: 1, location: '', approval_required: false })
    } catch (err) { setError(err) }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar title="Manage Resources" />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Resources</h2>
              <p className="text-white/40 mt-1">{resources.length} total resources</p>
            </div>
            <button className="btn-primary" id="btn-add-resource" onClick={() => setShowForm(!showForm)}>
              {showForm ? '✕ Cancel' : '+ Add Resource'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleCreate} className="card space-y-4 animate-slide-in">
              <h3 className="font-semibold">New Resource</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Name</label>
                  <input className="input" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required />
                </div>
                <div>
                  <label className="label">Type</label>
                  <select className="input" value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))}>
                    {TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Capacity</label>
                  <input type="number" min={1} className="input" value={form.capacity} onChange={e => setForm(f => ({...f, capacity: e.target.value}))} required />
                </div>
                <div>
                  <label className="label">Location</label>
                  <input className="input" value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))} />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.approval_required} onChange={e => setForm(f => ({...f, approval_required: e.target.checked}))} className="rounded" />
                <span className="text-sm text-white/70">Requires manager approval</span>
              </label>
              <ErrorMessage error={error} />
              <button type="submit" className="btn-primary" disabled={createResource.isPending} id="btn-submit-resource">
                {createResource.isPending ? 'Creating...' : 'Create Resource'}
              </button>
            </form>
          )}

          {isLoading ? <LoadingSpinner /> : resources.length === 0 ? <EmptyState icon="🏢" title="No resources" description="Add your first resource above." /> : (
            <div className="space-y-3">
              {resources.map(r => (
                <div key={r.id} className="card flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{r.name}</p>
                      {!r.is_active && <span className="badge bg-red-500/20 text-red-300 border border-red-500/30">Inactive</span>}
                    </div>
                    <p className="text-sm text-white/40">{r.type.replace('_',' ')} · {r.location} · Cap: {r.capacity}</p>
                  </div>
                  {r.is_active && (
                    <button id={`btn-deactivate-${r.id}`} className="text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-all"
                      onClick={() => setDeactivateId(r.id)}>
                      Deactivate
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <ConfirmModal isOpen={!!deactivateId} title="Deactivate Resource?"
        message="This will prevent new bookings. Existing bookings are not affected."
        confirmLabel="Deactivate" danger
        onConfirm={async () => { await deactivateResource.mutateAsync(deactivateId); setDeactivateId(null) }}
        onCancel={() => setDeactivateId(null)} />
    </div>
  )
}
