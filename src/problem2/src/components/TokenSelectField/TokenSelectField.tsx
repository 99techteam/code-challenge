import { ChangeEvent, ReactNode } from "react";
import { useSwapFormField } from "../../form/SwapFormContext";
import { Input } from "../Input/Input";
import { SearchableDropdown } from "../SearchableDropdown/SearchableDropdown";
import { TokenIcon } from "../TokenIcon/TokenIcon";

export type SwapTokenField = "fromToken" | "toToken";
export type SwapAmountField = "fromAmount" | "toAmount";

type Props = {
  id: string;
  ariaLabel: string;
  symbols: string[];
  disabled?: boolean;
  tokenField: SwapTokenField;
  amountField: SwapAmountField;
  rightIcon?: ReactNode;
  label?: string;
  amountReadOnly?: boolean;
};

const TokenSelectField = ({
  id,
  ariaLabel,
  symbols,
  disabled = false,
  tokenField,
  amountField,
  rightIcon,
  label,
  amountReadOnly = false,
}: Props) => {
  const tokenProps = useSwapFormField(tokenField);
  const amountProps = useSwapFormField(amountField);

  const handleAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    amountProps.setValue(event.target.value as string);
  };

  const handleTokenChange = (symbol: string) => {
    tokenProps.setValue(symbol);
    tokenProps.setTouched(true);
  };

  const message = amountProps.error ?? tokenProps.error;
  const showMessage =
    (amountProps.touched || tokenProps.touched) && typeof message === "string" && message.length > 0;

  const tokenSymbol = typeof tokenProps.value === "string" ? tokenProps.value : "";
  const amountString = typeof amountProps.value === "string" ? amountProps.value : "";

  const optionMap = symbols.map((symbol) => ({ value: symbol, label: symbol }));

  return (
    <div className="grid gap-2">
      <label
        className="mb-0.5 block text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400"
        htmlFor={`${id}-dropdown`}
      >
        {label}
      </label>
      <div className="flex items-stretch gap-3 max-[500px]:flex-col">
        <SearchableDropdown
          className="w-1/2 max-[500px]:w-full"
          id={`${id}-dropdown`}
          ariaLabel={ariaLabel}
          value={tokenSymbol}
          options={optionMap}
          disabled={disabled}
          onChange={handleTokenChange}
          leftIcon={<TokenIcon symbol={tokenSymbol} />}
          rightIcon={rightIcon ?? <span className="text-indigo-500">▾</span>}
          noResultsText="No tokens found"
        />
        <Input
          variant="field"
          className="w-1/2 max-[500px]:w-full"
          id={`${id}-amount`}
          name={`${id}-amount`}
          type={amountReadOnly ? "text" : "number"}
          inputMode="decimal"
          min="0"
          step="any"
          placeholder="0.00"
          autoComplete="off"
          value={amountString}
          onChange={handleAmountChange}
          disabled={disabled}
          readOnly={amountReadOnly}
          onBlur={amountProps.onBlur}
        />
      </div>
      {showMessage ? (
        <p className="m-0 min-h-4 text-[0.82rem] font-medium text-red-600 dark:text-red-400" role="alert">
          {message}
        </p>
      ) : null}
    </div>
  );
};

export default TokenSelectField;
