function ErrorNotification({ message, onClose }) {
  if (!message) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm">
      <section
        aria-label="Error notification"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl border border-rose-400/20 bg-[#11131b] p-6 shadow-2xl shadow-black/50"
        role="alertdialog"
      >
        <div className="flex items-start gap-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-rose-500/10 text-rose-300">
            <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v5m0 3h.01" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold text-rose-200">Error</h2>
            <p className="mt-2 break-words text-sm leading-6 text-slate-300">{message}</p>
          </div>
        </div>
        {onClose && (
          <button
            className="mt-6 w-full rounded-xl bg-rose-500/15 px-4 py-3 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/25 focus:outline-none focus:ring-2 focus:ring-rose-300/60"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        )}
      </section>
    </div>
  )
}

export default ErrorNotification
