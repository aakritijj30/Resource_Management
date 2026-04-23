import { useNavigate } from 'react-router-dom';
import HeroSection from '../../components/dashboard/HeroSection';
import StatCards from '../../components/dashboard/StatCards';
import TodayBookings from '../../components/dashboard/TodayBookings';
import NotificationPanel from '../../components/dashboard/NotificationPanel';
import { useBookings } from '../../hooks/useBookings';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: bookings = [] } = useBookings();

  const upcomingCount = bookings.filter(b => b.status === 'approved').length;
  const pendingCount = bookings.filter(b => b.status === 'pending').length;

  const STATS = [
    { title: 'Upcoming Bookings', value: upcomingCount, icon: 'CalendarClock', trend: '+2%' },
    { title: 'Pending Approval', value: pendingCount, icon: 'Activity' },
    { title: 'Total Bookings', value: bookings.length, icon: 'Layers' },
  ];

  return (
    <div className="w-full flex-col flex animate-fade-in relative z-10 pb-12">
      {/* Hero Section */}
      <HeroSection onAddResource={() => navigate('/employee/resources')} />

      {/* Stat Cards */}
      <StatCards stats={STATS} />

      <div className="grid gap-6 lg:grid-cols-[1fr_0.45fr] items-start">
        <div className="space-y-6">
          {/* Today's Bookings */}
          <TodayBookings />
        </div>

        <div className="space-y-6 lg:sticky lg:top-6">
           {/* Notification Panel */}
           <NotificationPanel bookings={bookings} />
           
           {/* Tips Card */}
           <div className="rounded-3xl bg-primary-600 p-6 text-white shadow-glow relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary-200 mb-2">Pro Tip</p>
                <p className="font-bold text-lg mb-3 leading-tight">Book in advance to ensure availability!</p>
                <p className="text-sm text-primary-100 opacity-80 leading-snug">Most meeting rooms are booked 24 hours ahead during peak times.</p>
              </div>
              <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-white/10 rounded-full blur-2xl" />
           </div>
        </div>
      </div>
    </div>
  );
}
