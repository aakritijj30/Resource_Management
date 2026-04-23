import { useQuery } from '@tanstack/react-query';
import api from '../../api/axiosInstance';
import LoadingSpinner from '../LoadingSpinner';
import StatusBadge from '../StatusBadge';
import { formatISTTime, isTodayIST } from '../../utils/time';
import { Clock } from 'lucide-react';

export default function TodayBookings() {
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['all-bookings'],
    queryFn: () => api.get('/bookings').then(r => r.data)
  });

  const todayBookings = bookings.filter(b => isTodayIST(b.start_time));

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
          <h3 className="font-display font-semibold text-surface-900 text-lg">Today's Bookings</h3>
          <p className="text-xs text-surface-500 mt-1">Live tracking for the current day</p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
          <Clock size={16} />
        </div>
      </div>

      {todayBookings.length === 0 ? (
        <div className="p-8 flex flex-col items-center justify-center text-center">
          <img 
            src="/empty_bookings.png" 
            alt="No bookings today" 
            className="w-48 h-48 object-contain mb-4 opacity-90 mix-blend-multiply" 
          />
          <h4 className="text-lg font-semibold text-surface-900">No bookings today</h4>
          <p className="text-sm text-surface-500 max-w-[250px] mt-2">
            Enjoy the free time! The schedule is perfectly clear for the rest of the day.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-surface-100 max-h-[400px] overflow-y-auto">
          {todayBookings.map(b => (
            <div key={b.id} className="p-4 hover:bg-surface-50 transition-colors flex items-center justify-between">
              <div>
                <p className="font-bold text-surface-900">{b.resource_name || `Resource #${b.resource_id}`}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold text-primary-600 px-2 py-0.5 bg-primary-50 rounded-lg">
                    {formatISTTime(b.start_time)} - {formatISTTime(b.end_time)}
                  </span>
                  <span className="text-xs text-surface-400 font-medium">by {b.user_name || `User #${b.user_id}`}</span>
                </div>
              </div>
              <StatusBadge status={b.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
