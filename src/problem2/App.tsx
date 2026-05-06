import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "./src/components/Toast/ToastProvider";
import SwapForm from "./src/components/SwapForm/SwapForm";
import { SwapFormSkeleton } from "./src/components/SwapForm/SwapFormSkeleton";
import { ThemeToggle } from "./src/components/ThemeToggle/ThemeToggle";
import type { FormValues } from "./src/form/swapFormTypes";
import { useTokenPrices } from "./src/hooks/useTokenPrices";
import { getDefaultTokenPair } from "./src/lib/defaultTokens";
import { useTheme } from "./src/theme/ThemeProvider";

const SUBMIT_DELAY_MS = 2000;

const swapTokenApi = async (values: FormValues) => {
  return new Promise<void>((resolve, reject) => {
    window.setTimeout(() => {
      if (Math.random() > 0.5) {
        console.log(values);
        resolve();
      } else {
        reject(new Error("Failed to submit swap."));
      }
    }, SUBMIT_DELAY_MS);
  });
};

function App() {
  const toast = useToast();
  const { resolved, toggleResolved } = useTheme();
  const { tokenPrices, loadError, isLoading } = useTokenPrices();
  const symbols = useMemo(() => Array.from(tokenPrices.keys()), [tokenPrices]);

  const { from, to } = getDefaultTokenPair(symbols);
  const initialValues = useMemo(
    () => ({ fromToken: from, toToken: to, fromAmount: "", toAmount: "" }),
    [from, to],
  );
  const [submitInProgress, setSubmitInProgress] = useState(false);

  const handleSubmit = useCallback(
    async (values: FormValues) => {
      setSubmitInProgress(true);
      toast.dismissAll();

      try {
        await swapTokenApi(values);
        toast.success("Swap submitted successfully. (Mock transaction)");
        setSubmitInProgress(false);
        return { success: true };
      } catch (error) {
        toast.error("Failed to submit swap.");
        setSubmitInProgress(false);
        return { success: false };
      }
    },
    [toast],
  );

  const handleClearSubmitFeedback = useCallback(() => {
    toast.dismissAll();
  }, [toast]);

  const pricesReady = symbols.length > 0;
  /**
   * Stagger real form fade-in one frame past mount so opacity transitions interpolate (prevents flicker).
   * Skips extra frames when the user prefers reduced motion.
   */
  const [formEnter, setFormEnter] = useState(false);

  useEffect(() => {
    if (!pricesReady) {
      setFormEnter(false);
      return;
    }
    let canceled = false;
    const prefersReduce =
      typeof window.matchMedia !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduce) {
      queueMicrotask(() => {
        if (!canceled) {
          setFormEnter(true);
        }
      });
      return () => {
        canceled = true;
      };
    }
    let idInner = 0;
    const idOuter = window.requestAnimationFrame(() => {
      idInner = window.requestAnimationFrame(() => {
        if (!canceled) {
          setFormEnter(true);
        }
      });
    });
    return () => {
      canceled = true;
      window.cancelAnimationFrame(idOuter);
      window.cancelAnimationFrame(idInner);
    };
  }, [pricesReady]);

  const revealForm = pricesReady && formEnter;

  return (
    <>
      <div className="fixed right-3 top-3 z-[180] sm:right-8 sm:top-6">
        <ThemeToggle isDark={resolved === "dark"} onToggle={toggleResolved} />
      </div>

      <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 transition-colors duration-500 sm:py-14">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="motion-safe:animate-float absolute -left-32 top-[10%] h-[min(32rem,80vw)] w-[min(32rem,80vw)] rounded-full bg-violet-400/30 blur-[120px] dark:bg-violet-500/28" />
          <div className="motion-safe:animate-float absolute bottom-[5%] right-[-12%] h-[min(26rem,70vw)] w-[min(26rem,70vw)] rounded-full bg-cyan-300/25 blur-[100px] motion-safe:delay-[2.5s] dark:bg-cyan-400/22" />
        </div>

        <section
          className="relative z-[1] w-full max-w-[600px] rounded-[1.75rem] border border-white/60 bg-white/[0.92] p-6 shadow-card backdrop-blur-2xl transition-[border-color,background,color,box-shadow] duration-500 max-[500px]:rounded-3xl max-[500px]:p-5 dark:border-slate-700 dark:bg-slate-950/[0.82] dark:shadow-[0_26px_60px_-18px_rgba(0,0,0,0.74)] sm:p-8"
          aria-labelledby="swap-title"
        >
          <header className="text-center sm:text-left">
            <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-200/60 bg-gradient-to-r from-indigo-50/90 to-teal-50/80 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-indigo-700 dark:border-indigo-600/65 dark:from-indigo-950 dark:to-teal-950/80 dark:text-indigo-200">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-teal-400 opacity-60 motion-reduce:opacity-40 dark:bg-teal-300" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-teal-500 dark:bg-teal-400" />
              </span>
              Live feed
            </p>
            <h1
              id="swap-title"
              className="m-0 bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-800 bg-clip-text text-[1.65rem] font-bold leading-tight tracking-tight text-transparent dark:from-neutral-50 dark:via-indigo-200 dark:to-neutral-300 sm:text-[1.85rem]"
            >
              Swap tokens
            </h1>
            <p className="mt-2 max-w-[28ch] text-[0.95rem] leading-relaxed text-slate-600 dark:text-slate-400 sm:max-w-none">
              Trade at market rates with a clean, production-style flow — powered by the Switcheo price API.
            </p>
          </header>

          {loadError && (
            <p
              className="mt-5 rounded-2xl border border-red-200/80 bg-red-50/95 px-4 py-3 text-center text-[0.9rem] font-medium leading-snug text-red-900 shadow-sm dark:border-red-900 dark:bg-red-950/94 dark:text-red-100"
              role="alert"
            >
              {loadError || "Failed to load market data."}
            </p>
          )}

          {!loadError ? (
            <div className="grid min-h-[26rem] [grid-template-areas:'swap'] sm:min-h-[28rem] [&>*]:[grid-area:swap]">
              <div
                className={`transition-opacity duration-[480ms] ease-out motion-reduce:duration-150 motion-reduce:transition-opacity ${revealForm ? "pointer-events-none opacity-0" : "opacity-100"
                  }`}
                aria-hidden={revealForm}
              >
                <SwapFormSkeleton />
              </div>
              <div
                className={`transition-opacity duration-[480ms] ease-out motion-reduce:duration-150 motion-reduce:transition-opacity ${revealForm ? "opacity-100" : "pointer-events-none opacity-0"
                  }`}
              >
                {pricesReady ? (
                  <SwapForm
                    onClearSubmitFeedback={handleClearSubmitFeedback}
                    initialValues={initialValues}
                    onSubmit={handleSubmit}
                    tokenPrices={tokenPrices}
                    loadError={loadError}
                    submitInProgress={submitInProgress}
                  />
                ) : null}
              </div>
            </div>
          ) : null}
        </section>
      </main>
    </>
  );
}

export default App;
