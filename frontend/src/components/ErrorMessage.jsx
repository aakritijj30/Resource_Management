export default function ErrorMessage({ error }) {
  if (!error) return null

  const msg = error?.response?.data?.detail || error?.message || 'Something went wrong'
  const lower = msg.toLowerCase()
  const isConflict = lower.includes('conflict')
  const isPolicy = lower.includes('policy') || lower.includes('duration') || lower.includes('hours')
  const isMaint = lower.includes('maintenance')

  const marker = isConflict ? 'C' : isPolicy ? 'P' : isMaint ? 'M' : '!'

  return (
    <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 animate-fade-in">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-rose-200 bg-white text-xs font-bold text-rose-700 shadow-sm">
        {marker}
      </span>
      <span className="pt-0.5 leading-6">{msg}</span>
    </div>
  )
}
