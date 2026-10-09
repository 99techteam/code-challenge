import { useEffect, useState } from 'react'
import balanceUrl from '../../files/balance.txt?url'

export function useBalance(currency) {
  const [balances, setBalances] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    fetch(balanceUrl, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load balances: ${response.status}`)
        }

        return response.json()
      })
      .then((data) => {
        setBalances(data.balances)
        setError(null)
      })
      .catch((requestError) => {
        if (!controller.signal.aborted) {
          setError(requestError)
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [currency])

  const currencyKey = typeof currency === 'string' ? currency.toLowerCase() : ''
  const balanceEntry = Object.entries(balances ?? {}).find(
    ([symbol]) => symbol.toLowerCase() === currencyKey,
  )

  return { balance: balanceEntry?.[1] ?? 0, loading, error }
}

export default useBalance
