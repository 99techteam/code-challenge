import { useSwapHistory } from "@/store/useSwapHistory";

interface HistoryModalProps {
  open: boolean;
  onClose: () => void;
}

export default function HistoryModal({ open, onClose }: HistoryModalProps) {
  const transactions = useSwapHistory((state) => state.transactions);

  if (!open) return null;

  return (
    <div
      id="history"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      aria-modal="true"
      role="dialog"
    >
      <div className="w-full max-w-md mx-4 bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">Swap History</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-sm"
          >
            Close
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {transactions.length === 0 ? (
            <div className="px-4 py-6 text-sm text-slate-500 text-center">
              No transactions yet. Submit a swap to see it here.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm">
              {transactions.map((tx) => (
                <li key={tx.id} className="px-4 py-3 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-900">
                      {tx.fromAmount} {tx.fromCurrency} → {tx.toAmount}{" "}
                      {tx.toCurrency}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(tx.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>
                      Pair: {tx.fromCurrency}/{tx.toCurrency}
                    </span>
                    <span>
                      Notional: {tx.fromAmount} → {tx.toAmount}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
