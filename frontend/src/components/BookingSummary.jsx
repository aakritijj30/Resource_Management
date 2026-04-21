import StatusBadge from './StatusBadge'

const STATUS_ORDER = ['pending', 'approved', 'rejected', 'cancelled', 'completed', 'draft']

function countByStatus(bookings) {
  const counts = STATUS_ORDER.reduce((acc, status) => {
    acc[status] = 0
    return acc
  }, {})

  for (const booking of bookings || []) {
    const status = booking?.status?.toLowerCase?.() || 'draft'
    if (counts[status] === undefined) counts[status] = 0
    counts[status] += 1
  }

  return counts
}

export default function BookingSummary({ bookings = [], title = 'Booking status', subtitle = '' }) {
  const counts = countByStatus(bookings)
  const total = bookings.length

  const cards = [
    { label: 'Total', value: total, status: null },
    { label: 'Pending', value: counts.pending, status: 'pending' },
    { label: 'Approved', value: counts.approved, status: 'approved' },
    { label: 'Rejected', value: counts.rejected, status: 'rejected' },
    { label: 'Cancelled', value: counts.cancelled, status: 'cancelled' },
    { label: 'Completed', value: counts.completed, status: 'completed' },
  ]

  return (
    <section className="section-shell">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-lg font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
        <span className="chip">{total} total</span>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {cards.map(card => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">{card.label}</p>
              <p className="mt-2 text-3xl font-display font-semibold text-slate-900">{card.value}</p>
            </div>
              {card.status ? <StatusBadge status={card.status} /> : <span className="chip">All</span>}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
