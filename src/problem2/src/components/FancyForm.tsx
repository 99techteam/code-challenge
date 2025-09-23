import React, { useState } from 'react'
import { useAppSelector } from '../store/reducers/store'
import InputCurrency from './InputCurrency'

const FancyForm: React.FC = () => {
  const currencies = useAppSelector((state) => state.data.contents)
  const initFrom = { ...currencies.find((c) => c.currency === 'USD'), value: 1 }
  const firstToValue = currencies.find((c) => c.currency === 'ETH')
  const initTo = { ...firstToValue, value: Number(initFrom.value / firstToValue.price).toFixed(6) }
  const [fromValue, setFromValue] = useState(initFrom)
  const [toValue, setToValue] = useState(initTo)
  const [swapping, setSwapping] = useState(false)

  // Handler for changing the "from" input
  const handleFromChange = (newFrom: typeof fromValue) => {
    if (newFrom.currency != fromValue.currency || newFrom.value != fromValue.value) {
      setFromValue(newFrom)

      setToValue({
        ...toValue,
        value: Number((newFrom.value * (newFrom.price / toValue.price)).toFixed(6))
      })
    }
  }

  // Handler for changing the "to" input
  const handleToChange = (newTo: typeof toValue) => {
    if (newTo.currency != toValue.currency) {
      setToValue({
        ...newTo,
        value: Number((fromValue.value * (fromValue.price / newTo.price)).toFixed(6))
      })
    }

    if (newTo.value != toValue.value) {
      setToValue(newTo)
      setFromValue({
        ...fromValue,
        value: Number((newTo.value * (newTo.price / fromValue.price)).toFixed(6))
      })
    }
  }

  const handleSwap = () => {
    setSwapping(true)
    setTimeout(() => {
      setFromValue(toValue)
      setToValue(fromValue)
      setSwapping(false)
    }, 350)
  }

  return (
    <div className="flex items-center justify-center">
      <div className="bg-gray-800 rounded-3xl shadow-2xl p-8 w-full max-w-md mx-auto border border-blue-100 relative">
        <h2 className="text-white text-3xl font-extrabold mb-8 text-center tracking-tight mt-8">Crypto Exchange</h2>
        <div className="flex flex-col gap-8">
          {/* From */}
          <div className="rounded-xl px-4 py-5 shadow flex items-center">
            <InputCurrency selected={fromValue} onChange={handleFromChange} currencies={currencies} label="From" />
          </div>
          {/* Swap Button */}
          <div className="flex justify-center relative">
            <button
              type="button"
              className={`transition-transform duration-300 bg-gradient-to-br from-pink-400 to-blue-400 hover:from-blue-400 hover:to-pink-400 text-white rounded-full p-4 shadow-lg border-4 border-white focus:outline-none focus:ring-4 focus:ring-pink-200 active:scale-95 ${
                swapping ? 'animate-spin' : ''
              }`}
              aria-label="Swap"
              onClick={handleSwap}
              disabled={swapping}
              style={{ zIndex: 2 }}
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 17l-4 4m0 0l-4-4m4 4V3" />
              </svg>
            </button>
          </div>
          {/* To */}
          <div className="rounded-xl px-4 py-5 shadow flex items-center">
            <InputCurrency selected={toValue} onChange={handleToChange} currencies={currencies} label="To" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default FancyForm
