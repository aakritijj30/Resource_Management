import { useState } from 'react'
import ConfirmModal from '../../components/ConfirmModal'
import ErrorMessage from '../../components/ErrorMessage'
import LoadingSpinner from '../../components/LoadingSpinner'
import EmptyState from '../../components/EmptyState'
import { useCancelWaitlist, useMyWaitlists } from '../../hooks/useWaitlists'

export default function MyWaitlistsPage() {
  const { data: waitlists = [], isLoading, error } = useMyWaitlists()
  const cancelWaitlist = useCancelWaitlist()
  const [cancelId, setCancelId] = useState(null)

  const activeWaitlists = waitlists.filter(entry => entry.status === 'active')
  const history = waitlists.filter(entry => entry.status !== 'active')

  const formatDate = (value) =>
    new Date(value).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  return (
    <div className="w-full flex-col flex animate-fade-in relative z-10">
      <section className="page-header-card space-y-3">
        <div className="page-kicker">Scheduling Queue</div>
        <h1 className="page-title">My Waitlists</h1>
        <p className="page-copy">Track requested slots and cancel active entries when plans change.</p>
      </section>

      <ErrorMessage error={error || cancelWaitlist.error} />

      {isLoading ? (
        <div className="w-full flex justify-center py-20">
          <LoadingSpinner />
        </div>
      ) : waitlists.length === 0 ? (
        <EmptyState icon="WL" title="No waitlists yet" description="When a slot is unavailable, you can join the queue from the booking screen." />
      ) : (
        <div className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-surface-900">Active</h2>
            {activeWaitlists.length === 0 ? (
              <p className="text-sm text-surface-500">No active waitlist entries.</p>
            ) : (
              <div className="grid gap-4">
                {activeWaitlists.map(entry => (
                  <div key={entry.id} className="card flex flex-col gap-4 border border-amber-200 bg-amber-50/40 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <p className="text-lg font-bold text-surface-900">{entry.resource_name}</p>
                      <p className="text-sm text-surface-600">{formatDate(entry.start_time)} to {formatDate(entry.end_time)}</p>
                      <p className="text-xs uppercase tracking-widest text-amber-700 font-bold">Attendees {entry.attendees}</p>
                    </div>
                    <button
                      className="rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                      onClick={() => setCancelId(entry.id)}
                    >
                      Leave waitlist
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {history.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-surface-900">Recent Activity</h2>
              <div className="grid gap-4">
                {history.map(entry => (
                  <div key={entry.id} className="card flex flex-col gap-2 border border-surface-200 bg-white">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-semibold text-surface-900">{entry.resource_name}</p>
                      <span className="chip border-surface-200 bg-surface-50 text-surface-700 uppercase">{entry.status}</span>
                    </div>
                    <p className="text-sm text-surface-600">{formatDate(entry.start_time)} to {formatDate(entry.end_time)}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={!!cancelId}
        title="Leave waitlist?"
        message="You will stop receiving auto-allocation for this slot."
        confirmLabel={cancelWaitlist.isPending ? 'Leaving...' : 'Leave waitlist'}
        danger
        onConfirm={async () => {
          await cancelWaitlist.mutateAsync(cancelId)
          setCancelId(null)
        }}
        onCancel={() => setCancelId(null)}
      />
    </div>
  )
}
