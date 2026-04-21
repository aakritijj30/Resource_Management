import { useAuth } from '../hooks/useAuth'

export default function Navbar({ title }) {
  const { user, logout } = useAuth()
  return (
    <header className="h-16 border-b border-white/5 bg-surface-800/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30">
      <h2 className="font-semibold text-white/80">{title}</h2>
      <div className="flex items-center gap-4">
        <span className="text-sm text-white/40 capitalize bg-white/5 px-3 py-1 rounded-full border border-white/10">
          {user?.role}
        </span>
        <button
          onClick={logout}
          className="text-sm text-white/40 hover:text-red-400 transition-colors duration-200"
          id="btn-logout"
        >
          Sign out
        </button>
      </div>
    </header>
  )
}
