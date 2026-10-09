import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import Search from './Search.jsx'
import ErrorNotification from './ErrorNotification.jsx'
import SuccessNotification from './SuccessNotification.jsx'
import currencies from './tokens.js'
import useBalance from '../hooks/useBalance.js'
import useSwapRates from '../hooks/useSwapRates.js'
import getSwapRate from '../utils/index.js'

function Icon({ name, className = 'size-5' }) {
  const paths = {
    arrowDown: <path d="m7 10 5 5 5-5" />,
    arrowRight: <path d="M5 12h14m-7-7 7 7-7 7" />,
  }

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      {paths[name]}
    </svg>
  )
}

function CurrencyBadge({ currency }) {
  return (
    <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-white/[0.06]">
      <img alt="" className="size-full rounded-full object-contain" src={currency.icon} />
    </span>
  )
}

function CurrencySelect({ value, onClick, label }) {
  const currency = currencies.find(
    (item) => item.symbol.toLowerCase() === value.toLowerCase(),
  )

  return (
    <button
      aria-label={label}
      className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/[0.08] bg-[#171a25] px-2.5 py-2 text-left transition hover:border-white/20 sm:gap-2.5 sm:px-3"
      onClick={onClick}
      style={{ width: 160, minWidth: 160, maxWidth: 160, flex: '0 0 160px' }}
      type="button"
    >
      <CurrencyBadge currency={currency} />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold leading-5 text-white">{currency.symbol}</span>
        <span className="block truncate text-[10px] leading-4 text-slate-500 sm:text-[11px]">{currency.name}</span>
      </span>
      <Icon name="arrowDown" className="size-4 shrink-0 text-slate-500" />
    </button>
  )
}

function findCurrency(symbol) {
  return currencies.find(
    (currency) => currency.symbol.toLowerCase() === symbol.toLowerCase(),
  )
}

function SwapForm() {
  const isLogin = useSelector((state) => state.isLogin)
  const [from, setFrom] = useState('ETH')
  const [to, setTo] = useState('USDC')
  const [amount, setAmount] = useState(0)
  const [searchTarget, setSearchTarget] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [dismissedQueryError, setDismissedQueryError] = useState(null)
  const { swapRates, error} = useSwapRates()
  const notificationMessage = error && error !== dismissedQueryError
    ? error.message
    : errorMessage
  
 
  const balance = useBalance(from).balance
  const quote = useMemo(() => {
    const fromCurrency = findCurrency(from)
    const toCurrency = findCurrency(to)
    const numericAmount = Number(amount)
    const rate = getSwapRate(from, to, swapRates)

    if (
      !fromCurrency
      || !toCurrency
      || rate === 'N/A'
      || !Number.isFinite(numericAmount)
    ) {
      return { result: 'N/A', rate: 'N/A' }
    }
    const result = rate * numericAmount
    const precision = result >= 1000 ? 2 : result >= 1 ? 4 : 6

    return {
      result: result.toLocaleString('en-US', { maximumFractionDigits: precision }),
      rate: rate.toLocaleString('en-US', { maximumFractionDigits: 4 }),
    }
  }, [amount, from, swapRates, to])

  const getUsdValue = (symbol, quantity) => {
    const tokenRate = swapRates?.find(
      (rate) => rate.currency.toLowerCase() === symbol.toLowerCase(),
    )

    return tokenRate ? quantity * tokenRate.price : 0
  }

  const setPercentage = (percentage) => {
    setAmount((balance * percentage).toString())
  }

  const handleFromChange = (value) => {
    if (value.toLowerCase() === to.toLowerCase()) setTo(from)
    setFrom(value)
  }

  const handleToChange = (value) => {
    if (value.toLowerCase() === from.toLowerCase()) setFrom(to)
    setTo(value)
  }
  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!isLogin) {
      setErrorMessage('You are not logged in. Please log in to perform a swap.')
      return
    }

    const numericAmount = Number(amount)
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setErrorMessage('Enter an amount greater than zero.')
      return
    }

    if (numericAmount > balance) {
      setErrorMessage(`Amount cannot exceed your balance of ${balance} ${from}.`)
      return
    }

    if (quote.result === 'N/A') {
      setErrorMessage('Invalid swap rate. Please check the selected currencies.')
      return
    }

    setErrorMessage(null)
    setSuccessMessage(null)
    setIsSubmitting(true)
    // mock API call to simulate swap processing
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 1000))
      setSuccessMessage('Swap completed successfully.')
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <div className="mx-auto w-full max-w-[440px]" id="swap">
      {notificationMessage && (
        <ErrorNotification
          message={notificationMessage}
          onClose={() => {
            if (error) setDismissedQueryError(error)
            setErrorMessage(null)
          }}
        />
      )}
      {successMessage && (
        <SuccessNotification
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}
      {searchTarget ? (
        <Search
          currencies={currencies}
          onClose={() => setSearchTarget(null)}
          onSelect={(symbol) => {
            if (searchTarget === 'from') handleFromChange(symbol)
            else handleToChange(symbol)
            setSearchTarget(null)
          }}
          selectedCurrency={searchTarget === 'from' ? from : to}
        />
      ) : (
      <div className="overflow-hidden rounded-[26px] border border-white/[0.09] bg-[#11131b]/95 shadow-[0_28px_100px_-35px_rgba(0,0,0,0.9)] backdrop-blur-xl">
        <div className="border-b border-white/[0.07] px-5 py-4 sm:px-6">
          <h2 className="text-base font-semibold text-white">Swap tokens</h2>
        </div>

        <form className="p-4 sm:p-5" onSubmit={handleSubmit}>
          <div className="rounded-2xl border border-white/[0.07] bg-[#0c0e15] p-4 transition focus-within:border-violet-400/30">
            <div className="mb-3 flex items-center justify-between">
              <label className="text-xs font-medium text-slate-400" htmlFor="amount">You pay</label>
              <span className="text-xs text-slate-500">Balance: <span className="text-slate-300">{balance} {from}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <input
                autoComplete="off"
                className="amount-input w-0 min-w-0 flex-1 bg-transparent text-2xl font-medium tracking-tight text-white outline-none placeholder:text-slate-600 sm:text-[28px]"
                id="amount"
                inputMode="decimal"
                onChange={(event) => {
                  const value = event.target.value
                  if (
                    /^\d*\.?\d*$/.test(value)
                    && (value === '' || Number(value) <= balance)
                  ) {
                    setAmount(value)
                  }
                }}
                onKeyDown={(event) => {
                  if (['e', 'E', '-', '+'].includes(event.key)) event.preventDefault()
                }}
                placeholder="0.00"
                type="text"
                value={amount}
              />
              <CurrencySelect label="Choose currency to pay" onClick={() => setSearchTarget('from')} value={from} />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-slate-500">≈ ${getUsdValue(from, Number(amount || 0)).toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
              <div className="flex gap-1">
                {[0.25, 0.5, 0.75, 1].map((percentage) => (
                  <button
                    className="rounded-md px-1.5 py-1 text-[10px] font-medium text-slate-500 transition hover:bg-violet-400/10 hover:text-violet-200"
                    key={percentage}
                    onClick={() => setPercentage(percentage)}
                    type="button"
                  >
                    {percentage === 1 ? 'MAX' : `${percentage * 100}%`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-[#0c0e15] p-4 transition focus-within:border-violet-400/30">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">You receive</span>
              <span className="text-xs text-slate-500">Estimated</span>
            </div>
            <div className="flex items-center gap-2">
              <span aria-live="polite" className="w-0 min-w-0 flex-1 truncate text-2xl font-medium tracking-tight text-white sm:text-[28px]">{quote.result}</span>
              <CurrencySelect label="Choose currency to receive" onClick={() => setSearchTarget('to')} value={to} />
            </div>
            <div className="mt-3 text-xs text-slate-500">
              ≈ ${getUsdValue(to, Number(quote.result.replaceAll(',', '') || 0)).toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="my-4 flex items-center justify-between rounded-xl bg-white/[0.025] px-3.5 py-3 text-xs">
            <span className="text-slate-400">Rate</span>
            <span className="text-slate-300">1 {from} = {quote.rate} {to}</span>
          </div>

          {isSubmitting ? (
            <div
              aria-live="polite"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500/20 px-4 py-3.5 text-sm font-semibold text-violet-200"
              role="status"
            >
              <svg
                aria-hidden="true"
                className="size-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" strokeLinecap="round" strokeWidth="4" />
              </svg>
              Processing swap...
            </div>
          ) : (
            <button
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/20 transition hover:from-violet-400 hover:to-indigo-400 focus:outline-none focus:ring-2 focus:ring-violet-300/60 focus:ring-offset-2 focus:ring-offset-[#11131b]"
              type="submit"
            >
              Swap
              <Icon name="arrowRight" className="size-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          )}
        </form>
      </div>
      )}
    </div>
  )
}

export default SwapForm
