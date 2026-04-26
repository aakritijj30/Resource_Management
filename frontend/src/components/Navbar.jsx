import { useAuth } from '../hooks/useAuth'
import { User } from 'lucide-react'

export default function Navbar({ title }) {
  const { user, logout } = useAuth()
  
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-xl shadow-[0_8px_24px_rgba(15,23,42,0.05)] gap-8">
      <div className="shrink-0">
        <h2 className="font-display text-lg font-black text-surface-950 tracking-tight">{title}</h2>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end hidden sm:flex">
            <p className="text-sm font-black text-surface-950 leading-none">{user?.full_name}</p>
            <p className="text-[10px] uppercase font-black tracking-widest text-surface-900 mt-1">{user?.role}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 border border-primary-200 shadow-sm overflow-hidden">
             {user?.avatar_url ? (
               <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
             ) : (
               <User size={20} />
             )}
          </div>
        </div>
      </div>
    </header>
  )
}
