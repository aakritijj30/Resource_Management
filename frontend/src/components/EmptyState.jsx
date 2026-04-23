export default function EmptyState({ icon = '—', title = 'Nothing here', description = '' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center animate-fade-in">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-surface-200 bg-white text-xl font-semibold text-primary-700 shadow-sm">
        {icon}
      </span>
      <h3 className="text-lg font-semibold text-surface-900">{title}</h3>
      {description && <p className="max-w-xs text-sm text-surface-500 font-medium">{description}</p>}
    </div>
  )
}
