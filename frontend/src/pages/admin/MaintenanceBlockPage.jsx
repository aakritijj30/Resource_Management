import { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import Navbar from '../../components/Navbar'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import ConfirmModal from '../../components/ConfirmModal'
import ErrorMessage from '../../components/ErrorMessage'
import { useResources } from '../../hooks/useResources'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../api/axiosInstance'
import { formatISTDate, formatISTDateTime, isAfterNowIST, toISTDateTimeInput } from '../../utils/time'

export default function MaintenanceBlockPage() {
  const { data: resources = [] } = useResources()
  const qc = useQueryClient()
  const { data: blocks = [], isLoading } = useQuery({
    queryKey: ['maintenance'],
    queryFn: () => api.get('/maintenance').then(r => r.data)
  })
  const createBlock = useMutation({
    mutationFn: (data) => api.post('/maintenance', data),
    onSuccess: () => qc.invalidateQueries(['maintenance'])
  })
  const deleteBlock = useMutation({
    mutationFn: (id) => api.delete(`/maintenance/${id}`),
    onSuccess: () => qc.invalidateQueries(['maintenance'])
  })

  const [form, setForm] = useState({ resource_id: '', start_time: '', end_time: '', reason: '' })
  const [deleteId, setDeleteId] = useState(null)
  const [error, setError] = useState(null)
  const minStart = toISTDateTimeInput(new Date())

  const handleCreate = async (e) => {
    e.preventDefault()
    setError(null)
    if (!isAfterNowIST(form.start_time)) {
      setError(new Error('Start time must be in the future.'))
      return
    }
    if (!form.end_time || form.end_time <= form.start_time) {
      setError(new Error('End time must be after start time.'))
      return
    }
    try {
      await createBlock.mutateAsync({
        ...form,
        resource_id: parseInt(form.resource_id),
        start_time: form.start_time,
        end_time: form.end_time
      })
      setForm({ resource_id: '', start_time: '', end_time: '', reason: '' })
    } catch (err) {
      setError(err)
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar title="Maintenance Blocks" />
        <main className="flex-1 p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Maintenance Blocks</h2>
            <p className="text-white/40 mt-1">Block resources for maintenance - affected bookings will be cancelled automatically.</p>
          </div>

          <form onSubmit={handleCreate} className="card space-y-4">
            <h3 className="font-semibold">New Maintenance Block</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Resource</label>
                <select className="input" value={form.resource_id} onChange={e => setForm(f => ({ ...f, resource_id: e.target.value }))} required>
                  <option value="">Select resource...</option>
                  {resources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Reason</label>
                <input className="input" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder="e.g. Deep cleaning" required />
              </div>
              <div>
                <label className="label">Start</label>
                <input type="datetime-local" className="input" min={minStart} value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} required />
              </div>
              <div>
                <label className="label">End</label>
                <input type="datetime-local" className="input" min={form.start_time || minStart} value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} required />
              </div>
            </div>
            <ErrorMessage error={error} />
            <button type="submit" className="btn-primary" disabled={createBlock.isPending} id="btn-create-maintenance">
              {createBlock.isPending ? 'Creating...' : '🔧 Create Block'}
            </button>
          </form>

          {isLoading ? (
            <LoadingSpinner />
          ) : blocks.length === 0 ? (
            <EmptyState icon="✓" title="No active maintenance blocks" />
          ) : (
            <div className="space-y-3">
              {blocks.map(b => (
                <div key={b.id} className="card flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{b.reason}</p>
                    <p className="text-sm text-white/40">
                      Resource #{b.resource_id} · {formatISTDate(b.start_time, false)} - {formatISTDateTime(b.end_time)}
                    </p>
                  </div>
                  <button
                    className="text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-all"
                    id={`btn-del-block-${b.id}`}
                    onClick={() => setDeleteId(b.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
      <ConfirmModal
        isOpen={!!deleteId}
        title="Remove Maintenance Block?"
        message="This will allow new bookings for this time slot."
        confirmLabel="Remove"
        danger
        onConfirm={async () => { await deleteBlock.mutateAsync(deleteId); setDeleteId(null) }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
