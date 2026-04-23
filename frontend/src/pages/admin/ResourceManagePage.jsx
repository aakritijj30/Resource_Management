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
  const { data: resources = [], isLoading, error: resourcesError } = useResources({ active_only: false })
  const createResource = useCreateResource()
  const deactivateResource = useDeactivateResource()

  const [showForm, setShowForm] = useState(false)
  const [deactivateId, setDeactivateId] = useState(null)
  const [formError, setFormError] = useState(null)
  const [form, setForm] = useState({
    name: '',
    type: 'conference_room',
    capacity: 1,
    location: '',
    approval_required: false,
  })

  const handleCreate = async (e) => {
    e.preventDefault()
    setFormError(null)

    try {
      await createResource.mutateAsync({ ...form, capacity: parseInt(form.capacity) })
      setShowForm(false)
      setForm({ name: '', type: 'conference_room', capacity: 1, location: '', approval_required: false })
    } catch (err) {
      setFormError(err)
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar title="Manage Resources" />
        <main className="flex-1 p-6 space-y-6">
          <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="page-kicker">Resource administration</div>
              <h1 className="page-title">Manage the shared inventory</h1>
              <p className="page-copy">
                Keep the catalog clean, control approval rules, and deactivate resources without affecting existing bookings.
              </p>
            </div>

            <button className="btn-primary inline-flex items-center gap-2 self-start" id="btn-add-resource" onClick={() => setShowForm(!showForm)}>
              <span className="text-base leading-none">{showForm ? '−' : '+'}</span>
              {showForm ? 'Close form' : 'Add resource'}
            </button>
          </section>

          {showForm && (
            <form onSubmit={handleCreate} className="section-shell space-y-5 animate-slide-in">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-display font-semibold text-white">New resource</h3>
                  <p className="mt-1 text-sm text-white/40">Define the resource once and reuse it across bookings.</p>
                </div>
                <span className="chip">Create mode</span>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="label">Name</label>
                  <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Type</label>
                  <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    {TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Capacity</label>
                  <input type="number" min={1} className="input" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Location</label>
                  <input className="input" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                </div>
              </div>

              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.approval_required}
                  onChange={e => setForm(f => ({ ...f, approval_required: e.target.checked }))}
                  className="h-4 w-4 rounded border-white/20 bg-transparent"
                />
                <span className="text-sm text-white/70">Requires manager approval</span>
              </label>

              <ErrorMessage error={formError} />

              <button type="submit" className="btn-primary" disabled={createResource.isPending} id="btn-submit-resource">
                {createResource.isPending ? 'Creating...' : 'Create resource'}
              </button>
            </form>
          )}

          {resourcesError ? (
            <div className="section-shell">
              <ErrorMessage error={resourcesError} />
            </div>
          ) : isLoading ? (
            <LoadingSpinner />
          ) : resources.length === 0 ? (
            <EmptyState icon="RS" title="No resources" description="Add your first resource above." />
          ) : (
            <div className="grid gap-4">
              {resources.map(r => (
                <div key={r.id} className="card flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-lg font-semibold text-white">{r.name}</p>
                      {!r.is_active && <span className="chip border-red-400/20 bg-red-500/10 text-red-100">Inactive</span>}
                    </div>
                    <p className="text-sm text-white/45">
                      {r.type.replace('_', ' ')} · {r.location || 'Location TBD'} · Capacity {r.capacity}
                    </p>
                  </div>

                  {r.is_active && (
                    <button
                      id={`btn-deactivate-${r.id}`}
                      className="rounded-full border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-100 transition-colors hover:bg-red-500/15"
                      onClick={() => setDeactivateId(r.id)}
                    >
                      Deactivate
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <ConfirmModal
        isOpen={!!deactivateId}
        title="Deactivate resource?"
        message="This will prevent new bookings. Existing bookings are not affected."
        confirmLabel="Deactivate"
        danger
        onConfirm={async () => {
          await deactivateResource.mutateAsync(deactivateId)
          setDeactivateId(null)
        }}
        onCancel={() => setDeactivateId(null)}
      />
    </div>
  )
}
