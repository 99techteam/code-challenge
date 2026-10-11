import { iconUrl } from "../lib/constants.js";

export default function AmountRow({
  label,
  value,
  onChange,
  readOnly = false,
  token,
  setToken,
  options = [],
  placeholder = "0.0",
}) {
  return (
    <div className="w-full">
      <div className="text-xs text-[color:var(--muted)]">{label}</div>
      <div className="mt-1.5 flex flex-col gap-3 rounded-xl border border-[color:var(--border)] bg-[var(--surface)] px-3 py-3 sm:flex-row sm:items-center sm:gap-3 sm:px-4">
        <input
          readOnly={readOnly}
          inputMode="decimal"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="min-w-0 w-full flex-1 bg-transparent text-[clamp(1.3rem,4vw,2.2rem)] leading-none text-ellipsis outline-none placeholder-gray-400"
        />

        <div className="flex items-center justify-between gap-2 border-t border-[color:var(--border)] pt-3 sm:border-l sm:border-t-0 sm:pl-3 sm:pt-0 sm:pr-0">
          <div className="flex min-w-0 items-center gap-2">
            <img
              src={iconUrl(token)}
              alt=""
              className="h-6 w-6 rounded-full bg-white/10 object-cover"
              onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
              decoding="async"
              loading="lazy"
            />

            <select
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="max-w-[116px] appearance-none border border-[color:var(--border)] rounded-lg bg-[var(--select-bg)] py-1.5 pl-3 pr-8 font-semibold"
            >
              {options.map((sym) => (
                <option key={sym} value={sym}>{sym}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
