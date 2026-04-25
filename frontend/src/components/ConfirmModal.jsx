export default function ConfirmModal({ isOpen, title, message, confirmLabel = 'Confirm', onConfirm, onCancel, danger = false }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-surface-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-surface-50 border-2 border-primary-500 rounded-[2.5rem] p-10 max-w-md w-full animate-slide-in shadow-2xl relative overflow-hidden">
        {/* Subtle decorative elements */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary-100/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-primary-100/50 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <h3 className="text-2xl font-display font-extrabold text-black mb-3">{title}</h3>
          <p className="text-black font-medium text-base mb-10 leading-relaxed opacity-90">{message}</p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button 
              className="px-6 py-3.5 rounded-2xl bg-white text-surface-600 font-bold uppercase tracking-widest text-[10px] border border-surface-200 hover:bg-surface-100 hover:text-surface-900 transition-all flex-1 order-2 sm:order-1" 
              onClick={onCancel}
            >
              No, Keep it
            </button>
            <button 
              className="px-6 py-3.5 rounded-2xl bg-primary-600 text-white font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary-500/30 hover:bg-primary-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex-1 order-1 sm:order-2" 
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
