import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import clsx from 'clsx'

const NAV_LINKS = {
  employee: [
    { label: 'Dashboard',  to: '/employee/dashboard',  icon: '🏠' },
    { label: 'Resources',  to: '/employee/resources',  icon: '🏢' },
    { label: 'My Bookings',to: '/employee/bookings',   icon: '📅' },
  ],
  manager: [
    { label: 'Approvals',  to: '/manager/approvals',   icon: '✅' },
    { label: 'Dept Usage', to: '/manager/dept-usage',  icon: '📊' },
    { label: 'My Bookings',to: '/employee/bookings',   icon: '📅' },
  ],
  admin: [
    { label: 'Dashboard',  to: '/admin',               icon: '🏠' },
    { label: 'Resources',  to: '/admin/resources',     icon: '🏢' },
    { label: 'Policies',   to: '/admin/policies',      icon: '📋' },
    { label: 'Maintenance',to: '/admin/maintenance',   icon: '🔧' },
    { label: 'All Bookings',to: '/admin/bookings',     icon: '📅' },
    { label: 'Reports',    to: '/admin/reports',       icon: '📈' },
  ],
}

export default function Sidebar() {
  const { user } = useAuth()
  const location = useLocation()
  const links = NAV_LINKS[user?.role] || []

  return (
    <aside className="w-64 shrink-0 bg-surface-800 border-r border-white/5 flex flex-col h-screen sticky top-0 p-4 gap-1">
      <div className="mb-6 px-2">
        <div className="inline-flex items-center gap-2 mb-1">
          <span className="text-2xl">⚡</span>
          <h1 className="text-lg font-bold bg-gradient-to-r from-primary-400 to-indigo-300 bg-clip-text text-transparent">
            BookSpace
          </h1>
        </div>
        <p className="text-xs text-white/30">Enterprise Resource Booking</p>
      </div>

      {links.map(link => (
        <Link
          key={link.to}
          to={link.to}
          className={clsx('sidebar-link', location.pathname === link.to && 'active')}
        >
          <span>{link.icon}</span>
          <span>{link.label}</span>
        </Link>
      ))}

      <div className="mt-auto border-t border-white/5 pt-4">
        <div className="flex items-center gap-3 px-2">
          <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-sm font-bold">
            {user?.full_name?.[0] || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.full_name}</p>
            <p className="text-xs text-white/40 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
