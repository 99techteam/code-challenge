import {
  type TokenSchemaType,
  tokenSchema,
} from '@/common/schemas/token.schema';
import { useBalanceStore } from '@/store/balance.store';
import { useTokenStore } from '@/store/token.store';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowDown, CheckCircle, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { InputCurrency } from './InputCurrency';

/* ── Main component ─────────────────────────────────────────── */
export function SwapCard() {
  const [isSwapping, setIsSwapping] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm({
    defaultValues: {
      payAmount: 0,
    },
    resolver: zodResolver(tokenSchema),
  });

  const payAmount = form.watch('payAmount');

  const {
    fetchTokens,
    loading: tokenLoading,
    payToken,
    recvToken,
    setPayToken,
    setRecvToken,
  } = useTokenStore();

  const {
    fetchBalances,
    loading: balanceLoading,
    getBalanceByCurrency,
    updateBalances,
  } = useBalanceStore();

  useEffect(() => {
    fetchTokens();
    fetchBalances();
  }, []);

  const exchangeRate = useMemo(() => {
    if (!payToken?.price || !recvToken?.price) return 0;
    return payToken.price / recvToken.price;
  }, [payToken, recvToken]);

  const receiveAmount = useMemo(() => {
    const n = payAmount;
    if (isNaN(n) || n <= 0) return '0.00';
    return (n * exchangeRate).toFixed(6);
  }, [payAmount, exchangeRate]);

  const handleSwapDirection = () => {
    const temp = payToken;
    setPayToken(recvToken);
    setRecvToken(temp);
    form.setValue('payAmount', Number(receiveAmount));
  };

  const handleSwapAction = async (value: TokenSchemaType) => {
    if (isSwapping || isSuccess) return;

    const payTokenBalance = getBalanceByCurrency(payToken.currency);
    const recvTokenBalance = getBalanceByCurrency(recvToken.currency);

    if (value.payAmount > payTokenBalance.amount) {
      form.setError('payAmount', {
        message: 'Insufficient balance',
      });
      return;
    }
    setIsSwapping(true);
    // Simulate blockchain delay
    await new Promise((r) => setTimeout(r, 2000));

    updateBalances(payTokenBalance.amount - value.payAmount, payToken.currency);
    updateBalances(
      recvTokenBalance.amount + Number(receiveAmount),
      recvToken.currency
    );

    setIsSwapping(false);
    setIsSuccess(true);

    setTimeout(() => {
      form.reset({
        payAmount: 0,
      });
      setIsSuccess(false);
    }, 3000);
  };

  return (
    <div className="animate-fade-in-up mx-auto w-full max-w-xl">
      <div className="glass-card group relative space-y-6 overflow-hidden rounded-[32px] p-8 shadow-2xl">
        {/* Animated glow on card border */}
        <div className="from-primary/10 to-secondary/10 pointer-events-none absolute inset-0 bg-linear-to-br via-transparent opacity-70" />

        {/* Card header */}
        <div className="relative z-10 mb-8 flex items-center justify-between">
          <h1 className="font-display text-headline-lg text-on-surface font-bold tracking-tight">
            Token Swapper
          </h1>
        </div>
        <FormProvider {...form}>
          <InputCurrency
            name="payAmount"
            disabled={false}
            label="You Pay"
            token={payToken}
            setToken={setPayToken}
          />

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative z-20 mt-10 flex items-center justify-center">
                <Button
                  size={'lg'}
                  disabled={tokenLoading || balanceLoading}
                  onClick={handleSwapDirection}
                  className="size-12 bg-surface-container-highest text-primary hover:text-primary group/arrow absolute cursor-pointer rounded-xl p-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-all duration-500 hover:scale-110 active:scale-90"
                >
                  {tokenLoading || balanceLoading ? (
                    <Loader2 className="animate-spin size-6" />
                  ) : (
                    <ArrowDown className="block font-bold transition-transform duration-500 group-hover/arrow:rotate-180 size-6 group-hover/arrow:text-accent" />
                  )}
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent
              className="flex items-center  px-4 py-2 rounded-full "
              side="top"
              sideOffset={20}
            >
              <div>Swap Direction</div>
            </TooltipContent>
          </Tooltip>

          <InputCurrency
            value={receiveAmount}
            disabled
            name=""
            label="You Receive"
            setToken={setRecvToken}
            token={recvToken}
            className="text-secondary-container"
          />

          <div className="mt-3 flex items-center justify-between">
            <p className="text-lg">Exchange Rate</p>
            <p className="text-lg flex gap-2">
              1 <img src={payToken?.symbol} alt="" /> ={' '}
              {exchangeRate.toFixed(6)} <img src={recvToken?.symbol} alt="" />
            </p>
          </div>

          <div className="my-6 flex items-center justify-between">
            <p className="text-lg">Slippage Tolerance</p>
            <p className="text-lg flex items-center gap-2">0.5%</p>
          </div>

          <div className="my-6 h-px w-full bg-linear-to-r from-transparent via-white/10 to-transparent" />

          <Button
            disabled={isSwapping || !payAmount}
            onClick={form.handleSubmit(handleSwapAction)}
            className={[
              'font-display h-20 text-3xl text-headline-md relative w-full cursor-pointer overflow-hidden rounded-2xl border-none py-5 font-bold text-white transition-all duration-300',
              isSuccess
                ? 'bg-green-500 shadow-[0_0_40px_rgba(34,197,94,0.4)]'
                : 'accent-gradient shadow-[0_8px_32px_oklch(0.62_0.172_300/0.30)] hover:-translate-y-0.5 hover:shadow-[0_12px_48px_oklch(0.62_0.172_300/0.40)] active:translate-y-0 active:scale-95',
              'disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50',
            ].join(' ')}
          >
            <div className="relative z-10 flex items-center justify-center gap-3">
              {isSwapping ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin size-6" />
                  Processing...
                </div>
              ) : isSuccess ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="animate-scale-in size-6" />
                  Swap Confirmed
                </div>
              ) : (
                'Swap Assets'
              )}
            </div>
            {!isSwapping && !isSuccess && (
              <div className="absolute inset-0 -translate-x-full from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_2s_infinite]" />
            )}
          </Button>
        </FormProvider>
      </div>
    </div>
  );
}
