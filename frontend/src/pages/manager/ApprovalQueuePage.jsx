import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Navbar from '../../components/Navbar'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import { useQuery } from '@tanstack/react-query'
import { getApprovalQueue } from '../../api/approvalApi'
import { formatISTDateTime } from '../../utils/time'

export default function ApprovalQueuePage() {
  const navigate = useNavigate()
  const { data: approvals = [], isLoading } = useQuery({
    queryKey: ['approvals', 'queue'],
    queryFn: () => getApprovalQueue().then(r => r.data)
  })

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar title="Approval Queue" />
        <main className="flex-1 p-6 space-y-6">
          <section className="space-y-3">
            <div className="page-kicker">Manager review</div>
            <h1 className="page-title">Pending approvals</h1>
            <p className="page-copy">
              {approvals.length} request{approvals.length !== 1 ? 's' : ''} waiting for your decision.
            </p>
          </section>

          {isLoading ? (
            <LoadingSpinner />
          ) : approvals.length === 0 ? (
            <EmptyState
              icon="OK"
              title="All caught up"
              description="No pending approvals are currently waiting in your queue."
            />
          ) : (
            <div className="grid gap-4">
              {approvals.map(a => (
                <button
                  key={a.id}
                  type="button"
                  className="card flex w-full items-center justify-between gap-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-yellow-500/20"
                  onClick={() => navigate(`/manager/approvals/${a.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-yellow-400/20 bg-yellow-500/10 text-sm font-bold tracking-[0.2em] text-yellow-100">
                      {String(a.booking_id).slice(-2)}
                    </div>
                    <div>
                      <p className="text-base font-display font-semibold text-white">Booking #{a.booking_id}</p>
                      <p className="mt-1 text-xs text-white/40">
                        Submitted {formatISTDateTime(a.created_at, false)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="chip border-yellow-400/20 bg-yellow-500/10 text-yellow-100">Pending</span>
                    <span className="text-sm text-white/30">Review →</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
