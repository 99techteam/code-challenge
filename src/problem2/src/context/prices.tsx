import { useQuery } from '@tanstack/react-query'
import { createContext, type ReactNode } from 'react'
import type { Prices } from '@/types'
import { getPrices } from '@/services/data'

export const REFRESH_TIME = 1000

interface ContextStateType {
  data: Prices | null
  isLoading: boolean
}

interface ContextActionType {
  refetch: () => void
}

interface ProdiverProps {
  children: ReactNode
}

const StateContext = createContext<ContextStateType | undefined>({
  data: null,
  isLoading: true,
})
const ActionContext = createContext<ContextActionType | undefined>(undefined)

const PricesProvider = ({ children }: ProdiverProps) => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['prices'],
    queryFn: getPrices,
    refetchInterval: REFRESH_TIME,
  })

  return (
    <StateContext.Provider value={{ data: data || null, isLoading }}>
      <ActionContext.Provider value={{ refetch }}>{children}</ActionContext.Provider>
    </StateContext.Provider>
  )
}

export { StateContext, ActionContext, PricesProvider }
