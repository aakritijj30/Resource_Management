import { useMutation, useQueryClient } from '@tanstack/react-query'
import { markAsRead } from '../api/notificationApi'

export default function PriorityAlertModal({ alert, onClose }) {
  const qc = useQueryClient()
  const markReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      onClose()
    }
  })

  if (!alert) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-[2rem] border border-rose-500/30 bg-[#0A0A0A] p-8 shadow-[0_32px_80px_rgba(244,63,94,0.15)] animate-rise">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h2 className="text-2xl font-display font-bold text-white mb-2">{alert.title}</h2>
        <p className="text-white/60 leading-relaxed mb-8">
          {alert.message}
        </p>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => markReadMutation.mutate(alert.id)}
            className="btn-danger w-full py-4 text-lg font-semibold"
            disabled={markReadMutation.isPending}
          >
            {markReadMutation.isPending ? 'Processing...' : 'I understand'}
          </button>
          <p className="text-center text-[10px] uppercase tracking-widest text-white/20">
            This booking slot was required by a manager for priority business.
          </p>
        </div>
      </div>
    </div>
  )
}
