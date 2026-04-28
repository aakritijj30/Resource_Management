import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getApprovalHistory } from '../../api/approvalApi';
import { useNavigate } from 'react-router-dom';
import { Clock, ArrowRight, Search, Filter, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BookingSummary from '../../components/BookingSummary';
import { useDepartmentBookings } from '../../hooks/useBookings';

import { useGlobalFilters } from '../../store/filterContext';

export default function EmployeeApprovalsPage() {
  const navigate = useNavigate();
  const { statusFilter: filter, setStatusFilter: setFilter } = useGlobalFilters();
  const [search, setSearch] = useState('');
  
  const { data: approvals = [], isLoading: isApprovalsLoading } = useQuery({
    queryKey: ['approvals', 'history'],
    queryFn: () => getApprovalHistory().then(r => r.data)
  });

  const { data: teamBookings = [], isLoading: isTeamLoading } = useDepartmentBookings();

  const isLoading = isApprovalsLoading || isTeamLoading;

  const filteredApprovals = approvals.filter(a => {
    const matchesFilter = filter === 'all' || a.decision === filter;
    const matchesSearch = 
      (a.resource_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.user_name || "").toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'rejected': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'pending':  return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-surface-50 text-surface-400 border-surface-100';
    }
  };

  return (
    <div className="w-full flex-col flex animate-fade-in relative z-10 pb-12">
      <section className="page-header-card space-y-4">
        <div className="page-kicker">Manager Workspace</div>
        <h1 className="page-title">Employee Approvals</h1>
        <p className="page-copy">
          Audit past decisions and track current department activity in one place.
        </p>
      </section>

      {/* Team Status Summary */}
      <div className="mb-8">
        <BookingSummary
          bookings={teamBookings}
          title="Department Activity"
          subtitle="Real-time overview of all resource requests in your department."
        />
      </div>

      <div className="card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
           <div className="flex bg-surface-100 p-1 rounded-2xl w-fit">
              {['all', 'pending', 'approved', 'rejected'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-6 py-2 rounded-xl text-sm font-bold transition-all uppercase tracking-widest ${
                    filter === f 
                    ? 'border-primary-600 bg-primary-600 text-white shadow-lg shadow-primary-500/20 scale-[1.02]' 
                    : 'text-surface-400 hover:text-surface-600'
                  }`}
                >
                  {f === 'rejected' ? 'Rejected/Cancelled' : f}
                </button>
              ))}
           </div>

           <div className="relative flex-1 max-w-md">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
             <input 
               type="text" 
               placeholder="Search by resource or user..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full pl-11 pr-4 py-3 rounded-2xl border border-surface-200 bg-surface-50 text-surface-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
             />
           </div>
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          </div>
        ) : filteredApprovals.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-surface-400">
             <div className="h-16 w-16 bg-surface-50 rounded-full flex items-center justify-center mb-4">
                <Filter size={32} className="opacity-20" />
             </div>
             <p className="font-semibold">No {filter !== 'all' ? filter : ''} requests found.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
              {filteredApprovals.map((a, idx) => (
                <motion.div
                  key={a.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-3xl border border-surface-100 bg-surface-50/50 hover:bg-white hover:border-primary-200 hover:shadow-soft transition-all cursor-pointer"
                  onClick={() => navigate(`/manager/approvals/${a.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-14 w-14 shrink-0 rounded-2xl border flex flex-col items-center justify-center ${getStatusStyle(a.decision)}`}>
                       <span className="text-[10px] font-bold uppercase opacity-60">Status</span>
                       <div className="mt-0.5">
                         {a.decision === 'approved' ? <CheckCircle2 size={18} /> : a.decision === 'rejected' ? <XCircle size={18} /> : <Clock size={18} />}
                       </div>
                    </div>
                    <div>
                      <p className="font-bold text-surface-900 text-lg leading-tight">{a.resource_name || `Resource #${a.resource_id}`}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                        <span className="text-xs font-bold text-primary-600">
                          {a.user_name || 'System User'}
                        </span>
                        <span className="text-[11px] font-medium text-surface-400">
                          Created: {new Date(a.created_at).toLocaleDateString()}
                        </span>
                        {a.booking && (
                          <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                            Slot: {new Date(a.booking.start_time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} 
                            - {new Date(a.booking.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-0 flex items-center gap-4">
                     <div className="text-right hidden md:block">
                        <p className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border ${getStatusStyle(a.decision)}`}>
                          {a.decision}
                        </p>
                        <p className="text-[10px] text-surface-400 mt-1">Decision: {a.decided_at ? new Date(a.decided_at).toLocaleDateString() : 'Pending'}</p>
                     </div>
                     <div className="h-12 w-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-all shadow-sm">
                        <ArrowRight size={20} />
                     </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
