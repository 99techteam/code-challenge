import { useState } from 'react'
import { toast } from "sonner"

import { TokenExchangeForm, TokenExchangeFormSkeleton } from '@/components/TokenExchange'
import { useTokens } from '@/hooks'
import { exchangeService } from '@/services/ExchangeService'
import type { IToken } from '@/types'

function App() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: tokens, isLoading: isTokenLoading } = useTokens()

  async function handleSubmit(fromToken: IToken, toToken: IToken, amount: number) {
    setIsSubmitting(true)
    try {
      await exchangeService.exchange(fromToken, toToken, amount)
      toast.success("Swap successfully!")
    } catch (error) {
      console.log("[ERROR] Failed to swap tokens", error)
      toast.error("Failed to swap tokens! Please try again later!")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='w-full h-screen flex flex-col items-center px-5 py-3'>
      <h1 className='fluid text-4xl font-bold mx-auto text-center my-8'>Currency Swap</h1>

      <div className='flex gap-4'>

      </div>
      {
        isTokenLoading ? (
          <TokenExchangeFormSkeleton />
        ) : (
          <TokenExchangeForm tokens={tokens} isSubmitting={isSubmitting} onExchange={handleSubmit} />
        )
      }
    </div>
  )
}

export default App
