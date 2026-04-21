import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Navbar from '../../components/Navbar'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import { useQuery } from '@tanstack/react-query'
import { getApprovalQueue } from '../../api/approvalApi'
import { format } from 'date-fns'

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
          <div>
            <h2 className="text-2xl font-bold">Pending Approvals</h2>
            <p className="text-white/40 mt-1">
              {approvals.length} request{approvals.length !== 1 ? 's' : ''} waiting for your decision
            </p>
          </div>

          {isLoading ? <LoadingSpinner /> : approvals.length === 0
            ? <EmptyState icon="✅" title="All caught up!" description="No pending approvals in your queue." />
            : (
              <div className="space-y-3">
                {approvals.map(a => (
                  <div key={a.id}
                    className="card flex items-center justify-between gap-4 hover:border-yellow-500/30 transition-all cursor-pointer group"
                    onClick={() => navigate(`/manager/approvals/${a.id}`)}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center text-lg">⏳</div>
                      <div>
                        <p className="font-semibold group-hover:text-primary-400 transition-colors">
                          Booking #{a.booking_id}
                        </p>
                        <p className="text-xs text-white/40 mt-0.5">
                          Submitted {format(new Date(a.created_at), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="badge bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">Pending</span>
                      <span className="text-white/30 text-sm">Review →</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        </main>
      </div>
    </div>
  )
}
