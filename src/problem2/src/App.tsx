import { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import type { Token, SwapFormData, TokenBalance } from './types';
import {
  fetchTokenPrices,
  calculateExchangeRate,
  convertAmount,
  formatNumber
} from './services/tokenService';
import { getTokenBalance } from './services/walletService';
import { CurrencyInput } from './components/CurrencyInput';
import { CurrencySelector } from './components/CurrencySelector';
import { ConfirmationModal } from './components/ConfirmationModal';
import { ExchangeRate } from './components/ExchangeRate';
import { Button } from './components/Button';

const mockBalances: TokenBalance[] = [
  { symbol: 'USD', balance: 1000 },
  { symbol: 'ATOM', balance: 566.6 },
];

const defaultValues: SwapFormData = {
  fromToken: 'USD',
  toToken: 'ETH',
  fromAmount: '',
};

function App() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [wallet, setWallet] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const [toAmount, setToAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Ref for amount input to enable auto-focus
  const amountInputRef = useRef<HTMLInputElement>(null);

  // React Hook Form setup with Controller and validation rules
  const {
    control,
    watch,
    setValue,
    handleSubmit: createSubmitHandler,
    clearErrors,
    trigger,
    formState: { errors },
  } = useForm<SwapFormData>({
    mode: 'onChange',
    defaultValues,
  });

  const fromTokenSymbol = watch('fromToken');
  const toTokenSymbol = watch('toToken');
  const fromAmount = watch('fromAmount');

  // Get actual token objects from symbols
  const fromToken = tokens.find(t => t.symbol === fromTokenSymbol) || null;
  const toToken = tokens.find(t => t.symbol === toTokenSymbol) || null;

  const isDisabled = Boolean(errors.fromAmount || !fromToken || !toToken || !fromAmount);

  const loadTokens = async () => {
    try {
      setLoading(true);
      const fetchedTokens = await fetchTokenPrices();
      setTokens(fetchedTokens);
      setWallet(mockBalances);
    } catch (err) {
      setError('Failed to load token prices. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTokens();
  }, []);

  // Calculate toAmount when fromAmount or tokens change
  useEffect(() => {
    if (fromToken && toToken && fromAmount) {
      const amount = parseFloat(fromAmount);

      if (!isNaN(amount) && amount > 0) {
        const converted = convertAmount(amount, fromToken, toToken);
        setToAmount(formatNumber(converted));
      } else {
        setToAmount('');
      }
    } else {
      setToAmount('');
    }
  }, [fromAmount, fromToken, toToken]);

  const handleSwap = () => {
    setValue('fromToken', toTokenSymbol);
    setValue('toToken', fromTokenSymbol);
    setValue('fromAmount', toAmount);
  };

  const handleMaxClick = () => {
    if (fromToken) {
      const balance = getTokenBalance(wallet, fromToken.symbol);
      setValue('fromAmount', balance.toString());
      clearErrors('fromAmount');
    }
  };

  const onSubmit = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmSwap = async () => {
    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSubmitSuccess(true);
      setShowConfirmModal(false);

      // Reset form after success
      setTimeout(() => {
        setValue('fromAmount', '');
        setToAmount('');
        setSubmitSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    if (!isSubmitting) {
      setShowConfirmModal(false);
    }
  };

  const exchangeRate = fromToken && toToken
    ? calculateExchangeRate(fromToken, toToken)
    : 0;

  if (loading) {
    return (
      <LoadingToken />
    );
  }

  if (error) {
    return <LoadingError error={error} />
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 animate-fade-in">
      <div className="w-full max-w-lg bg-slate-800 border border-slate-600 rounded-xl p-8 shadow-2xl">
        <h1 className="text-3xl font-bold text-slate-100 text-center mb-2">
          Currency Swap
        </h1>
        <p className="text-sm text-slate-400 text-center mb-12">
          Exchange your crypto assets instantly
        </p>

        <form onSubmit={createSubmitHandler(onSubmit)}>
          <div className="mb-6">
            <Controller
              name="fromToken"
              control={control}
              rules={{
                required: 'Please select a token to swap from',
              }}
              render={({ field, fieldState }) => (
                <CurrencySelector
                  label="From"
                  tokens={tokens}
                  selectedToken={fromToken}
                  onSelect={(token) => {
                    field.onChange(token?.symbol || '');
                    setTimeout(() => {
                      amountInputRef.current?.focus();
                    }, 100);

                    trigger();
                  }}
                  error={fieldState.error?.message}
                />
              )}
            />

            <div className="mt-4">
              <Controller
                name="fromAmount"
                control={control}
                rules={{
                  required: 'Please enter an amount',
                  validate: {
                    sufficientBalance: (value) => {
                      if (!fromToken) return true;

                      const amount = parseFloat(value);

                      if (isNaN(amount)) return true;
                      const balance = getTokenBalance(wallet, fromToken.symbol);

                      if (balance === 0 || amount > balance) {
                        return `Insufficient balance. You have ${balance.toLocaleString()} ${fromToken.symbol}`;
                      }

                      return true;
                    },
                  },
                }}
                render={({ field, fieldState }) => (
                  <CurrencyInput
                    ref={amountInputRef}
                    label="Amount"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="0.00"
                    balance={fromToken ? getTokenBalance(wallet, fromToken.symbol) : undefined}
                    tokenSymbol={fromToken?.symbol}
                    onMaxClick={handleMaxClick}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <button
              type="button"
              onClick={handleSwap}
              className="w-12 h-12 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center transition-colors duration-200"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M10.4 20.009c0 .89-1.075 1.337-1.706.709l-4.829-4.81a.9.9 0 011.27-1.276L8.6 18.083V3.75a.9.9 0 011.8 0v16.259zM13.6 3.991c0-.89 1.075-1.337 1.706-.709l4.829 4.81a.9.9 0 01-1.27 1.276L15.4 5.917V20.25a.9.9 0 01-1.8 0V3.991z" fill="currentColor"></path>
              </svg>
            </button>
          </div>

          <div className="mb-6">
            <Controller
              name="toToken"
              control={control}
              rules={{
                required: 'Please select a token to swap to',
                validate: {
                  notSame: (value) => {
                    if (value && fromTokenSymbol && value === fromTokenSymbol) {
                      return 'Cannot swap to the same token';
                    }
                    return true;
                  },
                },
              }}
              render={({ field, fieldState }) => (
                <CurrencySelector
                  label="To"
                  tokens={tokens}
                  selectedToken={toToken}
                  onSelect={(token) => field.onChange(token?.symbol || '')}
                  error={fieldState.error?.message}
                />
              )}
            />

            <div className="mt-4">
              <CurrencyInput
                label="You receive"
                value={toAmount}
                onChange={() => { }}
                disabled={true}
                placeholder="0.00"
              />
            </div>
          </div>

          {fromToken && toToken && fromAmount && (
            <div className="mb-6">
              <ExchangeRate fromToken={fromToken} toToken={toToken} exchangeRate={exchangeRate} />
            </div>
          )}

          {submitSuccess && (
            <div className="mb-6 p-4 bg-green-500/10 text-green-500 rounded-lg text-center font-medium animate-fade-in">
              ✓ Swap completed successfully!
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isSubmitting}
            disabled={isDisabled || submitSuccess}
            className="w-full mt-8 font-semibold"
          >
            Preview
          </Button>
        </form>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmSwap}
        fromToken={fromToken}
        toToken={toToken}
        fromAmount={fromAmount}
        toAmount={toAmount}
        exchangeRate={exchangeRate}
        isSubmitting={isSubmitting}
        fromBalance={fromToken ? getTokenBalance(wallet, fromToken.symbol) : 0}
      />
    </div>
  );
}

export default App;

const LoadingToken = () => <div className="min-h-screen flex items-center justify-center">
  <div className="text-center">
    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin-custom mx-auto mb-4"></div>
    <p className="text-slate-400 text-lg">Loading tokens...</p>
  </div>
</div>

const LoadingError = ({ error = 'Something went wrong!' }: { error?: string }) => <div className="min-h-screen flex items-center justify-center p-6">
  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 max-w-md">
    <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
    <p className="text-red-300">{error}</p>
  </div>
</div>
