export default function RatePanel({ rateLabel, hasAmount }) {
  return (
    <div className="mt-3 grid gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-500 min-[520px]:grid-cols-2">
      <div className="flex items-center justify-between gap-2">
        <span>Rate</span>
        <span className="font-semibold text-slate-800">{rateLabel || "Unavailable"}</span>
      </div>
      <div className="flex items-center justify-between gap-2 min-[520px]:justify-end">
        <span>Price impact</span>
        <span className="font-semibold text-slate-800">{hasAmount ? "0.12%" : "0.00%"}</span>
      </div>
    </div>
  );
}
