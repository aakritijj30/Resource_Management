import clsx from 'clsx'

const STATUS_STYLES = {
  pending:   'bg-amber-50 text-amber-700 border-amber-200',
  approved:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected:  'bg-rose-50 text-rose-700 border-rose-200',
  cancelled: 'bg-surface-100 text-surface-600 border-surface-200',
  completed: 'bg-sky-50 text-sky-700 border-sky-200',
  draft:     'bg-violet-50 text-violet-700 border-violet-200',
}

export default function StatusBadge({ status }) {
  const s = status?.toLowerCase() || 'draft'
  return (
    <span className={clsx('badge', STATUS_STYLES[s] || 'bg-white/10 text-white/50')}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {s.charAt(0).toUpperCase() + s.slice(1)}
    </span>
  )
}
