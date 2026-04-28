import { useState, lazy, Suspense } from 'react';
import { SwapDirection } from '@/types/swap';
import { useTokenPrices } from '@/hooks/useTokenPrices';
import { useSwap } from '@/hooks/useSwap';
import { TokenInput } from './TokenInput';
import { SwapDirectionButton } from './SwapDirectionButton';
import { SwapDetails } from './SwapDetails';
import { SwapButton } from './SwapButton';

import toast from 'react-hot-toast';
import { Skeleton } from '../ui/skeleton';

const TokenSelectModal = lazy(() =>
  import('./TokenSelectModal').then((mod) => ({ default: mod.TokenSelectModal })),
);

export function SwapCard() {
  const { data: tokens, isLoading, isError, error } = useTokenPrices();
  const swap = useSwap();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDirection, setModalDirection] = useState<SwapDirection>(SwapDirection.SELL);

  const openModal = (direction: SwapDirection) => {
    setModalDirection(direction);
    setModalOpen(true);
  };

  const handleSwap = async () => {
    try {
      await swap.executeSwap();
      toast.success(
        `Swapped ${swap.sellAmount} ${swap.sellToken?.currency} for ${swap.buyAmount} ${swap.buyToken?.currency}`,
        {
          duration: 3000,
          style: {
            borderRadius: '12px',
            background: '#1e293b',
            color: '#fff',
          },
          iconTheme: {
            primary: '#22c55e',
            secondary: '#fff',
          },
        },
      );
    } catch {
      toast.error('Swap failed. Please try again.', {
        style: {
          borderRadius: '12px',
          background: '#1e293b',
          color: '#fff',
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-[480px] rounded-3xl bg-white p-5 shadow-xl dark:bg-[#131c31]">
        <Skeleton className="mb-4 h-8 w-20" />
        <Skeleton className="mb-3 h-28 w-full rounded-2xl" />
        <Skeleton className="mb-3 h-28 w-full rounded-2xl" />
        <Skeleton className="h-14 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full max-w-[480px] rounded-3xl bg-white p-6 text-center shadow-xl dark:bg-[#131c31]">
        <div className="mb-3 text-4xl">⚠️</div>
        <h3 className="mb-1 text-lg font-bold text-slate-900 dark:text-white">
          Failed to load tokens
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {error instanceof Error ? error.message : 'An unexpected error occurred.'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-[480px] rounded-[2.5rem] border border-white/80 bg-white/80 p-4 shadow-[0_16px_60px_rgba(15,23,42,0.08)] backdrop-blur-3xl dark:border-white/10 dark:bg-[#1e293b]/60 dark:shadow-[0_16px_60px_rgba(0,0,0,0.5)] sm:p-6">
        <div className="mb-3 flex items-center justify-between px-1">
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Swap Tokens</h1>
        </div>

        <TokenInput
          direction={SwapDirection.SELL}
          token={swap.sellToken}
          amount={swap.sellAmount}
          usdValue={swap.usdValueSell}
          onAmountChange={swap.setSellAmount}
          onTokenSelect={() => openModal(SwapDirection.SELL)}
        />

        <SwapDirectionButton onFlip={swap.flipTokens} />

        <TokenInput
          direction={SwapDirection.BUY}
          token={swap.buyToken}
          amount={swap.buyAmount}
          usdValue={swap.usdValueBuy}
          onAmountChange={swap.setBuyAmount}
          onTokenSelect={() => openModal(SwapDirection.BUY)}
        />

        <SwapDetails
          sellToken={swap.sellToken}
          buyToken={swap.buyToken}
          exchangeRate={swap.exchangeRate}
          priceImpact={swap.priceImpact}
        />

        {/* Swap Button */}
        <SwapButton
          label={swap.buttonLabel}
          canSwap={swap.canSwap}
          status={swap.status}
          onSwap={handleSwap}
        />
      </div>

      {/* Token Select Modal (lazy loaded) */}
      <Suspense fallback={null}>
        <TokenSelectModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSelect={(token) => {
            if (modalDirection === SwapDirection.SELL) {
              swap.setSellToken(token);
            } else {
              swap.setBuyToken(token);
            }
          }}
          tokens={tokens ?? []}
          selectedToken={
            modalDirection === SwapDirection.SELL ? swap.sellToken : swap.buyToken
          }
        />
      </Suspense>
    </>
  );
}
