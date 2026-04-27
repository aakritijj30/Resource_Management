import { useState, useMemo } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  eachDayOfInterval,
  isBefore,
  startOfDay,
  parseISO
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info, X, Clock, MapPin, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { useDepartments } from '../../hooks/useDepartments';

const DEPT_COLORS = [
  'bg-blue-500',   
  'bg-emerald-500', 
  'bg-amber-500',   
  'bg-purple-500',  
  'bg-rose-500',    
];

const DEPT_TEXT_COLORS = [
  'text-blue-600',   
  'text-emerald-600', 
  'text-amber-600',   
  'text-purple-600',  
  'text-rose-600',    
];

export default function CalendarWidget({ bookings = [], role = 'employee' }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const { data: departments = [] } = useDepartments();

  const filteredBookings = useMemo(() => {
    const now = startOfDay(new Date());
    return bookings.filter(b => {
      if (b.status === 'rejected' || b.status === 'cancelled') return false;
      const endTime = parseISO(b.end_time);
      if (isBefore(endTime, now)) return false;
      if (role === 'admin' && b.status !== 'approved') return false;
      return true;
    });
  }, [bookings, role]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const getDayStatus = (day) => {
    const dayBookings = filteredBookings.filter(b => isSameDay(parseISO(b.start_time), day));
    if (dayBookings.length === 0) return null;

    if (role === 'admin') {
      const uniqueDepts = [...new Set(dayBookings.map(b => b.department_id))];
      return { type: 'admin', count: uniqueDepts.length };
    }

    const approved = dayBookings.filter(b => b.status === 'approved');
    const pending = dayBookings.filter(b => b.status === 'pending');

    if (approved.length > 0) return { type: 'approved' };
    if (pending.length > 0) return { type: 'pending' };
    return null;
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const selectedDayBookings = useMemo(() => {
    if (!selectedDay) return [];
    return filteredBookings.filter(b => isSameDay(parseISO(b.start_time), selectedDay));
  }, [selectedDay, filteredBookings]);

  return (
    <div className="relative">
      <div className="card overflow-hidden flex flex-col h-fit relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
              <CalendarIcon size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-surface-900 leading-none">Bookings</h3>
              <p className="text-[10px] text-surface-500 mt-0.5">{format(currentMonth, 'MMM yyyy')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={prevMonth} 
              className="h-8 w-8 rounded-xl bg-white border border-surface-200 text-surface-600 flex items-center justify-center transition-all hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 active:scale-90 shadow-sm"
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={nextMonth} 
              className="h-8 w-8 rounded-xl bg-white border border-surface-200 text-surface-600 flex items-center justify-center transition-all hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 active:scale-90 shadow-sm"
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-surface-100 rounded-xl overflow-hidden border border-surface-100">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
            <div key={d} className="bg-surface-50 py-1 text-center text-[9px] font-black uppercase tracking-widest text-surface-400">
              {d}
            </div>
          ))}
          {days.map((day, idx) => {
            const status = getDayStatus(day);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const dayBookings = filteredBookings.filter(b => isSameDay(parseISO(b.start_time), day));
            
            // Get unique departments for this day (Admin only)
            const uniqueDepts = role === 'admin' 
              ? [...new Set(dayBookings.map(b => b.department_id))]
              : [];

            return (
              <button 
                key={idx} 
                onClick={() => setSelectedDay(day)}
                className={clsx(
                  "relative h-10 sm:h-12 bg-white p-1 transition-colors hover:bg-primary-50/30 flex flex-col items-start text-left outline-none",
                  !isCurrentMonth && "bg-surface-50/50 text-surface-300"
                )}
              >
                <span className={clsx(
                  "text-[10px] font-bold z-10",
                  isToday ? "flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-white shadow-glow" : (isCurrentMonth ? "text-surface-900" : "text-surface-300")
                )}>
                  {format(day, 'd')}
                </span>

                <div className="mt-0.5 flex flex-wrap gap-0.5 w-full">
                  {status && (
                    <div className="w-full flex flex-col gap-0.5">
                      {role === 'admin' ? (
                        <div className="flex gap-0.5 w-full overflow-hidden">
                          {uniqueDepts.map((deptId, i) => {
                            // If deptId is null, it's a common resource, use a neutral color
                            const deptIndex = departments.findIndex(d => d.id === deptId);
                            const colorClass = deptId === null 
                              ? 'bg-surface-400' 
                              : (deptIndex >= 0 ? DEPT_COLORS[deptIndex % DEPT_COLORS.length] : 'bg-surface-400');
                            return (
                              <div 
                                key={deptId || `common-${i}`} 
                                className={clsx("h-1 flex-1 rounded-full", colorClass)} 
                              />
                            );
                          })}
                        </div>
                      ) : (
                        <>
                          {status.type === 'approved' && <div className="h-1 w-full rounded-full bg-primary-500" />}
                          {status.type === 'pending' && <div className="h-1 w-full rounded-full bg-amber-400 opacity-80" />}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[9px] font-bold uppercase tracking-wider text-surface-500 border-t border-surface-100 pt-3">
          {role !== 'admin' && (
            <>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-primary-500" />
                <span>Approved</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                <span>Pending</span>
              </div>
            </>
          )}
          {role === 'admin' && (
            <>
              {departments.map((dept, i) => (
                <div key={dept.id} className="flex items-center gap-1.5">
                  <div className={clsx("h-1.5 w-1.5 rounded-full", DEPT_COLORS[i % DEPT_COLORS.length])} />
                  <span>{dept.name}</span>
                </div>
              ))}
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-surface-400" />
                <span>Shared</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Booking Details Modal - Moved outside the Card container to prevent clipping */}
      <AnimatePresence>
        {selectedDay && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDay(null)}
              className="absolute inset-0 bg-surface-950/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-surface-200 z-10"
            >
              <div className="p-6 border-b border-surface-100 flex items-center justify-between bg-surface-50/80">
                <div>
                  <h4 className="text-lg font-black text-surface-950 tracking-tight">{format(selectedDay, 'MMM do, yyyy')}</h4>
                  <p className="text-[10px] text-primary-600 font-black uppercase tracking-widest mt-1">{selectedDayBookings.length} Bookings Found</p>
                </div>
                <button 
                  onClick={() => setSelectedDay(null)} 
                  className="h-10 w-10 rounded-xl bg-white text-surface-900 flex items-center justify-center transition-all hover:bg-primary-50 hover:text-primary-600 shadow-sm border border-surface-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3 custom-scrollbar">
                {selectedDayBookings.length === 0 ? (
                  <div className="py-12 text-center text-surface-400 font-bold">No bookings.</div>
                ) : (
                  selectedDayBookings.map((b, i) => {
                    const deptIndex = departments.findIndex(d => d.id === b.department_id);
                    const colorClass = b.department_id === null 
                      ? 'bg-surface-400' 
                      : (deptIndex >= 0 ? DEPT_COLORS[deptIndex % DEPT_COLORS.length] : 'bg-surface-400');
                    const textColorClass = b.department_id === null 
                      ? 'text-surface-600' 
                      : (deptIndex >= 0 ? DEPT_TEXT_COLORS[deptIndex % DEPT_TEXT_COLORS.length] : 'text-surface-600');

                    return (
                      <motion.div 
                        key={b.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-4 rounded-2xl bg-white border border-surface-200 shadow-sm hover:border-primary-400 transition-all group"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className={clsx("text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg border bg-surface-50", textColorClass)}>
                            {departments[deptIndex]?.name || 'Shared'}
                          </span>
                          <span className="text-[9px] font-bold text-surface-300">#{b.id}</span>
                        </div>
                        <h5 className="font-bold text-surface-950 text-sm mb-3 flex items-center gap-2">
                          <div className={clsx("h-2 w-2 rounded-full", colorClass)} />
                          {b.resource_name}
                        </h5>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 text-xs font-bold text-surface-600 bg-surface-50/50 p-2 rounded-xl">
                            <Clock size={14} className="text-primary-500" />
                            <span>{format(parseISO(b.start_time), 'h:mm a')} - {format(parseISO(b.end_time), 'h:mm a')}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs font-bold text-surface-600 bg-surface-50/50 p-2 rounded-xl">
                            <MapPin size={14} className="text-primary-500" />
                            <span className="truncate">{b.user_name}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
