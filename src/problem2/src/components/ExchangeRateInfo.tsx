import React from 'react'

interface ExchangeRateInfoProps {
  fromCurrency: string
  toCurrency: string
  fromAmount: string
  toAmount: string
  formatNumber: (num: string) => string
  getCurrentTime: () => string
}

const ExchangeRateInfo: React.FC<ExchangeRateInfoProps> = ({
  fromCurrency,
  toCurrency,
  fromAmount,
  toAmount,
  formatNumber,
  getCurrentTime
}) => {
  return (
    <div className="w-full py-6 px-6 bg-gradient-to-r from-neutral-800 to-neutral-700 rounded-xl shadow-2xl border border-neutral-600">
      <div className="flex items-center gap-4">
        <div className="flex gap-2">
        <img 
            src="/rate.png" 
            alt="Exchange rate"
            className="w-8 h-4 object-contain"
          />
        </div>
        <div className="flex-1 text-left">
          <div className="text-2xl font-medium font-roboto">
            <span className="text-gray-300">
              {formatNumber(fromAmount)} {fromCurrency} = 
            </span>
            <span className="text-cyan-400 ml-2">
              {formatNumber(toAmount)} {toCurrency}
            </span>
          </div>
          <div className="text-gray-400 text-base font-normal font-roboto mt-2 flex items-center gap-2">
            <div className="size-2 bg-green-400 rounded-full animate-pulse"></div>
            Mid-market exchange rate at {getCurrentTime()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExchangeRateInfo 