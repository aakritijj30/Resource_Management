import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNotifications, markAsRead, markAllRead } from '../api/notificationApi'
import { formatISTDateTime } from '../utils/time'

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const qc = useQueryClient()

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    refetchInterval: 30000, // Poll every 30 seconds
  })

  const unreadCount = useMemo(() => notifications.filter(n => !n.is_read).length, [notifications])

  const markReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] })
  })

  const markAllReadMutation = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] })
  })

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white/60 hover:text-white transition-colors rounded-xl hover:bg-white/5"
        title="Notifications"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 max-h-[32rem] overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0A]/95 backdrop-blur-xl shadow-2xl z-50 flex flex-col">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
              <h3 className="font-semibold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={() => markAllReadMutation.mutate()}
                  className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-10 text-center text-white/30">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-sm italic">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {notifications.map((n) => {
                    const isPriority = n.title.includes('Priority')
                    return (
                      <div 
                        key={n.id} 
                        className={`p-4 transition-colors ${n.is_read ? 'bg-transparent' : isPriority ? 'bg-rose-500/10 border-l-4 border-rose-500' : 'bg-primary-500/[0.03]'}`}
                        onClick={() => !n.is_read && markReadMutation.mutate(n.id)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className={`text-sm ${n.is_read ? 'text-white/60' : isPriority ? 'text-rose-400 font-bold' : 'text-white font-medium'}`}>
                              {n.title}
                            </p>
                            <p className={`mt-1 text-xs leading-relaxed line-clamp-3 ${n.is_read ? 'text-white/40' : 'text-white/70'}`}>
                              {n.message}
                            </p>
                            <p className="mt-2 text-[10px] uppercase tracking-wider text-white/20">
                              {formatISTDateTime(n.created_at)}
                            </p>
                          </div>
                          {!n.is_read && (
                            <div className={`h-2 w-2 mt-1.5 rounded-full shrink-0 ${isPriority ? 'bg-rose-500' : 'bg-primary-500'}`} />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            
            {notifications.length > 0 && (
              <div className="p-3 bg-white/5 text-center border-t border-white/10">
                <p className="text-[10px] text-white/30 uppercase tracking-widest">
                  Showing latest {notifications.length} alerts
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
