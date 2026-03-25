import type { IToken } from "@/types"
import { calculateToken, sleep } from "@/utils"

class ExchangeService {
  async exchange(fromToken: IToken, toToken: IToken, amount: number) {
    console.log(`[INFO] Start exchange ${amount} ${fromToken.currency} to ${toToken.currency}`)
    await sleep(1_000)
    console.log(`[INFO] End exchange ${amount} ${fromToken.currency} to ${toToken.currency}`)

    return calculateToken(amount, fromToken, toToken)
  }
}

export const exchangeService = new ExchangeService()