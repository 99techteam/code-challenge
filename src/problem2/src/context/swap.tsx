import { LOWEST_PRIORITY } from '@/constants'
import { useBalancesAction, useBalancesState } from '@/hooks/balances'
import { usePricesState } from '@/hooks/prices'
import { getBigNumber, getPriority, sortTokens, toDecimal } from '@/utils'
import { useMutation } from '@tanstack/react-query'
import { createContext, useCallback, useMemo, useState } from 'react'
import { toast } from 'react-toastify'

interface ContextStateType {
  fromToken: string
  toToken: string
  fromAmount: string
  toAmount: string
  fromTokens: string[]
  toTokens: string[]
  isDisabledInputAmount: boolean
  isDisabledTransaction: boolean
  isSwapping: boolean
  canRevert: boolean
  beforeSwapFromAmount: string
  beforeSwapToAmount: string
  afterSwapFromAmount: string
  afterSwapToAmount: string
}

interface ContextActionType {
  changeFromToken: (token: string) => void
  changeToToken: (token: string) => void
  changeFromAmount: (amount: string) => void
  swap: () => void
  revert: () => void
  setMaxFromAmount: () => void
}

const StateContext = createContext<ContextStateType | undefined>({
  fromToken: '',
  toToken: '',
  fromAmount: '',
  toAmount: '',
  fromTokens: [],
  toTokens: [],
  isDisabledInputAmount: false,
  isDisabledTransaction: false,
  isSwapping: false,
  canRevert: false,
  beforeSwapFromAmount: '',
  beforeSwapToAmount: '',
  afterSwapFromAmount: '',
  afterSwapToAmount: '',
})
const ActionContext = createContext<ContextActionType | undefined>(undefined)

