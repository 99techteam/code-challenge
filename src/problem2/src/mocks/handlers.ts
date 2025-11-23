import { http, HttpResponse } from 'msw'
import { computeMinReceived, convertToken } from '../utils/formatters/converter'
import { sleep } from '../utils/promises'
import type { Token } from '../utils/types'

type SwapRequest = {
  fromToken: Token
  toToken: Token
  amount: number
  slippage: number // 1 = 1%
}

export const handlers = [
  // Swap POST
  http.post('/api/swap', async ({ request }) => {
    const { fromToken, toToken, amount, slippage } = (await request.json()) as SwapRequest

    if (!fromToken || !toToken || amount <= 0) {
      return HttpResponse.json({ error: 'Invalid swap parameters' }, { status: 400 })
    }

    const idealOutput =
      fromToken.value === toToken.value ? amount : convertToken(amount, fromToken, toToken)

    const slippageDecimal = slippage / 100
    const randomFactor = 1 - Math.random() * slippageDecimal
    const receivedAmount = idealOutput * randomFactor

    const minReceived = computeMinReceived(receivedAmount, slippage)
    const rate = fromToken.price / toToken.price
    const usdFrom = amount * fromToken.price
    const usdTo = receivedAmount * toToken.price
    const priceImpact = idealOutput > 0 ? ((idealOutput - receivedAmount) / idealOutput) * 100 : 0

    // Simulate latency
    await sleep(500 + Math.random() * 500)

    return HttpResponse.json(
      {
        fromAmount: amount,
        toAmount: receivedAmount,
        minReceived,
        priceImpact,
        usdFrom,
        usdTo,
        rate
      },
      { status: 202, statusText: 'Mocked status' }
    )
  })
]
