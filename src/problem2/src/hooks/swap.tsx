import { useContext } from 'react'
import { ActionContext, StateContext } from '@/context/swap'

const useSwapState = () => {
  const value = useContext(StateContext)
  if (typeof value === 'undefined') {
    throw new Error('useSwapState must be used within a ContextProvider')
  }
  return value
}

const useSwapAction = () => {
  const value = useContext(ActionContext)
  if (typeof value === 'undefined') {
    throw new Error('useSwapAction must be used within a ContextProvider')
  }
  return value
}

export { useSwapState, useSwapAction }
