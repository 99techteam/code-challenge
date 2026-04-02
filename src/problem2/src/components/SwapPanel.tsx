import TokenSelect from "./TokenSelect";
import type { TokenOption } from "@types";

type SwapPanelProps = {
  title: string;
  usdHint: string;
  helperText?: string;
  errorText?: string;
  inputValue: string;
  inputPlaceholder?: string;
  readOnly?: boolean;
  onInputChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onInputBlur?: () => void;
  tokens: TokenOption[];
  selectedToken: string;
  onTokenChange: (value: string) => void;
  hasError?: boolean;
};

export default function SwapPanel({
  title,
  usdHint,
  helperText,
  errorText,
  inputValue,
  inputPlaceholder = "0.00",
  readOnly = false,
  onInputChange,
  onInputBlur,
  tokens,
  selectedToken,
  onTokenChange,
  hasError = false,
}: SwapPanelProps) {
  return (
    <div className="panel">
      <div className="panel-top">
        <span>{title}</span>
        <span className="usd-hint">{usdHint}</span>
      </div>

      <div className="panel-main">
        <div className="amount-input-wrap">
          <input
            type="text"
            inputMode="decimal"
            value={inputValue}
            placeholder={inputPlaceholder}
            onChange={onInputChange}
            onBlur={onInputBlur}
            readOnly={readOnly}
            className={`amount-input ${readOnly ? "readonly" : ""} ${
              hasError ? "input-error" : ""
            }`}
            title={inputValue}
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <TokenSelect
          tokens={tokens}
          value={selectedToken}
          onChange={onTokenChange}
        />
      </div>

      {errorText ? (
        <p className="error-text">{errorText}</p>
      ) : (
        helperText && <p className="helper-text">{helperText}</p>
      )}
    </div>
  );
}
