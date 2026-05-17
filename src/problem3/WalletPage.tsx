import { useMemo } from 'react';
import type { FC } from 'react';
// The following imports are placeholders — keep the originals from your project.
// import type { BoxProps } from '@mui/material';
// import { useWalletBalances } from './hooks/useWalletBalances';
// import { usePrices } from './hooks/usePrices';
// import { WalletRow } from './WalletRow';
// import classes from './WalletPage.module.css';

// --- Types ------------------------------------------------------------------

type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo';

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain; // missing in the original — added so TS can check usage
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
  usdValue: number;
}

// --- Static lookup ---------------------------------------------------------

// Hoisted to module scope: the lookup is pure data, so there is no reason to
// reallocate it on every render. Using a Record also gives us O(1) lookup with
// exhaustive type-checking against the Blockchain union.
const BLOCKCHAIN_PRIORITY: Record<Blockchain, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

const isKnownBlockchain = (b: string): b is Blockchain =>
  Object.prototype.hasOwnProperty.call(BLOCKCHAIN_PRIORITY, b);

const getPriority = (b: Blockchain): number => BLOCKCHAIN_PRIORITY[b];

// --- Component --------------------------------------------------------------

type WalletPageProps = BoxProps;

export const WalletPage: FC<WalletPageProps> = ({ children, ...rest }) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  // Sort + filter. Decorate-sort-undecorate so getPriority runs once per
  // balance rather than ~2·N·logN times inside the comparator.
  // Deps: balances only — prices do not affect ordering.
  const sortedBalances = useMemo(() => {
    return balances
      .filter(
        (b): b is WalletBalance =>
          isKnownBlockchain(b.blockchain) && b.amount > 0,
      )
      .map((b) => ({ balance: b, priority: getPriority(b.blockchain) }))
      .sort((a, b) => b.priority - a.priority) // descending
      .map(({ balance }) => balance);
  }, [balances]);

  // Format pass kept separate so a price tick re-runs only the formatting,
  // not the filter/sort.
  const formattedBalances = useMemo<FormattedWalletBalance[]>(() => {
    return sortedBalances.map((b) => {
      const price = prices[b.currency] ?? 0;
      return {
        ...b,
        formatted: b.amount.toFixed(4),
        usdValue: price * b.amount,
      };
    });
  }, [sortedBalances, prices]);

  return (
    <div {...rest}>
      {formattedBalances.map((b) => (
        <WalletRow
          // Stable key: `currency` alone may collide across chains, so we
          // compose with `blockchain`. Avoids React re-using DOM incorrectly
          // when the filtered/sorted list reorders.
          key={`${b.blockchain}:${b.currency}`}
          className={classes.row}
          amount={b.amount}
          usdValue={b.usdValue}
          formattedAmount={b.formatted}
        />
      ))}
      {children}
    </div>
  );
};
