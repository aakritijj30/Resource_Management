import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import clsx from 'clsx'

const NAV_LINKS = {
  employee: [
    { label: 'Dashboard',   to: '/employee/dashboard',  icon: 'DB' },
    { label: 'Resources',   to: '/employee/resources',   icon: 'RS' },
    { label: 'My Bookings', to: '/employee/bookings',    icon: 'BK' },
  ],
  manager: [
    { label: 'Approvals',   to: '/manager/approvals',    icon: 'AP' },
    { label: 'Dept Usage',  to: '/manager/dept-usage',   icon: 'DU' },
    { label: 'My Bookings',  to: '/employee/bookings',    icon: 'BK' },
  ],
  admin: [
    { label: 'Dashboard',   to: '/admin',                icon: 'DB' },
    { label: 'Resources',   to: '/admin/resources',      icon: 'RS' },
    { label: 'Policies',    to: '/admin/policies',       icon: 'PL' },
    { label: 'Maintenance', to: '/admin/maintenance',    icon: 'MN' },
    { label: 'All Bookings',to: '/admin/bookings',       icon: 'BK' },
    { label: 'Reports',     to: '/admin/reports',        icon: 'RP' },
  ],
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const links = NAV_LINKS[user?.role] || []

  return (
    <aside className="sticky top-0 z-20 flex w-full shrink-0 flex-col border-b border-slate-200 bg-white/85 p-4 backdrop-blur-xl lg:h-screen lg:w-72 lg:border-b-0 lg:border-r">
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-glow">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-cyan-400 text-sm font-bold text-white shadow-lg shadow-primary-500/15">
            RM
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-slate-900">Resource Manager</h1>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Operations command center</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="chip">Booking</span>
          <span className="chip">Approvals</span>
          <span className="chip">Audit</span>
        </div>
      </div>

      <nav className="flex-1">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">Workspace</p>
        <div className="flex flex-wrap gap-2 lg:flex-col lg:space-y-1 lg:gap-0">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={clsx(
                'sidebar-link group',
              location.pathname === link.to && 'active',
              'w-full lg:w-auto'
            )}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-[11px] font-bold tracking-[0.2em] text-slate-600 group-hover:border-primary-200">
                {link.icon}
              </span>
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <div className="mt-auto border-t border-slate-200 pt-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-sm font-bold text-white shadow-sm shadow-primary-500/15">
              {user?.full_name?.[0] || '?'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">{user?.full_name}</p>
              <p className="text-xs capitalize text-slate-500">{user?.role}</p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Link to="/profile" className="btn-secondary flex-1 text-center text-sm px-3 py-2">
              Profile
            </Link>
            <button onClick={logout} className="btn-danger flex-1 text-sm px-3 py-2">
              Logout
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
