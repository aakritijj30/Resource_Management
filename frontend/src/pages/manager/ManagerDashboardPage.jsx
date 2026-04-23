import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Navbar from '../../components/Navbar'
import StatusBadge from '../../components/StatusBadge'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import { useBookings, useDepartmentBookings } from '../../hooks/useBookings'
import { useDeptReport } from '../../hooks/useReports'
import { useResources } from '../../hooks/useResources'
import { useAuth } from '../../hooks/useAuth'
import { formatISTDateTime, formatISTTime, isAfterNowIST } from '../../utils/time'
import { usePriorityAlert } from '../../hooks/useNotifications'
import PriorityAlertModal from '../../components/PriorityAlertModal'

function StatCard({ label, value, hint, active, onClick, color = 'primary' }) {
  const colorClasses = {
    primary: active ? 'border-primary-400/30 bg-primary-500/10' : 'border-white/10 bg-white/5 hover:border-white/20',
    yellow: active ? 'border-yellow-400/30 bg-yellow-500/10' : 'border-white/10 bg-white/5 hover:border-white/20',
    emerald: active ? 'border-emerald-400/30 bg-emerald-500/10' : 'border-white/10 bg-white/5 hover:border-white/20',
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'stat-card text-left transition-all duration-200 hover:-translate-y-1',
        colorClasses[color],
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-3xl font-display font-semibold text-white">{value}</div>
          <div className="mt-1 text-sm text-white/45">{label}</div>
        </div>
        <div className={`h-11 w-11 rounded-2xl border border-${color}-400/20 bg-${color}-500/10`} />
      </div>
      <div className="text-xs uppercase tracking-[0.22em] text-white/30">{hint}</div>
    </button>
  )
}

function BookingLine({ booking, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition-all hover:border-white/20 hover:bg-white/[0.08]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{booking.purpose}</p>
          <p className="mt-1 text-xs text-white/40">
            {formatISTDateTime(booking.start_time)} - {formatISTTime(booking.end_time)}
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-wider text-white/30">
            By: {booking.user?.full_name || 'System'}
          </p>
        </div>
        <StatusBadge status={booking.status} />
      </div>
    </button>
  )
}

function ResourceCard({ resource, onClick }) {
  const isCommon = resource.department_id === null

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition-all hover:-translate-y-1 hover:border-primary-400/20 hover:bg-white/[0.08]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{resource.name}</p>
          <p className="mt-1 text-xs text-white/40 capitalize">{resource.type.replaceAll('_', ' ')}</p>
        </div>
        <span className={`chip ${isCommon ? 'border-cyan-400/20 bg-cyan-500/10 text-cyan-200' : 'border-indigo-400/20 bg-indigo-500/10 text-indigo-200'}`}>
          {isCommon ? 'Common' : 'Dept'}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-white/30">Location</p>
          <p className="mt-1 truncate text-sm text-white/70">{resource.location || 'TBD'}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-white/30">Capacity</p>
          <p className="mt-1 text-sm text-white/70">{resource.capacity} people</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {resource.approval_required && (
          <span className="chip border-yellow-400/20 bg-yellow-500/10 text-yellow-100 text-[10px]">
            Approval req.
          </span>
        )}
        <span className="chip text-[10px]">Resource #{resource.id}</span>
      </div>
    </button>
  )
}

