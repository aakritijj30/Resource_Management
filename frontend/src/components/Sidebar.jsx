import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Calendar } from 'lucide-react'
import clsx from 'clsx'

const NAV_LINKS = {
  employee: [
    { label: 'Dashboard',   to: '/employee/dashboard',  icon: 'DB' },
    { label: 'Resources',   to: '/employee/resources',   icon: 'RS' },
    { label: 'My Bookings', to: '/employee/bookings',    icon: 'BK' },
    { label: 'Waitlists',   to: '/employee/waitlists',   icon: 'WL' },
  ],
  manager: [
    { label: 'Dashboard',   to: '/manager/approvals',    icon: 'DB' },
    { label: 'Employee Approvals', to: '/manager/pending-approvals', icon: 'EA' },
    { label: 'My Bookings',    to: '/employee/bookings',         icon: 'BK' },
    { label: 'Waitlists',      to: '/employee/waitlists',        icon: 'WL' },
  ],
  admin: [
    { label: 'Dashboard',   to: '/admin',                icon: 'DB' },
    { label: 'Approvals',   to: '/manager/approvals',    icon: 'EA' },
    { label: 'Resources',   to: '/admin/resources',      icon: 'RS' },
    { label: 'Policies',    to: '/admin/policies',       icon: 'PL' },
    { label: 'Maintenance', to: '/admin/maintenance',    icon: 'MN' },
    { label: 'All Bookings',to: '/admin/bookings',       icon: 'BK' },
    { label: 'Waitlists',   to: '/employee/waitlists',   icon: 'WL' },
    { label: 'Reports',     to: '/admin/reports',        icon: 'RP' },
  ],
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const links = NAV_LINKS[user?.role] || []

  return (
    <aside className="sticky top-0 z-20 flex w-full shrink-0 flex-col border-b border-slate-200 bg-white/85 p-4 backdrop-blur-xl lg:h-screen lg:w-72 lg:border-b-0 lg:border-r lg:overflow-y-auto">
      <div className="mb-6 rounded-2xl border border-surface-200 bg-white p-4 shadow-glow">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-500 text-sm font-bold text-white shadow-lg shadow-primary-500/20">
            BB
          </div>
          <div>
            <h1 className="font-display text-xl font-black bg-gradient-to-r from-primary-700 via-primary-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
              BookItBase
            </h1>
          </div>
        </div>
      </div>

      <nav className="flex-1">
        <p className="px-3 pb-2 text-[10px] font-black uppercase tracking-[0.28em] text-surface-700">Workspace</p>
        <div className="flex flex-wrap gap-2 lg:flex-col lg:space-y-1 lg:gap-0">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={clsx(
                'sidebar-link group relative',
              location.pathname === link.to && 'active',
              'w-full lg:w-auto'
            )}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-surface-200 bg-surface-50 text-[11px] font-bold tracking-[0.2em] text-surface-600 group-hover:border-primary-200 group-hover:text-primary-600 transition-colors">
                {link.icon}
              </span>
              <span className="flex-1">{link.label}</span>
              {link.badge && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm">
                  {link.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </nav>

      <div className="mt-auto border-t border-surface-200 pt-4">
        <div className="rounded-2xl border border-surface-200 bg-white p-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-sm font-bold text-white shadow-sm shadow-primary-500/15">
              {user?.full_name?.[0] || '?'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-surface-950">{user?.full_name}</p>
              <div className="flex flex-wrap items-center gap-1.5 overflow-hidden">
                <span className="text-[9px] uppercase tracking-widest font-black text-surface-700">{user?.role}</span>
                {user?.department_name && (
                  <>
                    <span className="text-[8px] text-surface-300">•</span>
                    <span className="text-[9px] uppercase tracking-widest font-bold text-primary-500 truncate">{user.department_name}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="mt-3">
            <button 
              onClick={logout} 
              className="w-full rounded-2xl bg-rose-50 px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-rose-600 border border-rose-100 transition-all hover:bg-rose-600 hover:text-white shadow-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
