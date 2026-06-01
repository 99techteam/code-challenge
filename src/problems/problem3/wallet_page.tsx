// ── ORIGINAL CODE + ISSUES ───────────────────────────────────────────────────
//
// [N1]  WalletBalance is missing the `blockchain` field — TypeScript cannot
//       catch accesses to balance.blockchain anywhere in this component.
//
// [N2]  FormattedWalletBalance duplicates WalletBalance fields manually instead
//       of extending the interface — any change to WalletBalance must be
//       mirrored here by hand.
//
/*

interface WalletBalance {
  currency: string;
  amount: number;
}

interface FormattedWalletBalance {  // [N2]
  currency: string;
  amount: number;
  formatted: string;
}

interface Props extends BoxProps {}

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  // [N3]  children is destructured but never rendered — silently dropped.

  const balances = useWalletBalances();
  const prices = usePrices();

  // [N4]  getPriority is a pure function with no dependency on props or state.
  //       Defining it inside the component causes it to be redeclared on every
  //       render. It should live outside the component entirely.
  // [N5]  blockchain typed as `any` — loses all type safety and IDE support.
  // [N6]  Switch on raw string literals — a typo silently hits the default
  //       case. A union type or enum makes invalid values a compile-time error.
  const getPriority = (blockchain: any): number => {
    switch (blockchain) {
      case 'Osmosis':
        return 100
      case 'Ethereum':
        return 50
      case 'Arbitrum':
        return 30
      case 'Zilliqa':
        return 20
      case 'Neo':
        return 20
      default:
        return -99
    }
  }

  const sortedBalances = useMemo(() => {
    return balances.filter((balance: WalletBalance) => {
      const balancePriority = getPriority(balance.blockchain);
      // [N7]  lhsPriority is never declared — balancePriority is computed above
      //       but lhsPriority is referenced here. ReferenceError at runtime;
      //       the filter never behaves as intended.
      if (lhsPriority > -99) {
        // [N8]  Filter logic is inverted — this keeps balances with amount <= 0
        //       (empty wallets) and discards wallets that have funds.
        if (balance.amount <= 0) {
          return true;
        }
      }
      return false;
    }).sort((lhs: WalletBalance, rhs: WalletBalance) => {
      const leftPriority = getPriority(lhs.blockchain);
      const rightPriority = getPriority(rhs.blockchain);
      if (leftPriority > rightPriority) {
        return -1;
      } else if (rightPriority > leftPriority) {
        return 1;
      }
      // [N9]  No return when priorities are equal — implicit undefined.
      //       Array.sort requires a number; undefined produces non-deterministic
      //       ordering across JS engines.
    });
  // [N10] prices is in the dependency array but is never read inside the memo —
  //       any price update triggers an unnecessary re-filter + re-sort.
  }, [balances, prices]);

  // [N11] formattedBalances is computed here but rows maps over sortedBalances
  //       instead — this entire .map() is dead code, its result is never used.
  // [N12] toFixed() with no argument defaults to 0 decimal places ("42" instead
  //       of "42.00") — incorrect for currency display.
  const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    return {
      ...balance,
      formatted: balance.amount.toFixed()  // [N12]
    }
  })

  // [N13] rows maps sortedBalances (WalletBalance[]) but types each element as
  //       FormattedWalletBalance — balance.formatted is undefined at runtime
  //       because WalletBalance has no formatted field (see N11).
  // [N14] index used as key — breaks React reconciliation when list order
  //       changes, causing incorrect component reuse and stale state.
  // [N15] prices[balance.currency] may be undefined (currency missing from the
  //       price map) — undefined × number = NaN with no guard or fallback.
  // [N16] classes is never declared in this component — ReferenceError at
  //       runtime. WalletRow should manage its own row styling.
  const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) => {
    const usdValue = prices[balance.currency] * balance.amount;  // [N15]
    return (
      <WalletRow
        className={classes.row}  // [N16]
        key={index}              // [N14]
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.formatted}  // [N13] — undefined at runtime
      />
    )
  })

  return (
    <div {...rest}>
      {rows}
      // [N3] children never rendered
    </div>
  )
}

*/

// ── REFACTORED ────────────────────────────────────────────────────────────────

import React, { useMemo } from 'react'

import type { BoxProps, FormattedWalletBalance, WalletBalance } from './logic'
import { getPriority, usePrices, useWalletBalances } from './logic'

// ── WalletRow ─────────────────────────────────────────────────────────────────

interface WalletRowProps {
  index: number
  currency: string
  amount: number
  usdValue: number
  formattedAmount: string
}

const WalletRow: React.FC<WalletRowProps> = (props: WalletRowProps) => {
  const { index, currency, formattedAmount, usdValue } = props

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="px-4 py-3 text-gray-400 text-sm">{index}</td>
      <td className="px-4 py-3 font-medium text-gray-800">{currency}</td>
      <td className="px-4 py-3 text-gray-600 text-right">{formattedAmount}</td>
      <td className="px-4 py-3 text-gray-600 text-right">${usdValue.toFixed(2)}</td>
    </tr>
  )
}

// ── WalletPage ────────────────────────────────────────────────────────────────

interface Props extends BoxProps {
  children?: React.ReactNode
}

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props
  const balances = useWalletBalances()
  const prices = usePrices()

  const formattedBalances = useMemo((): FormattedWalletBalance[] => {
    return balances
      .reduce((acc: FormattedWalletBalance[], balance: WalletBalance) => {
        const priority = getPriority(balance.blockchain)

        if (priority <= -99) {
          return acc
        }

        if (balance.amount <= 0) {
          return acc
        }

        const usdPrice = prices[balance.currency]

        let usdValue = 0
        if (usdPrice !== undefined) {
          usdValue = usdPrice * balance.amount
        }

        acc.push({
          ...balance,
          formatted: balance.amount.toFixed(2),
          usdValue,
        })

        return acc
      }, [])
      .sort((lhs: FormattedWalletBalance, rhs: FormattedWalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain)
        const rightPriority = getPriority(rhs.blockchain)

        if (leftPriority > rightPriority) {
          return -1
        }

        if (rightPriority > leftPriority) {
          return 1
        }

        return 0
      })
  }, [balances, prices])

  return (
    <div {...rest as React.HTMLAttributes<HTMLDivElement>}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-gray-200 text-left text-gray-500 uppercase text-xs tracking-wide">
            <th className="px-4 py-2">#</th>
            <th className="px-4 py-2">Currency</th>
            <th className="px-4 py-2 text-right">Amount</th>
            <th className="px-4 py-2 text-right">USD Value</th>
          </tr>
        </thead>
        <tbody>
          {formattedBalances.map((balance: FormattedWalletBalance, index: number) => {
            return (
              <WalletRow
                key={balance.currency}
                index={index + 1}
                currency={balance.currency}
                amount={balance.amount}
                usdValue={balance.usdValue}
                formattedAmount={balance.formatted}
              />
            )
          })}
        </tbody>
      </table>
      {children}
    </div>
  )
}

export default WalletPage
