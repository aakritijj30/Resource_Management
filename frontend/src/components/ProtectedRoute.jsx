import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from './LoadingSpinner'

export default function ProtectedRoute({ allowedRoles }) {
  const { user, isAuthenticated, bootstrapping } = useAuth()
  if (bootstrapping) return <LoadingSpinner />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user?.role)) return <Navigate to="/" replace />
  return <Outlet />
}
