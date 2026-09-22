/**
 * Problem 3. Read top to bottom: the code as provided (commented out and
 * unchanged), declarations for what it uses but doesn't define, then the
 * refactor. REFACTORING.md lists each issue and what replaced it.
 */

import { useMemo, type ComponentProps, type ReactElement } from 'react';

/* ---------------------------------------------------------------------------
 * Original code, as provided. Kept verbatim for comparison; it does not
 * compile on its own.
 * ---------------------------------------------------------------------------

interface WalletBalance {
  currency: string;
  amount: number;
}
interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
}

interface Props extends BoxProps {

}
const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

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
          if (lhsPriority > -99) {
             if (balance.amount <= 0) {
               return true;
             }
          }
          return false
        }).sort((lhs: WalletBalance, rhs: WalletBalance) => {
            const leftPriority = getPriority(lhs.blockchain);
          const rightPriority = getPriority(rhs.blockchain);
          if (leftPriority > rightPriority) {
            return -1;
          } else if (rightPriority > leftPriority) {
            return 1;
          }
    });
  }, [balances, prices]);

  const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    return {
      ...balance,
      formatted: balance.amount.toFixed()
    }
  })

  const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) => {
    const usdValue = prices[balance.currency] * balance.amount;
    return (
      <WalletRow 
        className={classes.row}
        key={index}
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.formatted}
      />
    )
  })

  return (
    <div {...rest}>
      {rows}
    </div>
  )
}

--------------------------------------------------------------------------- */

/* ---------------------------------------------------------------------------
 * Declarations
 * ------------------------------------------------------------------------- */

// The snippet uses these without defining them: they belong to the app around
// it. Declaring them keeps this file type-checked without inventing their
// implementations. Their types are part of the refactor below.
declare function useWalletBalances(): readonly WalletBalance[];
declare function usePrices(): Prices;
declare function WalletRow(props: WalletRowProps): ReactElement;
declare const classes: { readonly row: string };

/* ---------------------------------------------------------------------------
 * Refactored
 * ------------------------------------------------------------------------- */

/** One asset held in the wallet. */
export interface WalletBalance {
  currency: string;
  amount: number;
  /** The chain the balance is on — any chain, not only the ones the page lists. */
  blockchain: string;
}

/** A balance with its amount ready to display. */
export interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

/** USD price per unit, by currency. Not every currency has one. */
export type Prices = Readonly<Record<string, number>>;

/** What the page passes each row: the snippet's props, plus `currency`. */
export interface WalletRowProps {
  className?: string;
  currency: string;
  amount: number;
  formattedAmount: string;
  /** `undefined` when there is no price for the currency. */
  usdValue: number | undefined;
}

/**
 * Where each chain's balances are listed, highest first. A balance on a chain
 * that is not here is not listed at all.
 */
const BLOCKCHAIN_PRIORITY: ReadonlyMap<string, number> = new Map([
  ['Osmosis', 100],
  ['Ethereum', 50],
  ['Arbitrum', 30],
  ['Zilliqa', 20],
  ['Neo', 20],
]);

/**
 * Grouped, up to six decimals: `1,234.5`, `0.000123`. Built once, because
 * constructing a formatter costs far more than calling one.
 */
const amountFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 6 });

/**
 * The balances the wallet page lists, in order: positive balances on listed
 * chains, highest-priority chain first, each with its display amount. Balances
 * on equally ranked chains keep the order they arrived in.
 */
export function toVisibleBalances(balances: readonly WalletBalance[]): FormattedWalletBalance[] {
  return (
    balances
      // Look each chain up once, so the sort compares plain numbers.
      .flatMap((balance) => {
        const priority = BLOCKCHAIN_PRIORITY.get(balance.blockchain);
        return priority !== undefined && balance.amount > 0 ? [{ balance, priority }] : [];
      })
      .sort((a, b) => b.priority - a.priority)
      .map(({ balance }) => ({ ...balance, formatted: amountFormat.format(balance.amount) }))
  );
}

/** What a balance is worth in USD, or `undefined` when its currency has no price. */
export function usdValueOf(balance: WalletBalance, prices: Prices): number | undefined {
  const price = prices[balance.currency];
  return price === undefined ? undefined : price * balance.amount;
}

/** Everything a `<div>` takes except children — the page renders its own. */
type WalletPageProps = Omit<ComponentProps<'div'>, 'children'>;

export function WalletPage(props: WalletPageProps) {
  const balances = useWalletBalances();
  const prices = usePrices();

  // Reads balances only, so a price update re-renders the rows without
  // filtering, sorting or formatting them again.
  const visibleBalances = useMemo(() => toVisibleBalances(balances), [balances]);

  return (
    <div {...props}>
      {visibleBalances.map((balance) => (
        <WalletRow
          key={`${balance.blockchain}:${balance.currency}`}
          className={classes.row}
          currency={balance.currency}
          amount={balance.amount}
          formattedAmount={balance.formatted}
          usdValue={usdValueOf(balance, prices)}
        />
      ))}
    </div>
  );
}
