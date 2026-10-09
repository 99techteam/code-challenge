function SuccessNotification({ message, onClose }) {
  if (!message) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm">
      <section
        aria-label="Success notification"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl border border-emerald-400/20 bg-[#11131b] p-6 shadow-2xl shadow-black/50"
        role="alertdialog"
      >
        <div className="flex items-start gap-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-emerald-500/10 text-emerald-300">
            <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" />
              <path d="m8 12 2.5 2.5L16 9" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold text-emerald-200">Success</h2>
            <p className="mt-2 break-words text-sm leading-6 text-slate-300">{message}</p>
          </div>
        </div>
        {onClose && (
          <button
            className="mt-6 w-full rounded-xl bg-emerald-500/15 px-4 py-3 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/25 focus:outline-none focus:ring-2 focus:ring-emerald-300/60"
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

export default SuccessNotification
