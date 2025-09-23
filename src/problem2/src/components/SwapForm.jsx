import React from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowsUpDownIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { fetchTokenPrice } from '../services/TokenService';

const TOKENS = [
  { symbol: 'ATOM', name: 'Cosmos' },
  { symbol: 'ampLUNA', name: 'Amp LUNA' },
  { symbol: 'axlUSDC', name: 'Axelar USDC' },
  { symbol: 'BLUR', name: 'Blur' },
  { symbol: 'bNEO', name: 'Neo' },
  { symbol: 'BUSD', name: 'Binance USD' },
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'EVMOS', name: 'Evmos' },
  { symbol: 'GMX', name: 'GMX' },
  { symbol: 'IBCX', name: 'IBC Index' },
  { symbol: 'IRIS', name: 'IRISnet' },
  { symbol: 'KUJI', name: 'Kujira' },
  { symbol: 'LSI', name: 'LSI Token' },
  { symbol: 'LUNA', name: 'Terra Luna' },
  { symbol: 'OKB', name: 'OKB Token' },
  { symbol: 'OKT', name: 'OKT Token' },
  { symbol: 'OSMO', name: 'Osmosis' },
  { symbol: 'RATOM', name: 'Staked ATOM' },
  { symbol: 'rSWTH', name: 'Switcheo Token' },
  { symbol: 'STATOM', name: 'Stride Staked ATOM' },
  { symbol: 'STEVMOS', name: 'Stride Staked EVMOS' },
  { symbol: 'STLUNA', name: 'Stride Staked LUNA' },
  { symbol: 'STOSMO', name: 'Stride Staked OSMO' },
  { symbol: 'STRD', name: 'Stride' },
  { symbol: 'SWTH', name: 'Switcheo' },
  { symbol: 'USC', name: 'US Circle' },
  { symbol: 'USDC', name: 'USD Coin' },
  { symbol: 'USD', name: 'US Dollar' },
  { symbol: 'WBTC', name: 'Wrapped Bitcoin' },
  { symbol: 'wstETH', name: 'Wrapped Staked ETH' },
  { symbol: 'YieldUSD', name: 'Yield USD' },
  { symbol: 'ZIL', name: 'Zilliqa' }
].sort((a, b) => a.symbol.localeCompare(b.symbol));

function SwapForm() {
  const { register, watch, setValue, handleSubmit } = useForm({
    defaultValues: {
      fromToken: 'ETH',
      toToken: 'USDC',
      amount: '1'
    }
  });

  const fromToken = watch('fromToken');
  const toToken = watch('toToken');
  const amount = watch('amount');

  const { data: exchangeAmount, isLoading } = useQuery({
    queryKey: ['tokenPrice', fromToken, toToken, amount],
    queryFn: () => fetchTokenPrice(fromToken, toToken, amount),
    enabled: Boolean(fromToken && toToken && amount && amount > 0)
  });

  const switchTokens = () => {
    setValue('fromToken', toToken);
    setValue('toToken', fromToken);
  };

  const onSubmit = (data) => {
    console.log('Swap submitted:', data);
  };

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white shadow-2xl rounded-2xl p-6 space-y-8 backdrop-blur-sm bg-white/80 border border-gray-100"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Swap Tokens
        </h2>
        <div className="text-sm text-gray-500">
          {isLoading && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-flex items-center"
            >
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Calculating...
            </motion.div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          {/* From Token Section */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-gray-50 p-4 rounded-xl border border-gray-100 transition-shadow hover:shadow-md"
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From
            </label>
            <div className="space-y-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <img
                    src={`/images/token_icons/${watch('fromToken')}.svg`}
                    alt=""
                    className="w-6 h-6 rounded-full shadow-md"
                    onError={(e) => {
                      e.target.src = '/images/token_icons/UNKNOWN.svg';
                    }}
                  />
                </div>
                <select
                  {...register('fromToken')}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 appearance-none bg-white transition-colors text-base"
                >
                  {TOKENS.map(token => (
                    <option key={token.symbol} value={token.symbol}>
                      {token.symbol} - {token.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative mt-3">
                <input
                  type="number"
                  step="any"
                  min="0"
                  {...register('amount')}
                  className="w-full pl-4 pr-20 py-3 rounded-lg border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors text-lg font-medium"
                  placeholder="0.0"
                />
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <span className="text-base font-medium text-gray-600 bg-transparent pl-2 border-l-2 border-gray-100">
                    {watch('fromToken')}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Switch Tokens Button */}
          <div className="flex justify-center -my-2">
            <motion.button
              type="button"
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={switchTokens}
              className="bg-gray-100 p-2 rounded-full shadow-md hover:shadow-lg transition-shadow"
            >
              <ArrowsUpDownIcon className="w-5 h-5 text-gray-600" />
            </motion.button>
          </div>

          {/* To Token Section */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-gray-50 p-4 rounded-xl border border-gray-100 transition-shadow hover:shadow-md"
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <img
                  src={`/images/token_icons/${watch('toToken')}.svg`}
                  alt=""
                  className="w-6 h-6 rounded-full shadow-md"
                  onError={(e) => {
                    e.target.src = '/images/token_icons/UNKNOWN.svg';
                  }}
                />
              </div>
              <div className="flex gap-2">
                <select
                  {...register('toToken')}
                  className="w-full pl-12 pr-10 py-3 rounded-lg border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 appearance-none bg-white transition-colors text-base"
                  style={{
                    backgroundPosition: "right 0.5rem center"
                  }}
                >
                  {TOKENS.map(token => (
                    <option key={token.symbol} value={token.symbol}>
                      {token.symbol} - {token.name}
                    </option>
                  ))}
                </select>
                {exchangeAmount !== undefined && !isLoading && (
                  <div className="flex-shrink-0 flex items-center justify-end min-w-[120px] px-3 text-base font-medium text-gray-600 border-l border-gray-100">
                    ≈ {exchangeAmount.toFixed(4)}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Exchange Rate Display */}
          <AnimatePresence>
            {exchangeAmount !== undefined && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100"
              >
                <div className="text-sm text-indigo-800 flex items-center justify-between">
                  <span>You will receive</span>
                  <span className="font-semibold text-base">
                    {exchangeAmount.toFixed(6)} {toToken}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-50 font-medium text-lg"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="mr-2"
              >
                <ArrowPathIcon className="w-5 h-5" />
              </motion.span>
              Calculating...
            </span>
          ) : (
            'Swap Tokens'
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}

export default SwapForm;
