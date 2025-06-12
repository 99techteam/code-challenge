import React from 'react'

interface Currency {
  code: string
  name: string
  icon: string
}

interface CurrencyCardProps {
  currency: string
  amount: string
  currencies: Currency[]
  onCurrencyChange: (value: string) => void
  onAmountChange: (value: string) => void
  testIdPrefix: string
  error?: string
}

const CurrencyCard: React.FC<CurrencyCardProps> = ({
  currency,
  amount,
  currencies,
  onCurrencyChange,
  onAmountChange,
  testIdPrefix,
  error
}) => {
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    
    const regex = /^-?\d*\.?\d*$/
    if (regex.test(value) || value === '') {
      onAmountChange(value)
    }
  }

  const handleAmountBlur = () => {
    if (amount && !isNaN(parseFloat(amount))) {
      const formatted = parseFloat(amount).toString()
      if (formatted !== amount) {
        onAmountChange(formatted)
      }
    }
  }

  return (
    <div className="w-full">
      <div className={`w-full px-6 py-4 bg-zinc-900 rounded-lg border-2 flex justify-between items-center transition-all duration-200 ${
        error 
          ? 'border-red-500 hover:border-red-400' 
          : 'border-blue-500 hover:border-blue-400'
      }`}>
        <div className="flex justify-start items-center gap-4">
          <div className="flex justify-center items-center gap-2">
            <div className="size-8 rounded-full bg-white/10 flex items-center justify-center p-1">
              <img 
                src={currencies.find(c => c.code === currency)?.icon || '/USD.svg'} 
                alt={currency}
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/USD.svg'
                }}
              />
            </div>
            <select 
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value)}
              className="bg-transparent text-cyan-50 text-3xl font-medium font-roboto border-none outline-none cursor-pointer w-28 text-left focus:text-blue-400 transition-colors"
              data-testid={`${testIdPrefix}-currency-select`}
            >
              {currencies.map(curr => (
                <option key={curr.code} value={curr.code} className="bg-zinc-800 text-cyan-50">
                  {curr.code}
                </option>
              ))}
            </select>
          </div>
          <div className="w-px h-14 bg-cyan-50 opacity-30"></div>
        </div>
        <input
          type="text"
          value={amount}
          onChange={handleAmountChange}
          onBlur={handleAmountBlur}
          className={`bg-transparent text-3xl font-medium font-roboto text-right border-none outline-none focus:transition-colors w-full min-w-32 ${
            error ? 'text-red-400 focus:text-red-300' : 'text-cyan-50 focus:text-blue-400'
          }`}
          data-testid={`${testIdPrefix}-amount-input`}
          placeholder="0"
          maxLength={15}
        />
      </div>
      {error && (
        <div className="mt-2 flex items-center gap-2 text-red-400 text-sm font-medium">
          {error}
        </div>
      )}
    </div>
  )
}

export default CurrencyCard 