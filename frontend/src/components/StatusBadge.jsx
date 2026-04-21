import clsx from 'clsx'

const STATUS_STYLES = {
  pending:   'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
  approved:  'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  rejected:  'bg-red-500/20 text-red-300 border border-red-500/30',
  cancelled: 'bg-white/10 text-white/50 border border-white/10',
  completed: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  draft:     'bg-purple-500/20 text-purple-300 border border-purple-500/30',
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
