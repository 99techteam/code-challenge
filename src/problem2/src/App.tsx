import CurrencySwapForm from './components/CurrencySwapForm'
import { useTokenPrices } from './hooks/useTokenPrices'

function App() {
  const { prices, loading: pricesLoading, error: pricesError } = useTokenPrices()

  if (pricesError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 text-red-600 p-6 rounded-lg text-center max-w-md">
          <p>Failed to load token prices. Please refresh the page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-8 shadow-lg">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6 sm:mb-8 text-center">
          Currency Swap
        </h1>
        <CurrencySwapForm prices={prices} pricesLoading={pricesLoading} />
      </div>
    </div>
  )
}

export default App

