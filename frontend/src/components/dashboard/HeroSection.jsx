import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function HeroSection({ onAddResource, compact = false }) {
  const { user } = useAuth();

  return (
    <motion.section 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden rounded-[2rem] bg-primary-600 shadow-glow shadow-primary-500/30 border border-primary-500/50 mt-2 ${compact ? 'p-6 sm:p-8' : 'p-8 sm:p-10'}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.12),transparent_25%)]" />
      <div className="absolute right-0 top-0 w-1/3 h-full opacity-20 select-none hidden md:block">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full fill-white/40 filter blur-[24px]">
          <path d="M45.7,-76.1C58.9,-69.3,69.2,-55.4,78.2,-40.8C87.2,-26.2,94.9,-10.9,94.5,4.2C94,19.3,85.5,34.2,74.5,45.8C63.5,57.4,50,65.8,36,73.1C22,80.4,7.4,86.5,-8,88.7C-23.4,90.9,-39.7,89.1,-52.7,81.3C-65.7,73.5,-75.4,59.7,-82.4,44.7C-89.4,29.7,-93.7,13.5,-91.9,-2C-90.1,-17.5,-82.2,-32.3,-72.1,-44.6C-62,-56.9,-49.7,-66.7,-36.2,-73C-22.7,-79.3,-8,-82.1,8,-83.4C24,-84.7,48,-84.5,45.7,-76.1Z" transform="translate(100 100) scale(1.1)" />
        </svg>
      </div>

      <div className="relative z-10 grid gap-6 md:grid-cols-[1fr_auto]">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-300/30 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-100 backdrop-blur-md">
            Welcome Back
          </div>
          <h1 className={`${compact ? 'text-3xl' : 'text-4xl sm:text-5xl'} font-display font-extrabold text-white tracking-tight leading-[1.1]`}>
            Hello, {user.full_name}
          </h1>
          {user.role === 'manager' && user.department_name && (
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.25em] text-primary-200">
               {user.department_name} Oversight
            </p>
          )}
          <p className={`${compact ? 'text-sm max-w-md' : 'text-lg max-w-xl'} text-surface-100 leading-relaxed opacity-90 font-medium`}>
            {compact 
              ? "Check your pending approvals and upcoming bookings to keep everything running smoothly."
              : "Here's what's happening with your resources today. Check your pending approvals, upcoming bookings, and utilization rates."
            }
          </p>
        </div>

        <div className="flex items-center justify-end">
          <motion.div
            animate={{ 
              rotate: [0, 15, -10, 15, 0],
              y: [0, -5, 0]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className={`relative shrink-0 drop-shadow-2xl ${compact ? 'w-24 h-24' : 'w-32 h-32 sm:w-40 sm:h-40'}`}
          >
            <img 
              src="/waving_avatar.png" 
              alt="Waving Avatar" 
              className="w-full h-full object-contain filter drop-shadow-xl"
            />
          </motion.div>
          
          {user.role === 'admin' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAddResource}
              className={`group flex items-center gap-3 rounded-full bg-white font-semibold text-primary-700 shadow-lg shadow-black/10 transition-colors hover:bg-surface-50 ${compact ? 'h-11 px-4 ml-4' : 'h-14 px-6 ml-6'}`}
            >
              <div className={`flex items-center justify-center rounded-full bg-primary-100 text-primary-700 ${compact ? 'h-6 w-6' : 'h-8 w-8'}`}>
                <Plus size={compact ? 16 : 20} className="group-hover:rotate-90 transition-transform duration-300" />
              </div>
              <span className={compact ? 'text-sm pr-1' : 'pr-2'}>Add Resource</span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.section>
  );
}
