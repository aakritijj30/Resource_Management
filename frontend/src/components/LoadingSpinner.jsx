export default function LoadingSpinner({ size = 'md', label = 'Loading...' }) {
  const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' }
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div className={`${sizes[size]} border-2 border-white/10 border-t-primary-500 rounded-full animate-spin`} />
      {label && <p className="text-white/40 text-sm">{label}</p>}
    </div>
  )
}
