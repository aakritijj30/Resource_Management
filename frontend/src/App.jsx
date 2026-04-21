import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/home/HomePage'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import ProfilePage from './pages/profile/ProfilePage'

// Employee pages
import DashboardPage       from './pages/employee/DashboardPage'
import ResourceListPage    from './pages/employee/ResourceListPage'
import BookingFormPage     from './pages/employee/BookingFormPage'
import MyBookingsPage      from './pages/employee/MyBookingsPage'
import BookingDetailPage   from './pages/employee/BookingDetailPage'

// Manager pages
import ApprovalQueuePage   from './pages/manager/ApprovalQueuePage'
import ApprovalDetailPage  from './pages/manager/ApprovalDetailPage'
import DeptUsagePage       from './pages/manager/DeptUsagePage'

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
    <div className="app-shell">
      <div className="page-shell">
        <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/app" element={<RoleRedirect />} />

          {/* Employee routes */}
      <Route element={<ProtectedRoute allowedRoles={['employee', 'manager', 'admin']} />}>
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/employee/dashboard"       element={<DashboardPage />} />
            <Route path="/employee/resources"       element={<ResourceListPage />} />
            <Route path="/employee/book/:resourceId" element={<BookingFormPage />} />
            <Route path="/employee/bookings"        element={<MyBookingsPage />} />
            <Route path="/employee/bookings/:id"    element={<BookingDetailPage />} />
          </Route>

          {/* Manager routes */}
          <Route element={<ProtectedRoute allowedRoles={['manager', 'admin']} />}>
            <Route path="/manager/approvals"        element={<ApprovalQueuePage />} />
            <Route path="/manager/approvals/:id"    element={<ApprovalDetailPage />} />
            <Route path="/manager/dept-usage"       element={<DeptUsagePage />} />
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

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}
