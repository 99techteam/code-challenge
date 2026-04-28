import { motion, AnimatePresence } from 'framer-motion';
import type { Token } from '@/types';
import { formatAmount } from '@/utils/format';
import { useState } from 'react';
import { Repeat, ChevronDown } from 'lucide-react';

interface SwapDetailsProps {
  sellToken: Token | null;
  buyToken: Token | null;
  exchangeRate: number | null;
  priceImpact: number;
}

export function SwapDetails({ sellToken, buyToken, exchangeRate, priceImpact }: SwapDetailsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isReversed, setIsReversed] = useState(false);

  if (!sellToken || !buyToken || exchangeRate === null) return null;

  const displayRate = isReversed ? 1 / exchangeRate : exchangeRate;
  const fromToken = isReversed ? buyToken : sellToken;
  const toToken = isReversed ? sellToken : buyToken;

  return (
    <div className="mt-1">
      {/* Rate toggle row */}
      <button
        id="swap-details-toggle"
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5"
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsReversed((prev) => !prev);
          }}
          className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <span>
            1 {fromToken.currency} = {formatAmount(displayRate)} {toToken.currency}
          </span>
          <Repeat className="h-3.5 w-3.5" />
        </button>

        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </button>

      {/* Expandable details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 px-3 pb-2 pt-1 text-sm">
              <DetailRow
                label="Price Impact"
                value={`~${priceImpact.toFixed(2)}%`}
                valueColor={
                  priceImpact > 5
                    ? 'text-red-500'
                    : priceImpact > 3
                      ? 'text-amber-500'
                      : 'text-emerald-500'
                }
              />
              <DetailRow label="Max. slippage" value="0.5%" />
              <DetailRow label="Network fee" value="~$0.50" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailRow({
  label,
  value,
  valueColor = 'text-slate-700 dark:text-slate-200',
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className={valueColor}>{value}</span>
    </div>
  );
}
