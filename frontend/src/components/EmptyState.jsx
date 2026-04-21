export default function EmptyState({ icon = '📭', title = 'Nothing here', description = '' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center animate-fade-in">
      <span className="text-5xl">{icon}</span>
      <h3 className="text-lg font-semibold text-white/60">{title}</h3>
      {description && <p className="text-sm text-white/30 max-w-xs">{description}</p>}
    </div>
  )
}
