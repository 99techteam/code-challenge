import { useQuery } from '@tanstack/react-query'
import { createContext, useEffect, useState, type ReactNode } from 'react'
import type { Balances } from '@/types'
import { getBalances } from '@/services/data'

interface ContextStateType {
  data: Balances | null
  isLoading: boolean
}

interface ContextActionType {
  refetch: () => void
  updateBalance: (newBalances: Balances) => void
}

interface ProdiverProps {
  children: ReactNode
}

const StateContext = createContext<ContextStateType | undefined>({
  data: null,
  isLoading: true,
})
const ActionContext = createContext<ContextActionType | undefined>(undefined)

const BalancesProvider = ({ children }: ProdiverProps) => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['balances'],
    queryFn: getBalances,
  })
  const [balances, setBalances] = useState<Balances | null>(null)

  useEffect(() => {
    setBalances(data || null)
  }, [data])

  const updateBalance = (newBalances: Balances) => {
    setBalances((prev) => ({ ...prev, ...newBalances }))
  }

  return (
    <StateContext.Provider value={{ data: balances, isLoading }}>
      <ActionContext.Provider value={{ refetch, updateBalance }}>{children}</ActionContext.Provider>
    </StateContext.Provider>
  )
}

export { StateContext, ActionContext, BalancesProvider }
