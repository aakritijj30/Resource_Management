import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import clsx from 'clsx'

export default function PublicNav() {
  const { user } = useAuth()
  const location = useLocation()
  const isAuthed = !!user

  const links = [
    { label: 'Home', to: isAuthed ? '/app' : '/' },
    { label: 'Login', to: isAuthed ? '/app' : '/login' },
    { label: 'Signup', to: isAuthed ? '/app' : '/signup' },
    { label: 'Dashboard', to: isAuthed ? '/app' : '/login' },
  ]

  return (
    <header className="relative z-20 mx-auto mb-6 max-w-7xl">
      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white/85 px-4 py-4 shadow-glow backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <p className="text-sm font-bold text-slate-600">Bookings, approvals, and shared resources.</p>
        </div>

        <nav className="flex flex-wrap gap-2">
          {links.map(link => (
            <Link
              key={link.label}
              to={link.to}
              className={clsx(
                'rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5',
                location.pathname === link.to
                  ? 'border-primary-200 bg-primary-50 text-primary-900'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
