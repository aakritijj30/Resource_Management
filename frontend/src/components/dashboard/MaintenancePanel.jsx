import { useQuery } from '@tanstack/react-query';
import { getRelevantMaintenance } from '../../api/maintenanceApi';
import { AlertTriangle, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';

export default function MaintenancePanel() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const { data: blocks = [], isLoading } = useQuery({
    queryKey: ['maintenance', 'relevant'],
    queryFn: () => getRelevantMaintenance().then(r => r.data)
  });

  if (isLoading) {
    return (
      <div className="card h-48 flex items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className={`card ${blocks.length > 0 ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50/30 border-emerald-100/50'}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${blocks.length > 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
          {blocks.length > 0 ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
        </div>
        <div>
          <h3 className={`font-bold text-sm ${blocks.length > 0 ? 'text-rose-900' : 'text-emerald-900'}`}>
            Maintenance Alerts
          </h3>
          <p className={`text-[10px] uppercase font-bold tracking-wider ${blocks.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {blocks.length > 0 ? (isAdmin ? 'Org-Wide Restriction' : 'Restricted Access') : 'All Systems Nominal'}
          </p>
        </div>
      </div>

      {blocks.length === 0 ? (
        <p className="text-xs text-emerald-700/70 italic">
          {isAdmin ? 'No upcoming maintenance blocks for the organization.' : 'No upcoming maintenance blocks for your resources.'}
        </p>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {blocks.map((block) => (
              <motion.div 
                key={block.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 rounded-2xl bg-white border border-rose-100 shadow-sm"
              >
                <p className="font-bold text-surface-900 text-sm mb-1">{block.resource_name}</p>
                <div className="flex items-center gap-3 text-surface-500 text-[11px] font-medium">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>{new Date(block.start_time).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>
                      {new Date(block.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                      {new Date(block.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-xs text-surface-600 leading-relaxed italic">
                  "{block.reason}"
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
