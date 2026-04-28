import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Clock, Calendar, Save, Settings2, ShieldCheck, Zap, Users, Building2, LayoutGrid } from 'lucide-react'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorMessage from '../../components/ErrorMessage'
import { useResources } from '../../hooks/useResources'
import { getPolicy, setPolicy } from '../../api/resourceApi'
import { getDepartments } from '../../api/authApi'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const ICONS = {
  max_duration_hours: <Clock size={16} />,
  min_duration_hours: <Zap size={16} />,
  office_hours_start: <Clock size={16} />,
  office_hours_end: <Clock size={16} />,
  advance_booking_days: <Calendar size={16} />,
  max_attendees: <Users size={16} />,
}

function PolicyForm({ resource, onClose }) {
  const qc = useQueryClient()
  const { data: policy, isLoading } = useQuery({
    queryKey: ['policy', resource.id],
    queryFn: () => getPolicy(resource.id).then(r => r.data).catch(() => null)
  })

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => getDepartments().then(r => r.data).catch(() => [])
  })
  
  const saveMutation = useMutation({
    mutationFn: (data) => setPolicy(resource.id, data),
    onSuccess: () => {
      qc.invalidateQueries(['policy', resource.id])
      onClose()
    }
  })
  
  const [form, setForm] = useState(null)
  const [error, setError] = useState(null)

  const currentPolicy = form || policy || { max_duration_hours: 8, min_duration_hours: 0.5, office_hours_start: 9, office_hours_end: 18, advance_booking_days: 30 }

  const handleSave = async (e) => {
    e.preventDefault()
    setError(null)
    try { await saveMutation.mutateAsync(currentPolicy) } catch (err) { setError(err) }
  }

  if (isLoading) return <div className="py-8 bg-surface-50/50 rounded-2xl flex justify-center mt-4"><LoadingSpinner size="sm" label="Fetching rules..." /></div>

  return (
    <motion.form 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onSubmit={handleSave} 
      className="space-y-5 mt-4 pt-4 border-t border-surface-200 overflow-hidden"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { key: 'max_duration_hours',    label: 'Max Duration (Hrs)' },
          { key: 'min_duration_hours',    label: 'Min Duration (Hrs)' },
          { key: 'advance_booking_days',  label: 'Max Advance (Days)' },
          { key: 'office_hours_start',    label: 'Open Hour (24h)' },
          { key: 'office_hours_end',      label: 'Close Hour (24h)' },
          { key: 'max_attendees',         label: 'Max Attendees' },
        ].map(f => {
          let label = f.label;
          if (f.key === 'max_attendees') {
            const isParking = resource.name.toLowerCase().includes('parking') || resource.type === 'parking';
            label = isParking ? 'Parking Capacity' : 'Max Attendees/Capacity';
          }
          return (
            <div key={f.key} className="bg-surface-50 rounded-2xl p-4 border border-surface-100 transition-colors focus-within:border-primary-300 focus-within:ring-4 focus-within:ring-primary-500/10">
              <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-primary-600 mb-3">
                {ICONS[f.key] || <Settings2 size={16} />}
                {label}
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  step={f.key.includes('duration') ? "0.5" : "1"}
                  min="0"
                  className="w-full bg-transparent text-xl font-display font-semibold text-surface-900 focus:outline-none" 
                  value={currentPolicy[f.key] ?? ''}
                  onChange={e => setForm(p => ({ ...(p || currentPolicy), [f.key]: e.target.value === '' ? null : parseFloat(e.target.value) }))} 
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-surface-50 rounded-2xl p-4 border border-surface-100">
        <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-primary-600 mb-3">
          <Calendar size={16} />
          Allowed Days
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { bit: 1, label: 'Mon' }, { bit: 2, label: 'Tue' }, { bit: 4, label: 'Wed' },
            { bit: 8, label: 'Thu' }, { bit: 16, label: 'Fri' }, { bit: 32, label: 'Sat' }, { bit: 64, label: 'Sun' }
          ].map(day => {
            const allowedDays = currentPolicy.allowed_days ?? 31;
            const isSelected = (allowedDays & day.bit) !== 0;
            return (
              <button
                key={day.bit}
                type="button"
                onClick={() => {
                  const newDays = isSelected ? allowedDays & ~day.bit : allowedDays | day.bit;
                  setForm(p => ({ ...(p || currentPolicy), allowed_days: newDays }));
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                  isSelected 
                    ? 'border-primary-600 bg-primary-600 text-white shadow-lg shadow-primary-500/20 scale-[1.02]' 
                    : 'bg-surface-200 text-surface-500 hover:bg-surface-300'
                }`}
              >
                {day.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="bg-surface-50 rounded-2xl p-4 border border-surface-100">
        <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-primary-600 mb-3">
          <Building2 size={16} />
          Allowed Departments (Leave empty for all)
        </label>
        <div className="flex flex-wrap gap-2">
          {departments?.map(dept => {
            const allowedDepts = currentPolicy.allowed_department_ids || [];
            const isSelected = allowedDepts.includes(dept.id);
            return (
              <button
                key={dept.id}
                type="button"
                onClick={() => {
                  let newDepts = [...allowedDepts];
                  if (isSelected) newDepts = newDepts.filter(id => id !== dept.id);
                  else newDepts.push(dept.id);
                  if (newDepts.length === 0) newDepts = null;
                  setForm(p => ({ ...(p || currentPolicy), allowed_department_ids: newDepts }));
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                  isSelected 
                    ? 'border-primary-600 bg-primary-600 text-white shadow-lg shadow-primary-500/20 scale-[1.02]' 
                    : 'bg-surface-200 text-surface-500 hover:bg-surface-300'
                }`}
              >
                {dept.name}
              </button>
            )
          })}
          {(!departments || departments.length === 0) && (
             <span className="text-xs text-surface-500 font-medium">No departments available</span>
          )}
        </div>
      </div>
      
      <ErrorMessage error={error} />
      
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary text-sm">Cancel</button>
        <button type="submit" className="btn-primary text-sm shadow-md" disabled={saveMutation.isPending}>
          {saveMutation.isPending ? <LoadingSpinner size="sm" /> : <><Save size={16} /> Save Policy</>}
        </button>
      </div>
    </motion.form>
  )
}

