import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getApprovalQueue } from '../../api/approvalApi';
import { formatISTDateTime } from '../../utils/time';
import HeroSection from '../../components/dashboard/HeroSection';

import DeptUsageWidget from '../../components/dashboard/DeptUsageWidget';
import { motion } from 'framer-motion';
import { Clock, ArrowRight } from 'lucide-react';
import MaintenancePanel from '../../components/dashboard/MaintenancePanel';

export default function ApprovalQueuePage() {
  const navigate = useNavigate();
  const { data: approvals = [], isLoading } = useQuery({
    queryKey: ['approvals', 'queue'],
    queryFn: () => getApprovalQueue().then(r => r.data)
  });

  return (
    <div className="w-full flex-col flex animate-fade-in relative z-10">
      <HeroSection />
      <div className="my-8">
        <MaintenancePanel />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] items-start">
        <DeptUsageWidget />

        {/* Approval Queue Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="card flex flex-col"
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
              <p>All caught up!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 overflow-y-auto max-h-[380px] pr-2">
              {approvals.map((a, idx) => (
                <motion.button
                  key={a.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  type="button"
                  className="group flex w-full items-center justify-between gap-3 text-left p-3 rounded-2xl border border-surface-200 bg-surface-50 hover:bg-amber-50 hover:border-amber-200 transition-colors"
                  onClick={() => navigate(`/manager/approvals/${a.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm text-xs font-bold text-surface-600">
                      #{String(a.booking_id).slice(-2)}
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="bg-white border border-surface-200 rounded-xl p-2">
                        <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">Requester</p>
                        <p className="font-semibold text-surface-900 text-sm">{a.user_name || 'System User'}</p>
                      </div>
                      <div className="bg-white border border-surface-200 rounded-xl p-2">
                        <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">Resource</p>
                        <p className="font-semibold text-surface-900 text-sm">{a.resource_name || `Booking #${a.booking_id}`}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-medium text-amber-700 hidden sm:inline-block">Review</span>
                    <ArrowRight size={16} className="text-amber-600 translate-x-0 group-hover:translate-x-1 transition-transform" />
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
