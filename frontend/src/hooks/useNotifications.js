import { useQuery } from '@tanstack/react-query'
import { getNotifications } from '../api/notificationApi'
import { useMemo } from 'react'

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    refetchInterval: 30000,
  })
}

export function usePriorityAlert() {
  const { data: notifications = [] } = useNotifications()
  
  return useMemo(() => {
    // Find unread priority cancellations
    return notifications.find(n => !n.is_read && n.title.includes('Priority')) || null
  }, [notifications])
}