export default function PolicyConfigPage() {
  const { data: resources = [], isLoading } = useResources()
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => getDepartments().then(r => r.data)
  })

  const [expanded, setExpanded] = useState(null)
  const [scopeFilter, setScopeFilter] = useState('all')

  const filtered = resources.filter(r => {
    if (scopeFilter === 'common') return r.department_id === null;
    if (scopeFilter !== 'all') return r.department_id === scopeFilter;
    return true;
  });

  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  }

  const itemVars = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 24, stiffness: 200 } }
  }

  return (
    <div className="w-full flex-col flex animate-fade-in relative z-10 pb-12">
      <section className="page-header-card space-y-4">
        <div className="page-kicker">Rules Engine</div>
        <h1 className="page-title mt-2">Booking Policies</h1>
        <p className="page-copy mt-2">Define boundaries, durations, and lead times to orchestrate your hardware and spaces beautifully.</p>
      </section>

      {/* Admin Scope Filter */}
      <div className="card mb-8 bg-white/80 backdrop-blur-md border-surface-200/60 shadow-xl shadow-surface-900/5">
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest flex items-center gap-2">
            <LayoutGrid size={12} /> Filter Resources by Department
          </p>
          <div className="relative w-full max-w-sm">
            <select
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value === 'all' || e.target.value === 'common' ? e.target.value : parseInt(e.target.value))}
              className="w-full appearance-none bg-surface-50 border border-surface-200 text-surface-900 text-sm rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none font-medium cursor-pointer hover:bg-white"
            >
              <option value="all">All Resources (Org-Wide)</option>
              <option value="common">Common Resources (No Dept)</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center"><LoadingSpinner /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
          
          <motion.div variants={containerVars} initial="hidden" animate="show" className="space-y-4">
            {filtered.map(r => (
              <motion.div key={r.id} variants={itemVars} className="card p-6 border-transparent hover:border-primary-200 transition-all duration-300">
                <div 
                  className="flex items-center justify-between cursor-pointer group" 
                  onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-20 rounded-xl overflow-hidden bg-primary-50 border border-primary-100 shrink-0">
                      {r.image_url ? (
                        <img src={r.image_url} alt={r.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-primary-300">
                          <ShieldCheck size={24} />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold text-surface-900 group-hover:text-primary-700 transition-colors leading-tight">
                        {r.name}
                      </h3>
                      <p className="text-sm font-bold text-surface-400 uppercase tracking-widest text-[9px] mt-1">
                        {r.type.replace('_',' ')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
                      {expanded === r.id ? 'Close config' : 'Edit rules'}
                    </span>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300 ${expanded === r.id ? 'bg-primary-100 text-primary-700 rotate-180' : 'bg-surface-100 text-surface-500 group-hover:bg-primary-50 group-hover:text-primary-600'}`}>
                      <ChevronDown size={18} />
                    </div>
                  </div>
                </div>
                
                <AnimatePresence>
                  {expanded === r.id && <PolicyForm resource={r} onClose={() => setExpanded(null)} />}
                </AnimatePresence>
              </motion.div>
            ))}
            
            {filtered.length === 0 && (
              <div className="card text-center py-16">
                <p className="text-surface-500 font-medium">No resources match the selected filter.</p>
              </div>
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="sticky top-6 hidden lg:block h-[calc(100vh-3rem)] pb-12"
          >
            <div className="card overflow-hidden p-0 border-none bg-surface-50/50 shadow-soft h-full flex flex-col">
              <div className="h-64 w-full bg-primary-100 relative overflow-hidden shrink-0 border-b border-surface-100/50">
                 <img src="/policy_illustration.png" alt="Policy Automation" className="w-full h-full object-cover opacity-90 mix-blend-multiply" />
                 <div className="absolute inset-0 bg-gradient-to-t from-surface-50 to-transparent" />
              </div>
              <div className="p-6 relative z-10 flex-1 flex flex-col -mt-8">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-surface-100 flex-1">
                  <h4 className="font-display font-semibold text-surface-900 flex items-center gap-2">
                    <Settings2 size={18} className="text-primary-500" />
                    Why set policies?
                  </h4>
                  <ul className="mt-4 space-y-3 text-sm text-surface-600 leading-relaxed font-medium">
                    <li className="flex items-start gap-2">
                      <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary-400 shrink-0" />
                      Prevent hoarding by strictly capping the maximum duration of bookings.
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary-400 shrink-0" />
                      Ensure availability by enforcing advance booking window horizons.
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary-400 shrink-0" />
                      Lock down sensitive hardware during designated offline hours.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
