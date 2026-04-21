import { Link } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Navbar from '../../components/Navbar'
import LoadingSpinner from '../../components/LoadingSpinner'
import { useAuth } from '../../hooks/useAuth'
import { formatISTDate } from '../../utils/time'

function DetailCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/30">{label}</p>
      <p className="mt-2 break-words text-sm text-white/80">{value || 'Not available'}</p>
      {hint && <p className="mt-2 text-xs text-white/35">{hint}</p>}
    </div>
  )
}

export default function ProfilePage() {
  const { user, logout, bootstrapping } = useAuth()

  if (bootstrapping) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1">
          <Navbar title="Profile" />
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar title="Profile" />
        <main className="flex-1 space-y-6 p-4 sm:p-6">
          <section className="space-y-3">
            <div className="page-kicker">Employee profile</div>
            <h1 className="page-title">{user?.full_name || 'Your profile'}</h1>
            <p className="page-copy">
              This page shows your personal and job-related details only, not booking history.
            </p>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
            <div className="section-shell">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-600 text-xl font-bold text-white">
                    {user?.full_name?.[0] || '?'}
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-white">{user?.full_name}</h3>
                    <p className="mt-1 text-sm text-white/45 capitalize">{user?.role}</p>
                  </div>
                </div>
                <button className="btn-danger self-start text-sm" onClick={logout}>
                  Logout
                </button>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <DetailCard
                  label="Employee ID"
                  value={`#${user?.id}`}
                  hint="Your unique account identifier in the system."
                />
                <DetailCard
                  label="Email"
                  value={user?.email}
                  hint="Use this email to sign in."
                />
                <DetailCard
                  label="Department"
                  value={user?.department_name || 'Not assigned'}
                  hint={user?.department_id ? `Department ID #${user.department_id}` : 'Ask an admin to assign a department.'}
                />
                <DetailCard
                  label="Account status"
                  value={user?.is_active ? 'Active' : 'Inactive'}
                  hint="Inactive accounts cannot log in."
                />
                <DetailCard
                  label="Role"
                  value={user?.role}
                  hint="Controls which dashboard you see."
                />
                <DetailCard
                  label="Member since"
                  value={user?.created_at ? formatISTDate(user.created_at) : 'Unavailable'}
                  hint="When the account was created."
                />
              </div>
            </div>

            <div className="space-y-6">
              <section className="section-shell">
                <div className="mb-4">
                  <h3 className="font-display text-lg font-semibold text-white">Account snapshot</h3>
                  <p className="mt-1 text-sm text-white/40">Quick identity and access details for support or verification.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailCard label="Full name" value={user?.full_name} />
                  <DetailCard label="First letter" value={user?.full_name?.[0]} />
                  <DetailCard label="Role scope" value={user?.role === 'admin' ? 'Full system access' : user?.role === 'manager' ? 'Department oversight' : 'Employee access'} />
                  <DetailCard label="Workspace" value="Resource management suite" />
                </div>
              </section>

              <section className="section-shell">
                <div className="mb-4">
                  <h3 className="font-display text-lg font-semibold text-white">Need to navigate?</h3>
                  <p className="mt-1 text-sm text-white/40">Jump directly to the correct area for your role.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link to={user?.role === 'admin' ? '/admin' : user?.role === 'manager' ? '/manager/approvals' : '/employee/dashboard'} className="btn-primary">
                    Open dashboard
                  </Link>
                  <Link to="/employee/resources" className="btn-secondary">
                    Browse resources
                  </Link>
                </div>
              </section>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
