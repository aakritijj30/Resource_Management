import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getApprovalQueue } from '../../api/approvalApi';
import { useBookings } from '../../hooks/useBookings';
import { useAuth } from '../../hooks/useAuth';
import HeroSection from '../../components/dashboard/HeroSection';
import CalendarWidget from '../../components/dashboard/CalendarWidget';
import DeptUsageWidget from '../../components/dashboard/DeptUsageWidget';
import { motion } from 'framer-motion';
import { Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import MaintenancePanel from '../../components/dashboard/MaintenancePanel';
import TodayBookings from '../../components/dashboard/TodayBookings';

export default function ApprovalQueuePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const { data: approvals = [], isLoading } = useQuery({
    queryKey: ['approvals', 'queue'],
    queryFn: () => getApprovalQueue().then(r => r.data)
  });

  const { data: myBookings = [] } = useBookings({ mine_only: true });

  return (
    <div className="w-full flex-col flex animate-fade-in relative z-10">
      {isAdmin ? (
        <section className="page-header-card space-y-4 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
               <ShieldCheck className="text-white" size={24} />
            </div>
            <div className="page-kicker !mb-0">System Administration</div>
          </div>
          <h1 className="page-title">Approvals Oversight</h1>
          <p className="page-copy">
            Reviewing pending requests for employees without an assigned manager and monitoring departmental usage.
          </p>
        </section>
      ) : (
        <HeroSection />
      )}

      {!isAdmin && (
        <>
          <div className="my-8">
            <MaintenancePanel />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 items-start">
            <CalendarWidget bookings={myBookings} role="manager" />
            <TodayBookings mineOnly={true} />
          </div>
        </>
      )}

      <div className={`grid gap-6 items-start ${isAdmin ? 'grid-cols-1 lg:grid-cols-[1fr_0.45fr]' : 'lg:grid-cols-[1.2fr_0.8fr]'}`}>
        <div className="space-y-6">
          <DeptUsageWidget />
        </div>

        {/* Approval Queue Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="card flex flex-col h-full"
        >
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Clock size={16} />
              </div>
              <h2 className="text-lg font-bold text-surface-900">Pending Approvals</h2>
            </div>
            <span className="badge bg-amber-100 text-amber-800 border-amber-200">{approvals.length} Requests</span>
          </div>

          {isLoading ? (
            <div className="flex-1 flex items-center justify-center min-h-[200px]">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
            </div>
          ) : approvals.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[200px] text-surface-400">
              <Clock size={40} className="mb-3 opacity-20" />
              <p className="font-semibold">All caught up!</p>
              {isAdmin && <p className="text-xs mt-1 text-center max-w-[180px]">Only employees without managers appear here for admin review.</p>}
            </div>
          ) : (
            <div className="flex flex-col gap-3 overflow-y-auto max-h-[500px] pr-2">
              {approvals.map((a, idx) => (
                <motion.button
                  key={a.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  type="button"
                  className="group flex w-full items-center justify-between gap-3 text-left p-4 rounded-2xl border border-surface-200 bg-surface-50 hover:bg-amber-50 hover:border-amber-200 transition-all shadow-sm"
                  onClick={() => navigate(`/manager/approvals/${a.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm text-xs font-bold text-surface-600 border border-surface-100">
                      #{String(a.booking_id).slice(-2)}
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="bg-white border border-surface-200 rounded-xl p-2 px-3 shadow-sm">
                        <p className="text-[9px] font-bold text-surface-400 uppercase tracking-widest">Requester</p>
                        <p className="font-bold text-surface-900 text-sm truncate max-w-[120px]">{a.user_name || 'System User'}</p>
                      </div>
                      <div className="bg-white border border-surface-200 rounded-xl p-2 px-3 shadow-sm">
                        <p className="text-[9px] font-bold text-surface-400 uppercase tracking-widest">Resource</p>
                        <p className="font-bold text-primary-700 text-sm truncate max-w-[120px]">{a.resource_name || `Booking #${a.booking_id}`}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    <ArrowRight size={20} className="text-amber-600 translate-x-0 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
