import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/home/HomePage'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'

import MainLayout from './components/layout/MainLayout'

// Employee pages
import DashboardPage       from './pages/employee/DashboardPage'
import ResourceListPage    from './pages/employee/ResourceListPage'
import BookingFormPage     from './pages/employee/BookingFormPage'
import MyBookingsPage      from './pages/employee/MyBookingsPage'
import BookingDetailPage   from './pages/employee/BookingDetailPage'
import MyWaitlistsPage     from './pages/employee/MyWaitlistsPage'

// Manager pages
import ApprovalQueuePage   from './pages/manager/ApprovalQueuePage'
import ApprovalDetailPage  from './pages/manager/ApprovalDetailPage'
import PendingApprovalsPage from './pages/manager/PendingApprovalsPage'

// Admin pages
import AdminDashboardPage  from './pages/admin/AdminDashboardPage'
import ResourceManagePage  from './pages/admin/ResourceManagePage'
import PolicyConfigPage    from './pages/admin/PolicyConfigPage'
import MaintenanceBlockPage from './pages/admin/MaintenanceBlockPage'
import AllBookingsPage     from './pages/admin/AllBookingsPage'
import ReportsDashboardPage from './pages/admin/ReportsDashboardPage'

function RoleRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/" replace />
  if (user.role === 'admin')   return <Navigate to="/admin" replace />
  if (user.role === 'manager') return <Navigate to="/manager/approvals" replace />
  return <Navigate to="/employee/dashboard" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/app" element={<RoleRedirect />} />

      {/* All protected routes rendered inside MainLayout */}
      <Route element={<MainLayout />}>
        {/* Employee routes */}
        <Route element={<ProtectedRoute allowedRoles={['employee', 'manager', 'admin']} />}>
          <Route path="/employee/dashboard"       element={<DashboardPage />} />
          <Route path="/employee/resources"       element={<ResourceListPage />} />
          <Route path="/employee/book/:resourceId" element={<BookingFormPage />} />
          <Route path="/employee/bookings"        element={<MyBookingsPage />} />
          <Route path="/employee/waitlists"       element={<MyWaitlistsPage />} />
          <Route path="/employee/bookings/:id"    element={<BookingDetailPage />} />
          <Route path="/employee/bookings/:id/edit" element={<BookingFormPage isEdit={true} />} />
        </Route>

        {/* Manager routes */}
        <Route element={<ProtectedRoute allowedRoles={['manager', 'admin']} />}>
          <Route path="/manager/approvals"        element={<ApprovalQueuePage />} />
          <Route path="/manager/approvals/:id"    element={<ApprovalDetailPage />} />
          <Route path="/manager/pending-approvals" element={<PendingApprovalsPage />} />
        </Route>

        {/* Admin routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin"                    element={<AdminDashboardPage />} />
          <Route path="/admin/resources"          element={<ResourceManagePage />} />
          <Route path="/admin/policies"           element={<PolicyConfigPage />} />
          <Route path="/admin/maintenance"        element={<MaintenanceBlockPage />} />
          <Route path="/admin/bookings"           element={<AllBookingsPage />} />
          <Route path="/admin/reports"            element={<ReportsDashboardPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
