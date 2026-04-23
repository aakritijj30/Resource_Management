import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, UserPlus, LogIn, ArrowRight } from 'lucide-react';
import BackgroundVideo from '../../components/layout/BackgroundVideo';

export default function HomePage() {
  return (
    <div className="public-shell relative flex min-h-screen w-full items-center justify-center bg-transparent overflow-hidden">
      <BackgroundVideo />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="public-panel relative z-10 mx-auto flex flex-col items-center justify-center p-4 w-full max-w-4xl"
      >
        <div className="relative flex aspect-square w-full max-w-[650px] flex-col items-center justify-center rounded-full bg-white/75 shadow-glow backdrop-blur-3xl border border-white/50 p-16 text-center">
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary-50 text-primary-600 shadow-sm">
                <Calendar size={32} strokeWidth={2} />
              </div>
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-surface-900 mb-3">Resource Manager</h1>
            <p className="text-surface-600 leading-relaxed mb-8 px-4 max-w-xs mx-auto">
              Your modern workspace for managing teams, tracking projects, and allocating resources seamlessly.
            </p>
          </motion.div>

          {/* Quick Access Actions */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex w-full flex-col gap-4 px-6 md:px-10"
          >
            <Link
              to="/login"
              className="group flex w-full items-center justify-center gap-2 rounded-full bg-primary-500 py-3.5 px-6 font-semibold text-white shadow-glow transition-all hover:-translate-y-0.5 hover:bg-primary-600 active:scale-95"
            >
              <LogIn size={18} />
              <span>Log in to your account</span>
              <ArrowRight size={18} className="translate-x-0 transition-transform group-hover:translate-x-1" />
            </Link>
            
            <Link
              to="/signup"
              className="group flex w-full items-center justify-center gap-2 rounded-full bg-surface-100 py-3.5 px-6 font-medium text-surface-700 transition-all hover:-translate-y-0.5 hover:bg-surface-200 active:scale-95"
            >
              <UserPlus size={18} />
              <span>Create an account</span>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
