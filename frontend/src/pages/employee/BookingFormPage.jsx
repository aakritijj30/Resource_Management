import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ErrorMessage from '../../components/ErrorMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useResource, useResourceBookings } from '../../hooks/useResources';
import { useCreateBooking } from '../../hooks/useBookings';
import { isAfterNowIST, toISTDateTimeInput } from '../../utils/time';
import { ArrowLeft } from 'lucide-react';
import clsx from 'clsx';

export default function BookingFormPage() {
  const { resourceId } = useParams();
  const navigate = useNavigate();
  const { data: resource, isLoading: isLoadingResource } = useResource(resourceId);
  const { data: existingBookings = [], isLoading: isLoadingBookings } = useResourceBookings(resourceId);
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

  if (isLoadingResource) {
    return (
      <div className="w-full flex justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  const formatDateTime = (dtStr) => {
    const d = new Date(dtStr);
    return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-full flex-col flex animate-fade-in relative z-10 max-w-6xl mx-auto">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-800 transition-colors mb-6 self-start"
      >
        <ArrowLeft size={16} />
        Back to catalog
      </button>

      <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">
        <div className="space-y-6">
          <div className="mb-6 space-y-4">
            {resource?.image_url && (
              <div className="h-48 w-full rounded-3xl overflow-hidden shadow-lg border border-surface-200/50">
                <img src={resource.image_url} alt={resource.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div>
              <h2 className="text-3xl font-display font-bold text-surface-900 leading-tight">
                Book: {resource?.name}
              </h2>
              <p className="text-surface-500 font-medium">
                {resource?.location} · Capacity {resource?.capacity}
              </p>
            </div>
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
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-surface-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary-500"></span>
                  1. Select Date Range
                </h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-surface-50 p-4 rounded-2xl border border-surface-100 transition-all focus-within:border-primary-300 focus-within:ring-4 focus-within:ring-primary-500/10">
                    <label className="text-[10px] font-bold text-primary-600 uppercase tracking-widest block mb-2" htmlFor="start_date">From Date</label>
                    <input id="start_date" type="date" className="w-full bg-transparent text-lg font-display font-semibold text-surface-900 focus:outline-none"
                      min={minStartDate}
                      value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} required />
                  </div>
                  <div className="bg-surface-50 p-4 rounded-2xl border border-surface-100 transition-all focus-within:border-primary-300 focus-within:ring-4 focus-within:ring-primary-500/10">
                    <label className="text-[10px] font-bold text-primary-600 uppercase tracking-widest block mb-2" htmlFor="end_date">To Date</label>
                    <input id="end_date" type="date" className="w-full bg-transparent text-lg font-display font-semibold text-surface-900 focus:outline-none"
                      min={form.start_date || minStartDate}
                      value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} required />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-surface-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary-500"></span>
                  2. Daily Time Window
                </h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-surface-50 p-4 rounded-2xl border border-surface-100 transition-all focus-within:border-primary-300 focus-within:ring-4 focus-within:ring-primary-500/10">
                    <label className="text-[10px] font-bold text-primary-600 uppercase tracking-widest block mb-2" htmlFor="start_time">Start Time</label>
                    <input id="start_time" type="time" className="w-full bg-transparent text-lg font-display font-semibold text-surface-900 focus:outline-none"
                      value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} required />
                  </div>
                  <div className="bg-surface-50 p-4 rounded-2xl border border-surface-100 transition-all focus-within:border-primary-300 focus-within:ring-4 focus-within:ring-primary-500/10">
                    <label className="text-[10px] font-bold text-primary-600 uppercase tracking-widest block mb-2" htmlFor="end_time">End Time</label>
                    <input id="end_time" type="time" className="w-full bg-transparent text-lg font-display font-semibold text-surface-900 focus:outline-none"
                      value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} required />
                  </div>
                </div>
              </div>

              {form.start_date && form.end_date && form.start_date !== form.end_date && (
                <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 flex gap-4">
                  <div className="h-10 w-10 shrink-0 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                    📅
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-blue-900">Multi-day Recurring Booking</h4>
                    <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                      Booking separate entries for each day in range.
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-surface-500 uppercase tracking-widest block mb-2" htmlFor="purpose">Purpose / Agenda</label>
                <textarea id="purpose" rows={3} className="input resize-none bg-surface-50 border-surface-200 text-surface-900 rounded-xl placeholder:text-surface-400" 
                  placeholder="e.g. Sprint planning..."
                  value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} required />
              </div>

              <div>
                <label className="text-xs font-semibold text-surface-500 uppercase tracking-widest block mb-2" htmlFor="attendees">Number of Attendees</label>
                <input id="attendees" type="number" min={1} max={resource?.capacity} className="input bg-surface-50 border-surface-200 text-surface-900 rounded-xl"
                  value={form.attendees} onChange={e => setForm(f => ({ ...f, attendees: e.target.value }))} required />
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

        {/* Sidebar */}
        <div className="space-y-4 sticky top-6">
          <div className="card bg-surface-50/50 border-surface-200/60 p-5">
            <h3 className="text-xs font-bold text-surface-400 uppercase tracking-widest mb-4">Upcoming Schedule</h3>
            {isLoadingBookings ? (
              <LoadingSpinner size="sm" />
            ) : existingBookings.length === 0 ? (
              <p className="text-sm text-surface-400 font-medium italic">No upcoming bookings.</p>
            ) : (
              <div className="space-y-3">
                {existingBookings.slice(0, 8).map(b => (
                  <div key={b.id} className="bg-white rounded-xl p-3 border border-surface-100 shadow-sm">
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-[11px] font-bold text-primary-600 truncate max-w-[120px]">
                        {resource?.name.toLowerCase().includes('parking') ? 'Reserved Slot' : b.user_name}
                      </p>
                      <span className={clsx(
                        'text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase',
                        b.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      )}>
                        {b.status}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-surface-900 mt-1">
                      {formatDateTime(b.start_time)}
                    </p>
                    <p className="text-[10px] font-medium text-surface-500">
                      to {formatDateTime(b.end_time)}
                    </p>
                  </div>
                ))}
                {existingBookings.length > 8 && (
                  <p className="text-[10px] text-center text-surface-400 font-bold uppercase tracking-wider mt-2">
                    + {existingBookings.length - 8} more bookings
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="card bg-primary-900 text-white p-5 border-none shadow-xl">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-primary-300 mb-2">Policy Note</h4>
            <p className="text-xs leading-relaxed text-primary-100 font-medium">
              Bookings for this resource are exclusive. Once a slot is {resource?.approval_required ? 'requested' : 'confirmed'}, it will be blocked for others.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
