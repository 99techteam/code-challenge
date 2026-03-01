import React, { useMemo } from 'react'

// --- Types -------------------------------------------------------------------

type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo' | string

interface WalletBalance {
  currency: string
  amount: number
  blockchain: Blockchain
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string
}

interface BoxProps {
  className?: string
  children?: React.ReactNode
  [key: string]: unknown
}

// --- Pure helper outside component (stable reference, no re-creation) --------

function getPriority(blockchain: Blockchain): number {
  switch (blockchain) {
    case 'Osmosis':
      return 100
    case 'Ethereum':
      return 50
    case 'Arbitrum':
      return 30
    case 'Zilliqa':
    case 'Neo':
      return 20
    default:
      return -99
  }
}

// --- Component ---------------------------------------------------------------

interface WalletPageProps extends BoxProps {}

const WalletPage: React.FC<WalletPageProps> = (props) => {
  const { children, ...rest } = props
  const balances = useWalletBalances()
  const prices = usePrices()

  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance): balance is WalletBalance => {
        const balancePriority = getPriority(balance.blockchain)
        return balancePriority > -99 && balance.amount > 0
      })
      .sort((lhs, rhs) => {
        const leftPriority = getPriority(lhs.blockchain)
        const rightPriority = getPriority(rhs.blockchain)
        return rightPriority - leftPriority // descending; returns 0 when equal
      })
  }, [balances])

  const formattedBalances: FormattedWalletBalance[] = useMemo(
    () =>
      sortedBalances.map((balance) => ({
        ...balance,
        formatted: balance.amount.toFixed(),
      })),
    [sortedBalances]
  )

  const rows = useMemo(
    () =>
      formattedBalances.map((balance) => {
        const price = prices[balance.currency]
        const usdValue = (price ?? 0) * balance.amount
        const key = `${balance.blockchain}-${balance.currency}-${balance.amount}`
        return (
          <WalletRow
            key={key}
            className={classes.row}
            amount={balance.amount}
            usdValue={usdValue}
            formattedAmount={balance.formatted}
          />
        )
      }),
    [formattedBalances, prices]
  )

  return <div {...rest}>{rows}</div>
}

export default WalletPage

// --- Placeholders (replace with real hooks / components in your app) ----------

function useWalletBalances(): WalletBalance[] {
  return []
}

function usePrices(): Record<string, number> {
  return {}
}

const classes = { row: 'wallet-row' }

function WalletRow({
  className,
  amount,
  usdValue,
  formattedAmount,
}: {
  className: string
  amount: number
  usdValue: number
  formattedAmount: string
}) {
  return (
    <div className={className}>
      {formattedAmount} ({usdValue} USD)
    </div>
  )
}
