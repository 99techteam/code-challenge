import { useEffect } from 'react'

interface ToastProps {
  message: string
  detail?: string
  onDismiss: () => void
}

/** A transient success toast that auto-dismisses. */
export function Toast({ message, detail, onDismiss }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4200)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <div
        role="status"
        className="animate-toast-in pointer-events-auto flex items-start gap-3 rounded-2xl border border-emerald-400/25 bg-slate-900/95 px-4 py-3 shadow-2xl backdrop-blur"
      >
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <div className="pr-2">
          <p className="text-sm font-semibold text-white">{message}</p>
          {detail && <p className="mt-0.5 text-xs text-slate-400">{detail}</p>}
        </div>
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="rounded-full p-1 text-slate-500 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}
