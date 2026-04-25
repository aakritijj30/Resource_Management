import { X, CheckCircle2, XCircle, Clock, Bell } from 'lucide-react';
import { formatISTDateTime } from '../../utils/time';

export default function NotificationModal({ isOpen, onClose, bookings = [] }) {
  if (!isOpen) return null;

  // Sort bookings by updated_at to show recent status changes
  const sortedUpdates = [...bookings]
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle2 size={20} className="text-emerald-500" />;
      case 'rejected': return <XCircle size={20} className="text-rose-500" />;
      case 'cancelled': return <XCircle size={20} className="text-surface-400" />;
      default: return <Clock size={20} className="text-amber-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return <span className="chip bg-emerald-50 text-emerald-600 border-emerald-100">Approved</span>;
      case 'rejected': return <span className="chip bg-rose-50 text-rose-600 border-rose-100">Rejected</span>;
      case 'cancelled': return <span className="chip bg-surface-50 text-surface-600 border-surface-100">Cancelled</span>;
      default: return <span className="chip bg-amber-50 text-amber-600 border-amber-100">Pending</span>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="card max-w-2xl w-full max-h-[80vh] flex flex-col animate-slide-in overflow-hidden p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <Bell size={20} />
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-surface-900">Notifications</h3>
              <p className="text-sm text-surface-500 font-medium">Recent updates to your resource bookings</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="h-10 w-10 rounded-xl hover:bg-surface-100 flex items-center justify-center text-surface-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {sortedUpdates.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-surface-400 italic font-medium">No notifications found</p>
            </div>
          ) : (
            sortedUpdates.map((b) => (
              <div 
                key={b.id} 
                className="group flex gap-4 p-4 rounded-2xl bg-surface-50/50 border border-surface-100 hover:bg-white hover:shadow-md transition-all duration-300"
              >
                <div className="mt-1 shrink-0">
                  {getStatusIcon(b.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-bold text-surface-900">
                      {b.resource_name || `Resource #${b.resource_id}`}
                    </p>
                    {getStatusBadge(b.status)}
                  </div>
                  
                  <p className="text-sm text-surface-600 mb-3 leading-relaxed">
                    {b.status === 'approved' && `Great news! Your booking has been approved and is ready for use.`}
                    {b.status === 'rejected' && (
                      <>
                        <span className="font-semibold text-rose-600">Rejection Reason:</span> {b.approval?.comment || "No reason provided."}
                      </>
                    )}
                    {b.status === 'pending' && `Your request is currently being reviewed by the department manager.`}
                    {b.status === 'cancelled' && `This booking has been cancelled.`}
                    {b.status === 'completed' && `You have successfully completed this booking.`}
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-surface-400">
                    <span>{formatISTDateTime(b.start_time)} - {formatISTDateTime(b.end_time)}</span>
                    <span className="bg-surface-100 px-2 py-0.5 rounded text-[9px]">{formatISTDateTime(b.updated_at, true)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-surface-50 border-t border-surface-100 flex justify-end">
          <button className="btn-secondary" onClick={onClose}>Close Window</button>
        </div>
      </div>
    </div>
  );
}
