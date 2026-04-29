import TokenAmountInput from "./TokenAmountInput.jsx";
import SwitchButton from "./SwitchButton.jsx";
import RatePanel from "./RatePanel.jsx";
import SubmitButton from "./SubmitButton.jsx";

export default function SwapForm({
  tokens,
  amountText,
  outputText,
  fromSymbol,
  toSymbol,
  fromBalanceLabel,
  toBalanceLabel,
  fromValueLabel,
  toValueLabel,
  rateLabel,
  hasAmount,
  priceSource,
  errorMessage,
  successMessage,
  isSubmitting,
  isFormLocked,
  canSubmit,
  onAmountChange,
  onFromTokenChange,
  onToTokenChange,
  onSwitch,
  onSubmit
}) {
  const priceStatus = priceSource === "live" ? "Live prices" : priceSource === "demo" ? "Demo prices" : "Loading prices";

  return (
    <form className="surface surface-outline relative isolate w-full p-4 sm:p-5" noValidate onSubmit={onSubmit}>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="m-0 text-xl font-semibold tracking-tight text-slate-950">Currency swap</h2>
        </div>
        <div
          className={`shrink-0 rounded-full px-2.5 py-1.5 text-center text-[11px] font-bold ring-1 ring-inset ${
            priceSource === "demo"
              ? "bg-red-50 text-red-700 ring-red-200"
              : priceSource === "loading"
                ? "bg-slate-50 text-slate-500 ring-slate-200"
                : "bg-blue-50 text-blue-700 ring-blue-200"
          }`}
        >
          {priceStatus}
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        <TokenAmountInput
          label="You pay"
          inputId="input-amount"
          amount={amountText}
          balanceLabel={fromBalanceLabel}
          valueLabel={fromValueLabel}
          tokenValue={fromSymbol}
          tokens={tokens}
          disabled={isFormLocked}
          onAmountChange={onAmountChange}
          onTokenChange={onFromTokenChange}
        />

        <div className="flex h-9 items-center justify-center">
          <SwitchButton disabled={isFormLocked} onClick={onSwitch} />
        </div>

        <TokenAmountInput
          label="You receive"
          inputId="output-amount"
          amount={outputText}
          balanceLabel={toBalanceLabel}
          valueLabel={toValueLabel}
          tokenValue={toSymbol}
          tokens={tokens}
          readOnly
          disabled={isFormLocked}
          onTokenChange={onToTokenChange}
        />
      </div>

      <RatePanel rateLabel={rateLabel} hasAmount={hasAmount} />

      <p className="mt-3 min-h-5 text-xs font-medium text-red-600" role="alert">
        {errorMessage}
      </p>

      <SubmitButton disabled={!canSubmit} isSubmitting={isSubmitting} />

      <p className="mt-3 min-h-5 text-xs font-medium text-emerald-700" role="status">
        {successMessage}
      </p>
    </form>
  );
}
