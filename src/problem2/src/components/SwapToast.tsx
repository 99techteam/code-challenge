import { formatAmount } from '../lib/tokens';
import { TokenIcon } from './TokenIcon';

/** Details of a completed swap, captured at submit time for the receipt. */
export interface SwapReceipt {
  fromSymbol: string;
  toSymbol: string;
  fromAmount: number;
  toAmount: number;
  fromIcon: string;
  toIcon: string;
}

interface Props {
  receipt: SwapReceipt;
  onClose: () => void;
}

/**
 * Success toast shown after a swap completes. Slides in, auto-dismisses via the
 * depleting progress bar (timer owned by the parent), and can be closed manually.
 */
export function SwapToast({ receipt, onClose }: Props) {
  return (
    <div className="toast" role="status" aria-live="polite">
      <span className="toast__check" aria-hidden>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none"
          stroke="currentColor" strokeWidth="3" strokeLinecap="round"
          strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>

      <div className="toast__body">
        <p className="toast__title">Swap complete</p>
        <div className="toast__detail">
          <TokenIcon symbol={receipt.fromSymbol} src={receipt.fromIcon} size={18} />
          <span>
            {formatAmount(receipt.fromAmount)} {receipt.fromSymbol}
          </span>
          <span className="toast__arrow" aria-hidden>
            →
          </span>
          <TokenIcon symbol={receipt.toSymbol} src={receipt.toIcon} size={18} />
          <span>
            {formatAmount(receipt.toAmount)} {receipt.toSymbol}
          </span>
        </div>
      </div>

      <button className="toast__close" onClick={onClose} aria-label="Dismiss">
        ✕
      </button>

      <span className="toast__progress" aria-hidden />
    </div>
  );
}