const SwapProvider = ({ children }: { children: React.ReactNode }) => {
  const [fromToken, setFromToken] = useState<string>('')
  const [toToken, setToToken] = useState<string>('')
  const [fromAmount, setFromAmount] = useState<string>('')
  const [toAmount, setToAmount] = useState<string>('')
  const { data: prices } = usePricesState()
  const { data: balances } = useBalancesState()
  const { updateBalance } = useBalancesAction()

  const fromTokens = useMemo(() => {
    const tokens = Object.keys(balances ?? {}).filter((token) => {
      if (getBigNumber(balances?.[token] ?? '0').isLessThanOrEqualTo(0)) {
        return false
      }

      if (!prices?.[token]) {
        return false
      }
      const pricePriority = getPriority(token)
      return pricePriority > LOWEST_PRIORITY
    })

    return sortTokens(tokens)
  }, [balances, prices])

  const toTokens = useMemo(() => {
    if (!fromToken) {
      return []
    }

    const tokens = Object.keys(prices ?? {}).filter((token) => {
      if (token === fromToken) {
        return false
      }

      const pricePriority = getPriority(token)
      return pricePriority > LOWEST_PRIORITY
    })

    return sortTokens(tokens)
  }, [fromToken, prices])

  const changeFromToken = useCallback((token: string) => {
    setFromToken(token)
    setFromAmount('')
    setToAmount('')
    setToToken('')
  }, [])

  const changeToToken = useCallback(
    (token: string) => {
      setToToken(token)
      if (!fromAmount) {
        setToAmount('')
        return
      }

      const toAmountBigNumber = getBigNumber(fromAmount)
        .multipliedBy(prices?.[fromToken] ?? 0)
        .dividedBy(prices?.[token] ?? 0)
      setToAmount(toDecimal(toAmountBigNumber).toString())
    },
    [fromAmount, fromToken, prices],
  )

  const changeFromAmount = useCallback(
    (amount: string) => {
      if (!amount) {
        setFromAmount('')
        setToAmount('')
        return
      }

      const balance = balances?.[fromToken]
      if (balance) {
        const amountBigNumber = getBigNumber(amount)
        const balanceBigNumber = getBigNumber(balance)
        const actualAmountBigNumber = amountBigNumber.isGreaterThanOrEqualTo(balanceBigNumber)
          ? balanceBigNumber
          : amountBigNumber

        setFromAmount(actualAmountBigNumber.toString())
        if (!toToken || !prices?.[fromToken] || !prices?.[toToken]) {
          return
        }

        const fromTokenPrice = getBigNumber(prices?.[fromToken])
        const toTokenPrice = getBigNumber(prices?.[toToken])
        const toAmountBigNumber = actualAmountBigNumber
          .multipliedBy(fromTokenPrice)
          .dividedBy(toTokenPrice)

        setToAmount(toDecimal(toAmountBigNumber).toString())
      }
    },
    [balances, fromToken, prices, toToken],
  )

  const isDisabledInputAmount = !fromToken
  const isDisabledTransaction = !fromToken || !toToken || !fromAmount

  const _swap = useCallback(() => {
    if (!fromToken || !toToken || !fromAmount || !toAmount) {
      return
    }
    const fromTokenBalance = balances?.[fromToken]
    const toTokenBalance = balances?.[toToken]

    if (!fromTokenBalance) {
      return
    }

    const fromTokenBalanceBigNumber = getBigNumber(fromTokenBalance)
    const toTokenBalanceBigNumber = getBigNumber(toTokenBalance ?? '0')
    const fromTokenAmountBigNumber = getBigNumber(fromAmount)
    const toTokenAmountBigNumber = getBigNumber(toAmount)

    const fromRemainBigNumber = fromTokenBalanceBigNumber.minus(fromTokenAmountBigNumber)
    const toPlusBigNumber = toTokenBalanceBigNumber.plus(toTokenAmountBigNumber)

    updateBalance({
      [fromToken]: fromRemainBigNumber.toString(),
      [toToken]: toPlusBigNumber.toString(),
    })

    setFromAmount('')
    setToAmount('')
    setFromToken('')
    setToToken('')
  }, [balances, fromAmount, fromToken, toAmount, toToken, updateBalance])

  // Fake swap
  const { mutate: swap, isPending: isSwapping } = useMutation({
    mutationFn: () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(true)
        }, 1000)
      })
    },
    onSuccess: () => {
      _swap()
      toast.success('Swap successfully!')
    },
  })

  const canRevert = useMemo(() => {
    if (!fromToken || !toToken || !fromAmount || !toAmount) {
      return false
    }
    if (!fromTokens.includes(toToken)) {
      return false
    }
    return true
  }, [fromToken, toToken, fromAmount, toAmount, fromTokens])

  const revert = useCallback(() => {
    if (!canRevert || !prices) {
      return
    }
    let newFromAmount = getBigNumber(toAmount)
    const newFromBalance = getBigNumber(balances?.[toToken] ?? '0')
    if (newFromAmount.isGreaterThan(newFromBalance)) {
      newFromAmount = newFromBalance
    }
    const fromTokenPrice = getBigNumber(prices?.[toToken])
    const toTokenPrice = getBigNumber(prices?.[fromToken])
    const newToAmount = newFromAmount.multipliedBy(fromTokenPrice).dividedBy(toTokenPrice)

    setFromToken(toToken)
    setToToken(fromToken)
    setFromAmount(toAmount)
    setToAmount(toDecimal(newToAmount).toString())
  }, [balances, canRevert, fromToken, prices, toAmount, toToken])

  const setMaxFromAmount = useCallback(() => {
    if (!fromToken || !balances) {
      return
    }
    const balance = balances?.[fromToken]
    if (!balance) {
      return
    }

    setFromAmount(balance)

    if (!toToken || !prices?.[fromToken] || !prices?.[toToken]) {
      return
    }

    const fromTokenPrice = getBigNumber(prices?.[fromToken])
    const toTokenPrice = getBigNumber(prices?.[toToken])
    const toAmountBigNumber = getBigNumber(balance)
      .multipliedBy(fromTokenPrice)
      .dividedBy(toTokenPrice)

    setToAmount(toDecimal(toAmountBigNumber).toString())
  }, [fromToken, balances, toToken, prices])

  const beforeSwapFromAmount = balances?.[fromToken] ?? ''
  const beforeSwapToAmount = balances?.[toToken] ?? ''

  const afterSwapFromAmount = useMemo(() => {
    if (!balances?.[fromToken] || !fromAmount) {
      return ''
    }
    const fromTokenBalanceBigNumber = getBigNumber(balances?.[fromToken])
    const fromTokenAmountBigNumber = getBigNumber(fromAmount)

    const fromRemainBigNumber = fromTokenBalanceBigNumber.minus(fromTokenAmountBigNumber)
    return fromRemainBigNumber.toString()
  }, [fromToken, balances, fromAmount])

  const afterSwapToAmount = useMemo(() => {
    if (!toAmount) {
      return ''
    }
    const toTokenBalanceBigNumber = getBigNumber(balances?.[toToken] ?? '0')
    const toTokenAmountBigNumber = getBigNumber(toAmount)

    const toPlusBigNumber = toTokenBalanceBigNumber.plus(toTokenAmountBigNumber)
    return toPlusBigNumber.toString()
  }, [toToken, balances, toAmount])

  return (
    <StateContext.Provider
      value={{
        fromToken,
        toToken,
        fromAmount,
        toAmount,
        fromTokens,
        toTokens,
        isDisabledInputAmount,
        isDisabledTransaction,
        isSwapping,
        canRevert,
        beforeSwapFromAmount,
        beforeSwapToAmount,
        afterSwapFromAmount,
        afterSwapToAmount,
      }}
    >
      <ActionContext.Provider
        value={{ changeFromToken, changeToToken, changeFromAmount, swap, revert, setMaxFromAmount }}
      >
        {children}
      </ActionContext.Provider>
    </StateContext.Provider>
  )
}

export { StateContext, ActionContext, SwapProvider }
