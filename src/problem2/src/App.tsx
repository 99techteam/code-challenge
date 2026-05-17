import { usePrices } from "./hooks/usePrices";
import { SwapForm } from "./components/SwapForm";

function LoadingCard() {
  return (
    <div className="w-full max-w-[480px] rounded-3xl border border-border-card bg-surface-card backdrop-blur-xl p-6 animate-pulse">
      <div className="h-5 w-20 rounded bg-white/10 mb-5" />
      <div className="space-y-2">
        <div className="h-28 rounded-2xl bg-white/5" />
        <div className="h-28 rounded-2xl bg-white/5" />
      </div>
      <div className="h-14 rounded-2xl bg-white/10 mt-4" />
    </div>
  );
}

function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="w-full max-w-[480px] rounded-3xl border border-error/30 bg-surface-card backdrop-blur-xl p-8 text-center">
      <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-error/10 text-error">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v5M12 16h.01" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold mb-1">Couldn't load prices</h2>
      <p className="text-sm text-ink-secondary mb-5">{message}</p>
      <button
        onClick={onRetry}
        className="focus-ring rounded-2xl bg-accent-gradient px-6 py-2.5 text-sm font-semibold text-white"
      >
        Retry
      </button>
    </div>
  );
}

function BackgroundBlobs() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-accent-start/20 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-[480px] h-[480px] rounded-full bg-accent-end/20 blur-3xl" />
    </div>
  );
}

export default function App() {
  const { tokens, isLoading, error, retry } = usePrices();

  return (
    <>
      <BackgroundBlobs />
      <main className="relative min-h-screen flex items-center justify-center p-4">
        {isLoading && <LoadingCard />}
        {!isLoading && error && (
          <ErrorCard message={error.message} onRetry={retry} />
        )}
        {!isLoading && !error && tokens.length > 0 && <SwapForm tokens={tokens} />}
        {!isLoading && !error && tokens.length === 0 && (
          <ErrorCard message="No tradable tokens were returned." onRetry={retry} />
        )}
      </main>
    </>
  );
}
