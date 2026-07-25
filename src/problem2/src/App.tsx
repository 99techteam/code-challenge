import { useState } from 'react'
import { usePrices } from './hooks/usePrices'
import { SwapForm } from './components/SwapForm'
import { Toast } from './components/Toast'
import { formatTokenAmount } from './utils/format'

interface ToastState {
  message: string
  detail: string
}

export default function App() {
  const { tokens, loading, usingFallback } = usePrices()
  const [toast, setToast] = useState<ToastState | null>(null)

  return (
    <div className="app-bg flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <main className="flex w-full flex-col items-center">
        {loading ? (
          <FormSkeleton />
        ) : (
          <SwapForm
            tokens={tokens}
            onSuccess={(s) =>
              setToast({
                message: 'Swap confirmed',
                detail: `${formatTokenAmount(s.fromAmount)} ${s.from} → ${formatTokenAmount(
                  s.toAmount,
                )} ${s.to}`,
              })
            }
          />
        )}

        {usingFallback && !loading && (
          <p className="mt-4 max-w-md text-center text-[11px] text-amber-300/70">
            Live prices are unreachable — showing a bundled snapshot so you can still explore the form.
          </p>
        )}

        <footer className="mt-6 text-center text-[11px] text-slate-600">
          Prices from interview.switcheo.com · Demo only, no real transactions
        </footer>
      </main>

      {toast && (
        <Toast message={toast.message} detail={toast.detail} onDismiss={() => setToast(null)} />
      )}
    </div>
  )
}

/** Loading placeholder shown while prices are being fetched. */
function FormSkeleton() {
  return (
    <div className="w-full max-w-md animate-pulse rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-2xl backdrop-blur-xl">
      <div className="mb-6 h-6 w-24 rounded-lg bg-white/10" />
      <div className="mb-2 h-28 rounded-2xl bg-white/[0.04]" />
      <div className="mb-2 h-28 rounded-2xl bg-white/[0.04]" />
      <div className="mt-4 h-10 rounded-xl bg-white/[0.04]" />
      <div className="mt-4 h-14 rounded-2xl bg-white/10" />
    </div>
  )
}
