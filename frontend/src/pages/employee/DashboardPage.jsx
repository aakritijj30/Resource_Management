import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import HeroSection from '../../components/dashboard/HeroSection';
import StatCards from '../../components/dashboard/StatCards';
import TodayBookings from '../../components/dashboard/TodayBookings';
import NotificationPanel from '../../components/dashboard/NotificationPanel';
import MaintenancePanel from '../../components/dashboard/MaintenancePanel';
import CalendarWidget from '../../components/dashboard/CalendarWidget';
import { useBookings } from '../../hooks/useBookings';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: bookings = [] } = useBookings();
  const [showTip, setShowTip] = useState(true);

  const upcomingCount = bookings.filter(b => b.status === 'approved').length;
  const pendingCount = bookings.filter(b => b.status === 'pending').length;

  const STATS = [
    { title: 'Upcoming Bookings', value: upcomingCount, icon: 'CalendarClock' },
    { title: 'Pending Approval', value: pendingCount, icon: 'Activity' },
    { title: 'Total Bookings', value: bookings.length, icon: 'Layers' },
  ];

  return (
    <div className="w-full flex-col flex animate-fade-in relative z-10 pb-12">
      {/* Hero row with Tip */}
      <div className={`grid gap-6 mb-8 ${showTip ? 'lg:grid-cols-[1fr_0.35fr]' : 'grid-cols-1'}`}>
        <HeroSection onAddResource={() => navigate('/employee/resources')} compact={showTip} />
        
        {showTip && (
          <div className="rounded-[2rem] bg-primary-600 p-8 text-white shadow-glow relative overflow-hidden flex flex-col justify-center border border-primary-500/50 mt-2">
            <button 
              onClick={() => setShowTip(false)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors z-20"
            >
              <X size={16} />
            </button>
            <div className="relative z-10">
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary-200 mb-2">Pro Tip</p>
              <p className="font-bold text-lg mb-3 leading-tight">Book in advance to ensure availability!</p>
              <p className="text-sm text-primary-100 opacity-80 leading-snug">Most meeting rooms are booked 24 hours ahead during peak times.</p>
            </div>
            <div className="absolute -right-4 -bottom-4 h-32 w-32 bg-white/10 rounded-full blur-3xl" />
          </div>
        )}
      </div>

      {/* Stat Cards */}
      <StatCards stats={STATS} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start mt-8">
        <CalendarWidget bookings={bookings} role="employee" />
        <TodayBookings />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.45fr] items-start mt-8">
        <div className="space-y-6">
          {/* Maintenance Panel moved here for better flow on employee dashboard */}
           <MaintenancePanel />
        </div>

        <div className="space-y-6">
           {/* Notification Panel */}
           <NotificationPanel bookings={bookings} />
        </div>
      </div>
    </div>
  );
}