export default function ManagerDashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data: myBookings = [], isLoading: isLoadingMine } = useBookings({ mine_only: true })
  const { data: deptBookings = [], isLoading: isLoadingDept } = useDepartmentBookings()
  const { data: resources = [], isLoading: isLoadingResources } = useResources()
  const { data: deptUsage = [], isLoading: isLoadingUsage } = useDeptReport()

  const [statusFilter, setStatusFilter] = useState('all')
  const priorityAlert = usePriorityAlert()
  const [showAlert, setShowAlert] = useState(false)

  useMemo(() => {
    if (priorityAlert) {
      setShowAlert(true)
    }
  }, [priorityAlert])

  const pendingDept = useMemo(() => deptBookings.filter(b => b.status === 'pending'), [deptBookings])
  const approvedDept = useMemo(() => deptBookings.filter(b => b.status === 'approved'), [deptBookings])
  const myUpcoming = useMemo(
    () => myBookings.filter(b => b.status === 'approved' && isAfterNowIST(b.start_time)),
    [myBookings]
  )

  const filteredDept = useMemo(() => {
    if (statusFilter === 'all') return deptBookings
    return deptBookings.filter(b => b.status === statusFilter)
  }, [deptBookings, statusFilter])

  const commonResources = useMemo(
    () => resources.filter(resource => resource.department_id === null),
    [resources]
  )
  const deptResources = useMemo(
    () => resources.filter(resource => resource.department_id !== null),
    [resources]
  )
  const myDeptUsage = useMemo(() => {
    if (!user?.department_id) return null
    return deptUsage.find(row => row.department_id === user.department_id) || null
  }, [deptUsage, user?.department_id])

  const stats = [
    {
      key: 'mine',
      label: 'My bookings',
      value: myBookings.length,
      hint: 'Personal schedule',
      color: 'emerald',
      active: true,
    },
    {
      key: 'pending',
      label: 'Pending approvals',
      value: pendingDept.length,
      hint: 'Action required',
      color: 'yellow',
      active: statusFilter === 'pending',
    },
    {
      key: 'approved',
      label: 'Approved dept bookings',
      value: approvedDept.length,
      hint: 'Confirmed slots',
      color: 'primary',
      active: statusFilter === 'approved',
    },
    {
      key: 'resources',
      label: 'Visible resources',
      value: resources.length,
      hint: 'Common + department',
      color: 'primary',
      active: false,
    },
  ]

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar title="Manager Dashboard" />

        <main className="flex-1 space-y-6 p-4 sm:p-6">
          <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="page-kicker">Management Control</div>
              <h1 className="page-title">
                Welcome, {user?.full_name?.split(' ')[0]}
              </h1>
              <p className="page-copy">
                Review your own bookings, watch department activity, and jump straight into resources.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                className="btn-secondary"
                onClick={() => navigate('/employee/resources')}
              >
                Browse Resources
              </button>
              <button
                className="btn-primary"
                onClick={() => navigate('/manager/approvals')}
              >
                Go to Queue
              </button>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(stat => (
              <StatCard
                key={stat.key}
                label={stat.label}
                value={stat.value}
                hint={stat.hint}
                color={stat.color}
                active={stat.active}
                onClick={() => {
                  if (stat.key === 'pending') setStatusFilter('pending')
                  if (stat.key === 'approved') setStatusFilter('approved')
                  if (stat.key === 'mine') navigate('/manager/bookings')
                }}
              />
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <div className="section-shell">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="font-display text-lg font-semibold text-white">My bookings</h3>
                  <p className="text-sm text-white/40">
                    Your confirmed and pending requests are shown here.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="chip">{myBookings.length} total</span>
                  <span className="chip">{myUpcoming.length} upcoming</span>
                </div>
              </div>

              {isLoadingMine ? (
                <LoadingSpinner />
              ) : myBookings.length === 0 ? (
                <div className="mt-6">
                  <EmptyState
                    icon="BK"
                    title="No personal bookings"
                    description="Create your first booking from the resources page."
                  />
                </div>
              ) : (
                <div className="mt-6 grid gap-3">
                  {myBookings.slice(0, 5).map(booking => (
                    <BookingLine
                      key={booking.id}
                      booking={booking}
                      onClick={() => navigate(`/manager/bookings/${booking.id}`)}
                    />
                  ))}
                </div>
              )}

              <div className="mt-5">
                <button className="btn-primary" onClick={() => navigate('/manager/bookings')}>
                  Open bookings view
                </button>
              </div>
            </div>

            <div className="section-shell">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="font-display text-lg font-semibold text-white">Department bookings</h3>
                  <p className="text-sm text-white/40">
                    Track booking activity across your department.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    className={`chip ${statusFilter === 'pending' ? 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30' : ''}`}
                    onClick={() => setStatusFilter('pending')}
                  >
                    Pending
                  </button>
                  <button
                    className={`chip ${statusFilter === 'approved' ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30' : ''}`}
                    onClick={() => setStatusFilter('approved')}
                  >
                    Approved
                  </button>
                  <button
                    className={`chip ${statusFilter === 'all' ? 'bg-primary-500/20 text-primary-200 border-primary-500/30' : ''}`}
                    onClick={() => setStatusFilter('all')}
                  >
                    All
                  </button>
                </div>
              </div>

              {isLoadingDept ? (
                <LoadingSpinner />
              ) : filteredDept.length === 0 ? (
                <div className="mt-6">
                  <EmptyState
                    icon="AP"
                    title="No department bookings"
                    description="Try switching the filter to see another booking state."
                  />
                </div>
              ) : (
                <div className="mt-6 grid gap-3">
                  {filteredDept.slice(0, 5).map(booking => (
                    <BookingLine
                      key={booking.id}
                      booking={booking}
                      onClick={() => navigate(`/manager/bookings/${booking.id}`)}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="section-shell">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-display text-lg font-semibold text-white">Visible resources</h3>
                <p className="text-sm text-white/40">
                  These resources come from the same API used by the booking pages.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="chip">Common: {commonResources.length}</span>
                <span className="chip">Department: {deptResources.length}</span>
              </div>
            </div>

            {isLoadingResources ? (
              <LoadingSpinner />
            ) : resources.length === 0 ? (
              <div className="mt-6">
                <EmptyState
                  icon="RS"
                  title="No resources available"
                  description="If this stays empty, the backend is likely pointed at a different database or the resources are inactive."
                />
              </div>
            ) : (
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {resources.slice(0, 6).map(resource => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    onClick={() => navigate(`/employee/book/${resource.id}`)}
                  />
                ))}
              </div>
            )}

            <div className="mt-5">
              <button className="btn-secondary" onClick={() => navigate('/employee/resources')}>
                Open full resource catalog
              </button>
            </div>
          </section>

          <section className="section-shell">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-display text-lg font-semibold text-white">Department usage</h3>
                <p className="text-sm text-white/40">
                  See how your department is performing across approved, rejected, and cancelled bookings.
                </p>
              </div>
              <button className="btn-secondary" onClick={() => navigate('/manager/dept-usage')}>
                Open usage page
              </button>
            </div>

            {isLoadingUsage ? (
              <LoadingSpinner />
            ) : myDeptUsage ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-transparent p-5 shadow-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-indigo-400/70">Department</p>
                  <p className="mt-2 text-xl font-bold text-white">{myDeptUsage.department_name}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/30">Total Activity</p>
                  <p className="mt-2 text-3xl font-display font-semibold text-white">{myDeptUsage.total_bookings}</p>
                </div>
                <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-400/70">Approved</p>
                  <p className="mt-2 text-3xl font-display font-semibold text-emerald-300">{myDeptUsage.approved_count}</p>
                </div>
                <div className="rounded-2xl border border-rose-500/20 bg-gradient-to-br from-rose-500/10 to-transparent p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-rose-400/70">Cancelled</p>
                  <p className="mt-2 text-3xl font-display font-semibold text-rose-300">{myDeptUsage.cancelled_count}</p>
                </div>
              </div>
            ) : (
              <EmptyState
                icon="DU"
                title="No department usage yet"
                description="Bookings from your department will appear here once the team starts scheduling resources."
              />
            )}
          </section>
        </main>
      </div>
      {showAlert && (
        <PriorityAlertModal 
          alert={priorityAlert} 
          onClose={() => setShowAlert(false)} 
        />
      )}
    </div>
  )
}
