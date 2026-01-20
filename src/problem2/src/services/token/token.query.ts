import { useQueries } from "@tanstack/react-query"
import { useWalletStore, walletService } from "../wallet/wallet.service"
import { tokenService } from "./token.service"


export const useTokensQuery = () => {
  const { isConnected } = useWalletStore()

  const [tokenQuery, balanceQuery] = useQueries({
    queries: [
      {
        queryKey: ["tokens"],
        queryFn: tokenService.getTokens,
        staleTime: 1000 * 60 * 5 // 5 mins
      },
      {
        queryKey: ["balances"],
        queryFn: walletService.getBalances,
        enabled: isConnected
      }
    ]
  })

  // Merge Data
  const tokens = tokenQuery.data?.tokens || []
  const balances = balanceQuery.data || {}
  const isLoading = tokenQuery.isLoading || (isConnected && balanceQuery.isLoading)
  const error = tokenQuery.error || balanceQuery.error

  const data = tokens.map(token => {
    const balanceVal =
      isConnected && balances[token.symbol] ? balances[token.symbol].toString() : "-"

    return {
      ...token,
      balance: balanceVal
    }
  })

  return { data, isLoading, error }
}
