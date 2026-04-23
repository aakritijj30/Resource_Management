import { useAuth } from '../hooks/useAuth'
import NotificationCenter from './NotificationCenter'

export default function Navbar({ title }) {
  const { user, logout } = useAuth()
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-xl shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">Resource management suite</p>
        <h2 className="mt-1 font-display text-lg font-semibold text-slate-900">{title}</h2>
      </div>
      <div className="flex items-center gap-3">
        <NotificationCenter />
        <span className="chip capitalize">{user?.role}</span>
        <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 md:flex">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.35)]" />
          Live workspace
        </div>
        <button
          onClick={logout}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-200 hover:text-rose-600"
          id="btn-logout"
        >
          Sign out
        </button>
      </div>
    </header>
  )
}
