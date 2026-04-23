import { Bell, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { formatISTDateTime } from '../../utils/time';

export default function NotificationPanel({ bookings = [] }) {
  // Sort bookings by updated_at to show recent status changes
  const recentUpdates = [...bookings]
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 5);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle2 size={16} className="text-emerald-500" />;
      case 'rejected': return <XCircle size={16} className="text-rose-500" />;
      case 'cancelled': return <XCircle size={16} className="text-surface-400" />;
      default: return <Clock size={16} className="text-amber-500" />;
    }
  };

  const getStatusMessage = (booking) => {
    const resource = booking.resource_name || `Resource #${booking.resource_id}`;
    switch (booking.status) {
      case 'approved': return `Your booking for ${resource} has been approved.`;
      case 'rejected': return `Your booking for ${resource} was rejected.`;
      case 'cancelled': return `Your booking for ${resource} is now cancelled.`;
      case 'pending': return `Booking for ${resource} is awaiting approval.`;
      default: return `Status updated for ${resource}.`;
    }
  };

  return (
    <div className="card h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-semibold text-surface-900 text-lg">Alerts</h3>
        <div className="h-8 w-8 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center relative">
          <Bell size={18} />
          {recentUpdates.some(b => b.status !== 'pending') && (
            <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-rose-500 border-2 border-white" />
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto max-h-[350px] pr-1">
        {recentUpdates.length === 0 ? (
          <p className="text-sm text-surface-400 text-center py-8 italic">No recent activity</p>
        ) : (
          recentUpdates.map(b => (
            <div key={b.id} className="flex gap-3 p-3 rounded-2xl bg-surface-50/50 border border-surface-100 hover:bg-white transition-colors">
              <div className="mt-0.5 shrink-0">
                {getStatusIcon(b.status)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-surface-900 leading-tight">
                  {getStatusMessage(b)}
                </p>
                <p className="mt-1 text-[10px] uppercase font-bold tracking-widest text-surface-400">
                  {formatISTDateTime(b.updated_at, true)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
