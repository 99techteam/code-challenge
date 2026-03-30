import { useState } from 'react';
import type { Token, ModalTarget } from '../types';
import type { useSwapForm } from '../hooks/useSwapForm';
import TokenInput from './TokenInput';
import TokenSelectorModal from './TokenSelectorModal';
import SwapDirectionButton from './SwapDirectionButton';
import RateInfo from './RateInfo';
import ConfirmButton from './ConfirmButton';

interface SwapCardProps {
  swap: ReturnType<typeof useSwapForm>;
  tokens: Token[];
}

export default function SwapCard({ swap, tokens }: SwapCardProps) {
  const [openModal, setOpenModal] = useState<ModalTarget | null>(null);

  const showErrors = swap.isDirty && !swap.submitSuccess;
  const fromError = showErrors
    ? swap.errors.find((e) => e.field === 'fromAmount' || e.field === 'general')
    : undefined;
  const displayErrors = showErrors ? swap.errors : [];

  return (
    <>
      <div className="w-full max-w-xl animate-[fadeIn_0.4s_ease-out]">
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xl shadow-gray-200/60 border border-gray-100">
          <h2 className="text-gray-900 text-lg font-semibold mb-4">Swap</h2>
          <TokenInput
            label="You send"
            amount={swap.form.fromAmount}
            onAmountChange={swap.updateFromAmount}
            token={swap.form.fromToken}
            onTokenSelect={() => setOpenModal('from')}
            error={fromError?.message}
          />

          <SwapDirectionButton onClick={swap.swapDirection} />

          <TokenInput
            label="You get"
            amount={swap.form.toAmount}
            onAmountChange={swap.updateToAmount}
            token={swap.form.toToken}
            onTokenSelect={() => setOpenModal('to')}
            approximate
          />

          <RateInfo
            fromToken={swap.form.fromToken}
            toToken={swap.form.toToken}
            exchangeRate={swap.exchangeRate}
            priceImpact={swap.priceImpact}
          />

          <div className="mt-4">
            <ConfirmButton
              onClick={swap.submitSwap}
              disabled={!swap.isValid}
              isLoading={swap.isSubmitting}
              errors={displayErrors}
              submitSuccess={swap.submitSuccess}
            />
          </div>
        </div>
      </div>

      {openModal === 'from' && (
        <TokenSelectorModal
          onClose={() => setOpenModal(null)}
          tokens={tokens}
          selectedToken={swap.form.fromToken}
          onSelect={swap.setFromToken}
        />
      )}
      {openModal === 'to' && (
        <TokenSelectorModal
          onClose={() => setOpenModal(null)}
          tokens={tokens}
          selectedToken={swap.form.toToken}
          onSelect={swap.setToToken}
        />
      )}
    </>
  );
}
