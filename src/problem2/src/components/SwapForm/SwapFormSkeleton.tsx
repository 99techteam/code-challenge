/** Visual placeholder matched to SwapForm vertical rhythm — avoids CLS when prices load. */
export function SwapFormSkeleton() {
  const pulseBar =
    "h-11 w-full animate-pulse rounded-lg bg-slate-200/85 motion-reduce:animate-none dark:bg-slate-700/95";

  const panel =
    "rounded-[1.15rem] border border-slate-200/65 bg-white/55 p-[1rem_1.05rem] shadow-[0_6px_20px_-12px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-slate-700 dark:bg-slate-950/52";

  const chip =
    "mb-3 rounded-md bg-slate-200/95 dark:bg-slate-700";

  const metric =
    "flex min-h-[4.75rem] rounded-2xl border border-slate-200/65 bg-white/55 p-3 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-950/52";

  const metricInner =
    "h-12 flex-1 self-center rounded-xl bg-slate-200/85 motion-safe:animate-pulse motion-reduce:animate-none dark:bg-slate-700/90";

  return (
    <div className="mt-8 grid gap-5" aria-busy aria-label="Loading swap form">
      <div className={panel}>
        <div className={`h-2.5 w-16 ${chip}`} />
        <div className="flex gap-3 max-[500px]:flex-col">
          <div className={pulseBar} />
          <div className={pulseBar} />
        </div>
      </div>

      <div className="flex justify-center py-0.5">
        <div className="h-11 w-11 animate-pulse rounded-full bg-slate-200/95 ring-[3px] ring-white/70 motion-reduce:animate-none dark:bg-slate-700 dark:ring-slate-800" />
      </div>

      <div className={panel}>
        <div className={`h-2.5 w-20 ${chip}`} />
        <div className="flex gap-3 max-[500px]:flex-col">
          <div className={pulseBar} />
          <div className={pulseBar} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className={metric}>
          <div className={metricInner} />
        </div>
        <div className={metric}>
          <div className={metricInner} />
        </div>
      </div>

      <div className="h-[3.35rem] rounded-2xl bg-slate-200/90 motion-safe:animate-pulse motion-reduce:animate-none dark:bg-slate-700" />
    </div>
  );
}
