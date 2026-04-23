import { useNavigate } from 'react-router-dom';
import HeroSection from '../../components/dashboard/HeroSection';
import StatCards from '../../components/dashboard/StatCards';
import TodayBookings from '../../components/dashboard/TodayBookings';
import { useUsageReport } from '../../hooks/useReports';
import { motion } from 'framer-motion';
import { Shield, Settings, Wrench, BarChart2 } from 'lucide-react';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { data: report } = useUsageReport();

  const STATS = report ? [
    { title: 'Total Bookings', value: report.total_bookings, icon: 'Layers' },
    { title: 'Pending', value: report.pending_bookings, icon: 'Activity' },
    { title: 'Approved', value: report.approved_bookings, icon: 'CalendarClock' },
  ] : [
    { title: 'Total Bookings', value: '-', icon: 'Layers' },
    { title: 'Pending', value: '-', icon: 'Activity' },
    { title: 'Approved', value: '-', icon: 'CalendarClock' },
  ];

  const SHORTCUTS = [
    { title: 'Resources', desc: 'Catalog & limits', icon: <Shield size={24} />, path: '/admin/resources' },
    { title: 'Policies', desc: 'Rules & access', icon: <Settings size={24} />, path: '/admin/policies' },
    { title: 'Maintenance', desc: 'Downtime blocks', icon: <Wrench size={24} />, path: '/admin/maintenance' },
    { title: 'Reports', desc: 'Analytics & logs', icon: <BarChart2 size={24} />, path: '/admin/reports' },
  ];

  return (
    <div className="w-full flex-col flex animate-fade-in relative z-10">
      <HeroSection onAddResource={() => navigate('/admin/resources')} />
      <StatCards stats={STATS} />

      {/* Admin Shortcuts Layer */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {SHORTCUTS.map((item, idx) => (
          <motion.button
            key={item.title}
            onClick={() => navigate(item.path)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + idx * 0.1 }}
            className="flex items-center gap-4 card card-hover p-4 text-left"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
              {item.icon}
            </div>
            <div>
              <h3 className="font-display font-semibold text-surface-900">{item.title}</h3>
              <p className="text-xs text-surface-500 mt-0.5">{item.desc}</p>
            </div>
          </motion.button>
        ))}
      </div>
      <div className="grid grid-cols-1 mb-8">
        <TodayBookings />
      </div>
    </div>
  );
}
