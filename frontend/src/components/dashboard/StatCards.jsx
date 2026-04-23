import { motion } from 'framer-motion';
import { Layers, Briefcase, Activity, CalendarClock } from 'lucide-react';

const ICONS = {
  Layers: <Layers size={22} />,
  Briefcase: <Briefcase size={22} />,
  Activity: <Activity size={22} />,
  CalendarClock: <CalendarClock size={22} />,
};

export default function StatCards({ stats }) {
  // stats is expected to be an array of objects: { title: 'Total Resources', value: '42', icon: 'Layers', trend: '+12%' }
  
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
      className={`grid gap-4 sm:grid-cols-2 mb-8 ${stats.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}
    >
      {stats.map((stat, i) => (
        <motion.div key={i} variants={item} className="stat-card">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-wide text-surface-500 mb-1">{stat.title}</span>
              <span className="text-3xl font-display font-extrabold text-primary-600 tracking-tight">{stat.value}</span>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 shadow-[inset_0_1px_0_rgba(255,255,255,1)]">
              {ICONS[stat.icon] || <Activity size={22} />}
            </div>
          </div>
          
          {stat.trend && (
            <div className="mt-2 pt-3 border-t border-surface-100 flex items-center">
              <span className={`text-xs font-semibold ${stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-primary-500'}`}>
                {stat.trend}
              </span>
              <span className="text-xs text-surface-400 ml-2">from last month</span>
            </div>
          )}
          
          {stat.progress !== undefined && (
            <div className="mt-2 pt-3 border-t border-surface-100">
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
