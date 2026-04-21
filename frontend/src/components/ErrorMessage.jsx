export default function ErrorMessage({ error }) {
  if (!error) return null
  const msg = error?.response?.data?.detail || error?.message || 'Something went wrong'
  const isConflict = msg.toLowerCase().includes('conflict')
  const isPolicy   = msg.toLowerCase().includes('policy') || msg.toLowerCase().includes('duration') || msg.toLowerCase().includes('hours')
  const isMaint    = msg.toLowerCase().includes('maintenance')

  const icon = isConflict ? '⚡' : isPolicy ? '📋' : isMaint ? '🔧' : '❌'

  return (
    <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm animate-fade-in">
      <span className="text-lg shrink-0">{icon}</span>
      <span>{msg}</span>
    </div>
  )
}
