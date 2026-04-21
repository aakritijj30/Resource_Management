export default function LoadingSpinner({ size = 'md', label = 'Loading...' }) {
  const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' }
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 animate-fade-in">
      <div className={`${sizes[size]} rounded-full border-2 border-slate-200 border-t-primary-500 animate-spin`} />
      {label && <p className="text-sm text-slate-500">{label}</p>}
    </div>
  )
}
