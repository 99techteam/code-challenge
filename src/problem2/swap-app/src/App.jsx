import { useEffect, useMemo, useState } from "react";
import "./index.css";

import ThemeToggle from "./components/ThemeToggle.jsx";
import AmountRow from "./components/AmountRow.jsx"
import StatCard from "./components/StatCard.jsx";

import { NETWORK_FEE_USD, FEE_BPS, SLIPPAGE_BPS } from "./lib/constants.js";
import { fmt } from "./lib/format.js";
import { usePrices } from "./hooks/usePrices.js";

export default function App() {
  const { symbols, priceUSD, loading } = usePrices();

  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [amountIn, setAmountIn] = useState("");

  useEffect(() => {
    if (!symbols.length) return;
    setFrom((prev) => (prev && symbols.includes(prev) ? prev : symbols[0]));
    setTo((prev) => (prev && symbols.includes(prev) ? prev : (symbols[1] ?? symbols[0])));
  }, [symbols]);

  const rate = useMemo(() => {
    if (!from || !to) return NaN;
    const a = priceUSD(from);
    const b = priceUSD(to);
    return isFinite(a) && isFinite(b) && b !== 0 ? a / b : NaN;
  }, [from, to, priceUSD]);

  const rateLabel =
    !from || !to
      ? "Loading…"
      : loading
        ? "Fetching prices…"
        : isFinite(rate)
          ? `1 ${from} ≈ ${fmt(rate)} ${to}`
          : "Rate unavailable";

  // Trade math
  const trade = useMemo(() => {
    if (!from || !to) return { err: "Loading…" };
    if (!amountIn.trim()) return { err: "Please enter an amount." };

    const n = Number(amountIn);
    if (!isFinite(n) || n <= 0) return { err: "Amount must be greater than 0." };
    if (!isFinite(rate)) return { err: "Rate unavailable." };

    const fee = (n * FEE_BPS) / 10_000;
    const afterFee = n - fee;
    const outNoImpact = afterFee * rate;

    const notionalUsd = n * priceUSD(from);
    const impactBps = Math.min(200, (notionalUsd / 1_000_000) * 1000);
    const outWithImpact = outNoImpact * (1 - impactBps / 10_000);
    const minTo = outWithImpact * (1 - SLIPPAGE_BPS / 10_000);

    return { err: "", outStr: fmt(outWithImpact), fee, impactBps, minTo };
  }, [amountIn, rate, from, to, priceUSD]);

  const canSubmit =
    !!from && !!to && !trade.err && !!amountIn.trim() && isFinite(rate);

  if (!from || !to) {
    return (
      <main className="min-h-full flex items-center justify-center p-5">
        <ThemeToggle />
        <section className="w-[min(620px,94vw)] rounded-2xl border border-[color:var(--border)] p-6 bg-[var(--surface)]">
          <div className="animate-pulse space-y-3">
            <div className="h-6 w-32 bg-black/10 dark:bg-white/10 rounded" />
            <div className="h-5 w-72 bg-black/10 dark:bg-white/10 rounded" />
            <div className="h-14 w-full bg-black/10 dark:bg-white/10 rounded-xl" />
            <div className="h-14 w-full bg-black/10 dark:bg-white/10 rounded-xl" />
            <div className="h-10 w-full bg-black/10 dark:bg.white/10 rounded-lg" />
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-full flex items-center justify-center p-5">
      <ThemeToggle />

      <section
        className="w-[min(620px,94vw)] rounded-2xl border border-[color:var(--border)]
                   backdrop-blur-lg p-6 shadow-[var(--shadow)]
                   [background:linear-gradient(180deg,rgba(255,255,255,.12),rgba(255,255,255,.06))]"
      >
        {/* Header */}
        <header className="mb-3">
          <div className="flex items-center gap-2.5">
            <svg viewBox="0 0 24 24" aria-hidden className="w-6 h-6 text-[color:var(--accent-2)]">
              <path d="M7 7h7a4 4 0 1 1 0 8H8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M11 15H7a4 4 0 0 1 0-8h6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <h1 className="m-0 text-[22px] tracking-wide font-semibold">Swap</h1>
          </div>
          <p className="mt-1 text-xs text-[color:var(--muted)]">
            Swap assets from one currency to another in seconds.
          </p>
          <p className="text-xs text-[color:var(--muted)]">
            {rateLabel}
          </p>
        </header>

        {/* Form */}
        <form
          className="flex flex-col gap-3.5"
          onSubmit={(e) => {
            e.preventDefault();
            if (!canSubmit) return;
            alert(
              `Swapping ${fmt(Number(amountIn))} ${from} → ${trade.outStr} ${to}\n` +
              `Protocol fee: ${fmt(trade.fee)} ${from}\n` +
              `Price impact: ${(trade.impactBps / 100).toFixed(2)}%\n` +
              `Network fee: ~$${NETWORK_FEE_USD.toFixed(2)}\n` +
              `Min received: ${fmt(trade.minTo)} ${to}`
            );
          }}
        >
          <AmountRow
            label="You pay"
            value={amountIn}
            onChange={setAmountIn}
            token={from}
            setToken={setFrom}
            options={symbols}
            placeholder="0.0"
          />

          <button
            type="button"
            aria-label="Switch tokens"
            onClick={() => { setFrom(to); setTo(from); }}
            className="self-center grid place-content-center w-11 h-11 rounded-full border border-[color:var(--border)]
                       text-[20px] transition
                       [background:radial-gradient(120%_120%_at_30%_20%,#ffffff1a,#00000022)]
                       hover:-translate-y-0.5 hover:shadow-[0_8px_18px_-10px_rgba(0,0,0,0.5)]"
          >
            ⇅
          </button>

          <AmountRow
            label="You receive"
            value={trade.outStr || "0.000000"}
            readOnly
            token={to}
            setToken={setTo}
            options={symbols}
            placeholder="0.000000"
          />

          <p className="min-h-4 mt-0.5 text-xs text-[color:var(--danger)]">{trade.err}</p>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <StatCard title="Protocol fee">{fmt(trade.fee || 0)} {from}</StatCard>
            <StatCard title="Price impact">{((trade.impactBps || 0) / 100).toFixed(2)}%</StatCard>
            <StatCard title="Network fee (est.)">~${NETWORK_FEE_USD.toFixed(2)}</StatCard>
            <StatCard title="Min received" footer="(slippage tolerance 0.5%)">
              {fmt(trade.minTo || 0)} {to}
            </StatCard>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            aria-disabled={!canSubmit}
            className={`mt-3 rounded-xl py-3 font-semibold tracking-wide transition
              ${canSubmit
                ? "text-white bg-gradient-to-tr from-[color:var(--accent)] to-blue-400 shadow-md hover:-translate-y-0.5 hover:brightness-105"
                : "cursor-not-allowed text-[color:var(--muted)] bg-[linear-gradient(135deg,rgba(124,92,255,.18),rgba(96,165,250,.18))] border border-[color:var(--border)] shadow-[0_6px_16px_-8px_rgba(0,0,0,.15)]"
              }`}
          >
            CONFIRM SWAP
          </button>
        </form>
      </section>
    </main>
  );
}
