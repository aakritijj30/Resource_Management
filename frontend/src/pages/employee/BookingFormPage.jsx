import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Navbar from '../../components/Navbar'
import ErrorMessage from '../../components/ErrorMessage'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useResource } from '../../hooks/useResources'
import { useCreateBooking } from '../../hooks/useBookings'
import { isAfterNowIST, toISTDateTimeInput } from '../../utils/time'

export default function BookingFormPage() {
  const { resourceId } = useParams()
  const navigate = useNavigate()
  const { data: resource, isLoading } = useResource(resourceId)
  const createBooking = useCreateBooking()

  const [form, setForm] = useState({
    start_time: '',
    end_time: '',
    purpose: '',
    attendees: 1,
  })
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const minStart = toISTDateTimeInput(new Date())

  const handleSubmit = async (e) => {
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
      await createBooking.mutateAsync({
        resource_id: parseInt(resourceId),
        start_time: form.start_time,
        end_time: form.end_time,
        purpose: form.purpose,
        attendees: parseInt(form.attendees),
      })
      setSuccess(true)
      setTimeout(() => navigate('/employee/bookings'), 1500)
    } catch (err) {
      setError(err)
    }
  }

  if (isLoading) return <div className="flex min-h-screen"><Sidebar /><div className="flex-1"><Navbar title="Book Resource" /><LoadingSpinner /></div></div>

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar title="Book Resource" />
        <main className="flex-1 p-6 max-w-2xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Book: {resource?.name}</h2>
            <p className="text-white/40 mt-1">{resource?.location} · Capacity {resource?.capacity}</p>
            {resource?.approval_required && (
              <div className="flex items-center gap-2 mt-3 text-yellow-300 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 text-sm">
                <span>⚠️</span> This resource requires manager approval before confirmation.
              </div>
            )}
          </div>

          {success ? (
            <div className="card text-center py-12 animate-fade-in">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-lg font-semibold">Booking Submitted!</h3>
              <p className="text-white/40 mt-1">Redirecting to your bookings...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="card space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label" htmlFor="start_time">Start Time</label>
                  <input id="start_time" type="datetime-local" className="input"
                    min={minStart}
                    value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} required />
                </div>
                <div>
                  <label className="label" htmlFor="end_time">End Time</label>
                  <input id="end_time" type="datetime-local" className="input"
                    min={form.start_time || minStart}
                    value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} required />
                </div>
              </div>

              <div>
                <label className="label" htmlFor="purpose">Purpose / Agenda</label>
                <textarea id="purpose" rows={3} className="input resize-none" placeholder="e.g. Sprint planning, design review..."
                  value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} required />
              </div>

              <div>
                <label className="label" htmlFor="attendees">Number of Attendees</label>
                <input id="attendees" type="number" min={1} max={resource?.capacity} className="input"
                  value={form.attendees} onChange={e => setForm(f => ({ ...f, attendees: e.target.value }))} required />
                <p className="text-xs text-white/30 mt-1">Maximum: {resource?.capacity}</p>
              </div>

              <ErrorMessage error={error} />

              <div className="flex gap-3 pt-2">
                <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>Back</button>
                <button type="submit" id="btn-submit-booking" className="btn-primary flex-1" disabled={createBooking.isPending}>
                  {createBooking.isPending ? 'Submitting...' : resource?.approval_required ? 'Submit for Approval' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  )
}
