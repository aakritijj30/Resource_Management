import { useState } from 'react';
import { Bell, CheckCircle2, XCircle, Clock, ChevronRight } from 'lucide-react';
import { formatISTDateTime } from '../../utils/time';
import NotificationModal from './NotificationModal';

export default function NotificationPanel({ bookings = [] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      case 'rejected': 
        const reason = booking.approval?.comment ? `: ${booking.approval.comment}` : '';
        return `Your booking for ${resource} was rejected${reason}`;
      case 'cancelled': return `Your booking for ${resource} is now cancelled.`;
      case 'pending': return `Booking for ${resource} is awaiting approval.`;
      default: return `Status updated for ${resource}.`;
    }
  };

  return (
    <>
      <div className="card h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-semibold text-surface-900 text-lg">Alerts</h3>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="h-8 w-8 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center relative hover:bg-primary-100 transition-colors"
          >
            <Bell size={18} />
            {recentUpdates.some(b => b.status !== 'pending') && (
              <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-rose-500 border-2 border-white" />
            )}
          </button>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto max-h-[450px] pr-1 mb-4">
          {recentUpdates.length === 0 ? (
            <p className="text-sm text-surface-400 text-center py-8 italic">No recent activity</p>
          ) : (
            recentUpdates.map(b => (
              <div 
                key={b.id} 
                className="flex flex-col gap-2 p-3 rounded-2xl bg-surface-50/50 border border-surface-100 hover:bg-white transition-all group"
              >
                <div className="flex gap-3">
                  <div className="mt-0.5 shrink-0">
                    {getStatusIcon(b.status)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-surface-900 leading-tight">
                      {getStatusMessage(b)}
                    </p>
                    <p className="mt-1 text-[10px] uppercase font-bold tracking-widest text-surface-400">
                      {formatISTDateTime(b.updated_at, true)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button 
                     onClick={() => setIsModalOpen(true)}
                     className="text-[10px] font-bold uppercase tracking-widest text-primary-600 bg-primary-50 px-2 py-1 rounded-lg hover:bg-primary-100"
                   >
                     View Details
                   </button>
                   <button className="text-[10px] font-bold uppercase tracking-widest text-surface-400 hover:text-surface-600">
                     Dismiss
                   </button>
                </div>
              </div>
            ))
          )}
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="mt-auto pt-4 border-t border-surface-100 flex items-center justify-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors group"
        >
          <span>View All Alerts</span>
          <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      <NotificationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        bookings={bookings} 
      />
    </>
  );
}
