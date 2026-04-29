import TokenSelect from "./TokenSelect.jsx";

export default function TokenAmountInput({
  label,
  inputId,
  amount,
  balanceLabel,
  valueLabel,
  tokenValue,
  tokens,
  readOnly = false,
  disabled = false,
  onAmountChange,
  onTokenChange
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="mb-2.5 flex items-center justify-between gap-4 text-xs font-medium">
        <label className="text-slate-600" htmlFor={inputId}>{label}</label>
        <span className="text-slate-500">{balanceLabel}</span>
      </div>

      <div className="flex flex-col items-stretch justify-between gap-3 min-[520px]:flex-row min-[520px]:items-center">
        <div className="flex h-11 min-w-0 flex-1 items-center rounded-lg bg-white px-3 ring-1 ring-slate-200 transition-[box-shadow,ring-color] duration-200 ease-out focus-within:ring-2 focus-within:ring-blue-500/40">
          <input
            id={inputId}
            name={inputId}
            type={readOnly ? "text" : "text"}
            inputMode={readOnly ? undefined : "decimal"}
            placeholder="0.00"
            autoComplete="off"
            readOnly={readOnly}
            disabled={disabled && !readOnly}
            value={amount}
            onChange={(event) => onAmountChange?.(event.target.value)}
            className="h-full min-w-0 flex-1 border-0 bg-transparent text-[1.45rem] font-semibold leading-none tracking-tight text-slate-950 outline-none placeholder:text-slate-300 disabled:cursor-not-allowed disabled:opacity-60 min-[520px]:text-[1.55rem]"
          />
        </div>
        <TokenSelect
          ariaLabel={readOnly ? "Token to receive" : "Token to send"}
          value={tokenValue}
          tokens={tokens}
          disabled={disabled}
          onChange={onTokenChange}
        />
      </div>

      <p className="mt-2 min-h-4 text-xs text-slate-500">{valueLabel}</p>
    </div>
  );
}
