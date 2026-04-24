import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import ConfirmModal from '../../components/ConfirmModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import BookingSummary from '../../components/BookingSummary';
import { useBookings, useCancelBooking } from '../../hooks/useBookings';
import { formatISTDateTime, formatISTTime, isAfterNowIST } from '../../utils/time';
import { ArrowLeft } from 'lucide-react';

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const { data: bookings = [], isLoading } = useBookings({ mine_only: true });
  const cancelBooking = useCancelBooking();
  const [cancelId, setCancelId] = useState(null);

  const handleCancel = async () => {
    await cancelBooking.mutateAsync(cancelId);
    setCancelId(null);
  };

  return (
    <div className="w-full flex-col flex animate-fade-in relative z-10 pb-10">
      
      {/* Header */}
      <section className="page-header-card space-y-6">
        <div className="flex items-center justify-between gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary-100/70 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            Back
          </button>
          
          <button 
             className="group flex h-10 items-center gap-2 rounded-full bg-white/10 px-4 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-md border border-white/20 transition-all hover:bg-white hover:text-primary-700 active:scale-95" 
             onClick={() => navigate('/employee/resources')}
          >
            + New Booking
          </button>
        </div>

        <div className="space-y-2">
          <div className="page-kicker">Personal tracker</div>
          <h1 className="page-title">My bookings</h1>
          <p className="page-copy">
            {bookings.length} total booking{bookings.length !== 1 ? 's' : ''}. Track your history and approvals.
          </p>
        </div>
      </section>

      {/* Booking Summary Widget (Ensure inside it uses surface colors) */}
      <div className="mb-6">
        <BookingSummary
          bookings={bookings}
          title="Status overview"
          subtitle="Track every booking state in a glance."
        />
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : bookings.length === 0 ? (
        <EmptyState icon="BK" title="No bookings yet" description="Make your first booking by browsing available resources." />
      ) : (
        <div className="grid gap-4">
          {bookings.map(b => (
            <div
              key={b.id}
              className="card flex cursor-pointer flex-col gap-4 transition-all duration-200 hover:-translate-y-1 hover:border-primary-200/60 hover:shadow-glow md:flex-row md:items-center md:justify-between p-5"
              onClick={() => navigate(`/employee/bookings/${b.id}`)}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-display font-semibold text-surface-900 group-hover:text-primary-700 transition-colors">{b.purpose}</p>
                <p className="mt-1 text-sm font-medium text-surface-500">
                  {formatISTDateTime(b.start_time)} - {formatISTTime(b.end_time)}
                </p>
              </div>

              <div className="flex items-center gap-4 md:flex-shrink-0">
                <StatusBadge status={b.status} />
                {['pending', 'approved'].includes(b.status) && isAfterNowIST(b.start_time) && (
                  <button
                    id={`btn-cancel-${b.id}`}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50"
                    onClick={e => {
                      e.stopPropagation();
                      setCancelId(b.id);
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={!!cancelId}
        title="Cancel Booking?"
        message="This will free up the slot immediately. This action cannot be undone."
        confirmLabel="Yes, Cancel"
        danger
        onConfirm={handleCancel}
        onCancel={() => setCancelId(null)}
      />
    </div>
  );
}
