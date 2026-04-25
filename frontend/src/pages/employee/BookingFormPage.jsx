import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ErrorMessage from '../../components/ErrorMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useResource } from '../../hooks/useResources';
import { useCreateBooking } from '../../hooks/useBookings';
import { isAfterNowIST, toISTDateTimeInput } from '../../utils/time';
import { ArrowLeft } from 'lucide-react';

export default function BookingFormPage() {
  const { resourceId } = useParams();
  const navigate = useNavigate();
  const { data: resource, isLoading } = useResource(resourceId);
  const createBooking = useCreateBooking();

  const [form, setForm] = useState({
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    purpose: '',
    attendees: 1,
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const minStartDate = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!form.start_date || !form.start_time || !form.end_date || !form.end_time) {
      setError(new Error('Please fill out all date and time fields.'));
      return;
    }

    const startDateTime = `${form.start_date}T${form.start_time}`;
    const endDateTime = `${form.end_date}T${form.end_time}`;

    if (!isAfterNowIST(startDateTime)) {
      setError(new Error('Start time must be in the future.'));
      return;
    }
    if (endDateTime <= startDateTime) {
      setError(new Error('End time must be after start time.'));
      return;
    }
    try {
      await createBooking.mutateAsync({
        resource_id: parseInt(resourceId),
        start_time: startDateTime,
        end_time: endDateTime,
        purpose: form.purpose,
        attendees: parseInt(form.attendees),
      });
      setSuccess(true);
      setTimeout(() => navigate('/employee/bookings'), 1500);
    } catch (err) {
      setError(err);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="w-full flex-col flex animate-fade-in relative z-10 max-w-3xl mx-auto">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-800 transition-colors mb-6 self-start"
      >
        <ArrowLeft size={16} />
        Back to catalog
      </button>

      <div className="mb-6 space-y-1">
        <h2 className="text-3xl font-display font-bold text-surface-900 leading-tight">
          Book: {resource?.name}
        </h2>
        <p className="text-surface-500 font-medium">
          {resource?.location} · Capacity {resource?.capacity}
        </p>
        {resource?.approval_required && (
          <div className="flex items-center gap-2 mt-4 text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm font-medium">
            <span>⚠️</span> This resource requires manager approval before confirmation.
          </div>
        )}
      </div>

      {success ? (
        <div className="card text-center py-16 animate-fade-in bg-white/60">
          <div className="text-5xl mb-4">🎉</div>
          <h3 className="text-xl font-bold text-surface-900">Booking Submitted!</h3>
          <p className="text-surface-500 mt-2">Redirecting to your bookings...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card space-y-6 pt-8 pb-8 px-6 sm:px-8 bg-white/80">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-semibold text-surface-500 uppercase tracking-widest block mb-2" htmlFor="start_date">Start Date</label>
              <input id="start_date" type="date" className="input bg-surface-50 border-surface-200 text-surface-900 rounded-xl"
                min={minStartDate}
                value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} required />
            </div>
            <div>
              <label className="text-xs font-semibold text-surface-500 uppercase tracking-widest block mb-2" htmlFor="end_date">End Date</label>
              <input id="end_date" type="date" className="input bg-surface-50 border-surface-200 text-surface-900 rounded-xl"
                min={form.start_date || minStartDate}
                value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} required />
            </div>
            <div>
              <label className="text-xs font-semibold text-surface-500 uppercase tracking-widest block mb-2" htmlFor="start_time">Start Time</label>
              <input id="start_time" type="time" className="input bg-surface-50 border-surface-200 text-surface-900 rounded-xl"
                value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} required />
            </div>
            <div>
              <label className="text-xs font-semibold text-surface-500 uppercase tracking-widest block mb-2" htmlFor="end_time">End Time</label>
              <input id="end_time" type="time" className="input bg-surface-50 border-surface-200 text-surface-900 rounded-xl"
                value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} required />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-surface-500 uppercase tracking-widest block mb-2" htmlFor="purpose">Purpose / Agenda</label>
            <textarea id="purpose" rows={3} className="input resize-none bg-surface-50 border-surface-200 text-surface-900 rounded-xl placeholder:text-surface-400" 
              placeholder="e.g. Sprint planning, design review..."
              value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} required />
          </div>

          <div>
            <label className="text-xs font-semibold text-surface-500 uppercase tracking-widest block mb-2" htmlFor="attendees">Number of Attendees</label>
            <input id="attendees" type="number" min={1} max={resource?.capacity} className="input bg-surface-50 border-surface-200 text-surface-900 rounded-xl"
              value={form.attendees} onChange={e => setForm(f => ({ ...f, attendees: e.target.value }))} required />
            <p className="text-xs text-surface-400 mt-2 font-medium">Maximum capacity: {resource?.capacity}</p>
          </div>

          <ErrorMessage error={error} />

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-surface-100">
            <button type="button" className="btn-secondary sm:w-1/3" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" id="btn-submit-booking" className="btn-primary flex-1" disabled={createBooking.isPending}>
              {createBooking.isPending ? 'Submitting...' : resource?.approval_required ? 'Submit for Approval' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
