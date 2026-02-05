import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import './App.css';
import { useGetTokenCurrency } from './utils/query/getCurrency';
import Input from './components/Input';
import ReUsableSelect from './components/ReUsableSelect';
import { IoSwapVerticalSharp } from 'react-icons/io5';
import Button from './components/Button';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Zod schema for form validation
const currencyFormSchema = z.object({
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((val) => !isNaN(parseFloat(val)), 'Please enter a valid number')
    .refine((val) => parseFloat(val) > 0, 'Amount must be greater than 0')
    .refine((val) => parseFloat(val) <= 1000000000, 'Amount is too large'),
  fromCurrency: z.string().min(1, 'Please select a currency'),
  toCurrency: z.string().min(1, 'Please select a currency'),
});

type CurrencyFormData = z.infer<typeof currencyFormSchema>;

function App() {
  const { data, isLoading, isError } = useGetTokenCurrency();
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const convertTimerRef = useRef<number | null>(null);

  const {
    control,
    setValue,
    formState: { errors },
  } = useForm<CurrencyFormData>({
    resolver: zodResolver(currencyFormSchema),
    mode: 'onChange',
    defaultValues: {
      amount: '1',
      fromCurrency: 'ETH',
      toCurrency: 'USDC',
    },
  });
  // Watch form values to see if error happens
  const amount = useWatch({ control, name: 'amount' });
  const fromCurrency = useWatch({ control, name: 'fromCurrency' });
  const toCurrency = useWatch({ control, name: 'toCurrency' });
  // Memoized currencies list
  const currencies = useMemo(() => {
    return data || [];
  }, [data]);
  // Get prices for selected currencies
  const fromPrice =
    currencies.find((c) => c.currency === fromCurrency)?.price || 0;
  const toPrice = currencies.find((c) => c.currency === toCurrency)?.price || 0;

  // Memoized converted amount calculation
  const convertedAmount = useMemo(() => {
    if (!fromPrice || !toPrice || !amount) return '0';
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return '0';
    return ((numAmount * fromPrice) / toPrice).toFixed(6);
  }, [amount, fromPrice, toPrice]);

  // Function to handle conversion with a delay to show loading state
  const triggerConversion = useCallback(() => {
    if (convertTimerRef.current) {
      clearTimeout(convertTimerRef.current);
    }
    setIsConverting(true);
    convertTimerRef.current = setTimeout(() => {
      setIsConverting(false);
    }, 1500);
  }, []);

  useEffect(() => {
    if (
      amount &&
      fromCurrency &&
      toCurrency &&
      fromCurrency !== toCurrency &&
      !errors.amount
    ) {
      const timer = setTimeout(() => {
        triggerConversion();
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [amount, fromCurrency, toCurrency, errors.amount, triggerConversion]);

  const handleSwapCurrencies = () => {
    const temp = fromCurrency;
    setValue('fromCurrency', toCurrency);
    setValue('toCurrency', temp);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center w-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading currencies...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-800 text-center">
            Error loading currency data. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-6 sm:py-12 px-3 sm:px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-2">
            💱 Currency Exchange
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Real-time cryptocurrency conversion
          </p>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6">
          <div className="mb-4">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              From
            </label>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="w-full sm:flex-1">
                <Controller
                  name="amount"
                  control={control}
                  render={({ field }) => (
                    <Input
                      value={field.value}
                      type="number"
                      onchange={field.onChange}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-base sm:text-lg ${
                        errors.amount ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Amount"
                    />
                  )}
                />
              </div>
              <Controller
                name="fromCurrency"
                control={control}
                render={({ field }) => (
                  <ReUsableSelect
                    currencies={currencies}
                    className="w-full"
                    fromCurrency={field.value}
                    toCurrency={toCurrency}
                    handleFromCurrencyChange={field.onChange}
                    handleToCurrencyChange={() => {}}
                  />
                )}
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-xs sm:text-sm text-red-600">
                {errors.amount.message}
              </p>
            )}
            {fromCurrency === toCurrency && fromCurrency && toCurrency && (
              <p className="mt-1 text-xs sm:text-sm text-red-600">
                Cannot convert same currency
              </p>
            )}
            {fromCurrency && (
              <p className="mt-2 text-sm text-gray-500">
                1 {fromCurrency} = ${fromPrice.toFixed(6)} USD
              </p>
            )}
          </div>

          <div className="flex justify-center my-3 sm:my-4">
            <Button
              onClick={handleSwapCurrencies}
              disabled={
                !fromCurrency || !toCurrency || fromCurrency === toCurrency
              }
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white rounded-full p-2 sm:p-3 shadow-lg transform hover:scale-110 transition-all duration-200 disabled:cursor-not-allowed disabled:hover:scale-100 text-xl sm:text-2xl"
            >
              <IoSwapVerticalSharp />
            </Button>
          </div>

          <div className="mb-4">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              To
            </label>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="w-full sm:flex-1 relative">
                <Input
                  type="text"
                  value={isConverting ? '' : convertedAmount}
                  readOnly
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg bg-gray-50 text-base sm:text-lg font-semibold text-gray-800"
                  placeholder="Converted amount"
                />
                {isConverting && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-indigo-600"></div>
                      <span className="text-xs sm:text-sm text-gray-500">
                        Converting...
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <Controller
                name="toCurrency"
                control={control}
                render={({ field }) => (
                  <ReUsableSelect
                    className="w-full"
                    currencies={currencies}
                    fromCurrency={field.value}
                    toCurrency={toCurrency}
                    handleFromCurrencyChange={field.onChange}
                    handleToCurrencyChange={() => {}}
                  />
                )}
              />
            </div>
          </div>

          {fromCurrency && toCurrency && (
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-indigo-50 rounded-lg border border-indigo-100">
              <p className="text-center text-indigo-800 font-medium text-sm sm:text-base">
                1 {fromCurrency} = {(fromPrice / toPrice).toFixed(6)}{' '}
                {toCurrency}
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
            Available Currencies
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 max-h-80 sm:max-h-96 overflow-y-auto">
            {currencies.map((token) => (
              <div
                key={token.currency}
                className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all"
              >
                <img
                  src={token.icon}
                  alt={token.currency}
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="gray"%3E%3Ccircle cx="12" cy="12" r="10"/%3E%3C/svg%3E';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate text-sm sm:text-base">
                    {token.currency}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500">
                    ${token.price.toFixed(6)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
