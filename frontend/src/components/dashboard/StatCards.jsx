import { motion } from 'framer-motion';
import { Layers, Briefcase, Activity, CalendarClock, Info, CheckCircle2, Calendar } from 'lucide-react';

const ICONS = {
  Layers: <Layers size={18} />,
  Briefcase: <Briefcase size={18} />,
  Activity: <Activity size={18} />,
  CalendarClock: <CalendarClock size={18} />,
};

export default function StatCards({ stats }) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { flex: 1, opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className={`grid gap-6 sm:grid-cols-2 mb-8 ${stats.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}
    >
      {stats.map((stat, i) => (
        <motion.div key={i} variants={item} className="stat-card group relative p-6 h-[220px] flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-surface-900">{stat.title}</span>
              <div className="flex items-center gap-1 text-surface-400">
                <Info size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Info</span>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 shadow-sm">
              {ICONS[stat.icon] || <Activity size={18} />}
            </div>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            {stat.value === 0 ? (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center"
              >
                <div className="relative mb-3">
                  {stat.title === 'Upcoming Bookings' ? (
                    <div className="relative">
                       <Calendar size={64} className="text-surface-200" />
                       <motion.div 
                         animate={{ y: [0, -4, 0], opacity: [0, 1, 0] }}
                         transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                         className="absolute -top-1 -right-1 text-xs font-bold text-surface-400"
                       >z</motion.div>
                       <motion.div 
                         animate={{ y: [0, -6, 0], opacity: [0, 1, 0] }}
                         transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                         className="absolute -top-4 right-2 text-[10px] font-bold text-surface-400"
                       >z</motion.div>
                    </div>
                  ) : stat.title === 'Pending Approval' ? (
                    <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center border-4 border-emerald-100">
                       <CheckCircle2 size={32} className="text-emerald-500" />
                    </div>
                  ) : (
                    <Layers size={64} className="text-surface-100" />
                  )}
                </div>
                <p className="text-sm font-medium text-surface-500">Nothing yet - take a break!</p>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-4xl font-display font-extrabold text-primary-600 tracking-tight">{stat.value}</span>
                {stat.trend && (
                  <div className="mt-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                    {stat.trend}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {stat.progress !== undefined && stat.value > 0 && (
            <div className="mt-4 pt-3 border-t border-surface-100">
              <div className="h-1.5 w-full bg-surface-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stat.progress}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="h-full bg-primary-500 rounded-full"
                />
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}
