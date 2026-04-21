import { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import Navbar from '../../components/Navbar'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorMessage from '../../components/ErrorMessage'
import { useResources } from '../../hooks/useResources'
import { getPolicy, setPolicy } from '../../api/resourceApi'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

function PolicyForm({ resource }) {
  const qc = useQueryClient()
  const { data: policy, isLoading } = useQuery({
    queryKey: ['policy', resource.id],
    queryFn: () => getPolicy(resource.id).then(r => r.data).catch(() => null)
  })
  const saveMutation = useMutation({
    mutationFn: (data) => setPolicy(resource.id, data),
    onSuccess: () => qc.invalidateQueries(['policy', resource.id])
  })
  const [form, setForm] = useState(null)
  const [error, setError] = useState(null)

  const currentPolicy = form || policy || { max_duration_hours: 8, min_duration_hours: 0.5, office_hours_start: 9, office_hours_end: 18, advance_booking_days: 30 }

  const handleSave = async (e) => {
    e.preventDefault()
    setError(null)
    try { await saveMutation.mutateAsync(currentPolicy) } catch (err) { setError(err) }
  }

  if (isLoading) return <div className="py-4"><LoadingSpinner size="sm" label="" /></div>

  return (
    <form onSubmit={handleSave} className="space-y-3 mt-3 pt-3 border-t border-white/5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { key: 'max_duration_hours',    label: 'Max Hours' },
          { key: 'min_duration_hours',    label: 'Min Hours' },
          { key: 'office_hours_start',    label: 'Start Hour' },
          { key: 'office_hours_end',      label: 'End Hour' },
          { key: 'advance_booking_days',  label: 'Days Advance' },
        ].map(f => (
          <div key={f.key}>
            <label className="label text-xs">{f.label}</label>
            <input type="number" step="0.5" className="input text-sm" value={currentPolicy[f.key] ?? ''}
              onChange={e => setForm(p => ({ ...(p || currentPolicy), [f.key]: parseFloat(e.target.value) }))} />
          </div>
        ))}
      </div>
      <ErrorMessage error={error} />
      <button type="submit" className="btn-primary text-sm" disabled={saveMutation.isPending}>
        {saveMutation.isPending ? 'Saving...' : 'Save Policy'}
      </button>
    </form>
  )
}

export default function PolicyConfigPage() {
  const { data: resources = [], isLoading } = useResources()
  const [expanded, setExpanded] = useState(null)

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar title="Policy Configuration" />
        <main className="flex-1 p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Resource Policies</h2>
            <p className="text-white/40 mt-1">Configure per-resource booking rules</p>
          </div>
          {isLoading ? <LoadingSpinner /> : (
            <div className="space-y-3">
              {resources.map(r => (
                <div key={r.id} className="card">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
                    <div>
                      <p className="font-semibold">{r.name}</p>
                      <p className="text-sm text-white/40">{r.type.replace('_',' ')}</p>
                    </div>
                    <span className="text-white/30 text-sm">{expanded === r.id ? '▲' : '▼'} Configure</span>
                  </div>
                  {expanded === r.id && <PolicyForm resource={r} />}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
