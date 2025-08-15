import { iconUrl } from "../lib/constants.js";

export default function AmountRow({
  label,
  value,
  onChange,
  readOnly = false,
  token,          // string symbol, e.g. 'BTC', 'AXLUSDC'
  setToken,       // setter
  options = [],   // string[] of symbols to choose
  placeholder = "0.0",
}) {
  return (
    <div>
      <div className="text-xs text-[color:var(--muted)]">{label}</div>
      <div className="flex items-center gap-3 rounded-xl border border-[color:var(--border)] px-4 py-3 bg-[var(--surface)]">
        <input
          readOnly={readOnly}
          inputMode="decimal"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="flex-1 bg-transparent outline-none text-[22px] leading-none placeholder-gray-400"
        />

        <div className="flex items-center gap-2 pl-3 border-l border-[color:var(--border)]">
          {/* direct SVG load; hide if missing */}
          <img
            src={iconUrl(token)}
            alt=""
            className="w-6 h-6 rounded-full bg-white/10"
            onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
            decoding="async"
            loading="lazy"
          />

          <select
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="appearance-none border border-[color:var(--border)] rounded-lg py-1.5 px-3 font-semibold pr-8
                       bg-[var(--select-bg)]
                       [background-image:url('data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'12\\' height=\\'12\\' viewBox=\\'0 0 24 24\\' fill=\\'currentColor\\'><path d=\\'M7 10l5 5 5-5z\\'/></svg>')]
                       [background-repeat:no-repeat] [background-position:right_10px_center] [background-size:12px]"
          >
            {options.map((sym) => (
              <option key={sym} value={sym}>{sym}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
