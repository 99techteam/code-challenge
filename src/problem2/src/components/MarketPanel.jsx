export default function MarketPanel({ routeLabel }) {
  return (
    <section className="grid gap-[18px] md:gap-[26px]" aria-label="Market overview">
      <div>
        <p className="mb-2.5 text-xs font-extrabold uppercase tracking-[0.16em] text-accent-dark/90">Cross-chain swap</p>
        <h1 className="m-0 max-w-[680px] text-[clamp(2.4rem,10vw,4.2rem)] font-bold leading-[0.92] tracking-tight md:text-[clamp(2.6rem,5vw,5.2rem)]">
          Swap assets with confident execution
        </h1>
        <p className="mt-3 max-w-[560px] text-base text-muted md:text-lg">
          Get a live quote, review fees, and confirm a simulated settlement—built as a polished interview challenge submission.
        </p>
      </div>

      <div className="w-[min(460px,100%)] rounded-2xl border border-white/70 bg-white/75 p-5 shadow-route backdrop-blur">
        <span className="block text-sm font-bold text-ink/70">Best route</span>
        <strong className="mt-1.5 block text-xl tracking-tight">{routeLabel || "Loading market"}</strong>
        <div className="mt-4 subtle-divider" aria-hidden="true" />
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div>
            <span className="block text-xs font-bold uppercase tracking-[0.12em] text-muted">Fee</span>
            <strong className="mt-1 block text-base text-ink">0.12%</strong>
          </div>
          <div>
            <span className="block text-xs font-bold uppercase tracking-[0.12em] text-muted">Slippage</span>
            <strong className="mt-1 block text-base text-ink">0.50%</strong>
          </div>
          <div>
            <span className="block text-xs font-bold uppercase tracking-[0.12em] text-muted">ETA</span>
            <strong className="mt-1 block text-base text-ink">~8s</strong>
          </div>
        </div>
      </div>

      <div className="hidden" aria-hidden="true" />
    </section>
  );
}
