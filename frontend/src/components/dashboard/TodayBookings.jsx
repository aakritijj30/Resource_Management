import { useNavigate } from 'react-router-dom';
import { useBookings } from '../../hooks/useBookings';
import LoadingSpinner from '../LoadingSpinner';
import StatusBadge from '../StatusBadge';
import { formatISTTime, isTodayIST } from '../../utils/time';
import { Clock, Plus } from 'lucide-react';

export default function TodayBookings({ mineOnly = false }) {
  const navigate = useNavigate();
  const { data: bookings = [], isLoading } = useBookings({ mine_only: mineOnly });

  const todayBookings = bookings
    .filter(b => isTodayIST(b.start_time))
    .slice(0, 3); // Increased visible items to 3

  if (isLoading) {
    return (
      <div className="card h-64 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="px-6 py-5 border-b border-surface-100 flex items-center justify-between bg-white/50">
        <div>
          <h3 className="font-display font-black text-surface-950 text-lg">Today's Bookings</h3>
          <p className="text-xs text-surface-800 mt-1 font-bold">Live tracking for the current day</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/employee/resources')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary-600 text-white text-xs font-bold shadow-glow hover:bg-primary-700 transition-colors"
          >
            <Plus size={14} />
            <span>New Booking</span>
          </button>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
            <Clock size={16} />
          </div>
        </div>
      </div>

      {todayBookings.length === 0 ? (
        <div className="p-8 flex flex-col items-center justify-center text-center">
          <img 
            src="/empty_bookings.png" 
            alt="No bookings today" 
            className="w-48 h-48 object-contain mb-4 opacity-90 mix-blend-multiply" 
          />
          <h4 className="text-lg font-black text-surface-950">No bookings today</h4>
          <p className="text-sm text-surface-800 font-bold max-w-[250px] mt-2">
            Enjoy the free time! The schedule is perfectly clear for the rest of the day.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-surface-100">
          {todayBookings.map(b => (
            <div key={b.id} className="p-4 hover:bg-surface-50 transition-colors flex items-center justify-between">
              <div>
                <p className="font-black text-surface-950">{b.resource_name || `Resource #${b.resource_id}`}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-black text-primary-600 px-2 py-0.5 bg-primary-50 rounded-lg">
                    {formatISTTime(b.start_time)} - {formatISTTime(b.end_time)}
                  </span>
                  <span className="text-xs text-surface-800 font-bold">by {b.user_name || `User #${b.user_id}`}</span>
                </div>
              </div>
              <StatusBadge status={b.status} />
            </div>
          ))}
          {bookings.filter(b => isTodayIST(b.start_time)).length > 3 && (
            <button 
              onClick={() => navigate('/employee/bookings')}
              className="w-full py-3 text-xs font-bold text-primary-600 hover:bg-primary-50 transition-colors"
            >
              View all today's bookings
            </button>
          )}
        </div>
      )}
    </div>
  );
}
