/**
 * Refactored WalletPage.
 *
 * External symbols (`BoxProps`, `Box`, `useWalletBalances`, `usePrices`,
 * `WalletRow`, `classes`) are assumed to be provided by the host app — the
 * imports below are placeholders that match the shape of a typical
 * MUI + CSS-modules setup. Swap them for the project's real paths.
 */

import React, { useMemo } from 'react';
import { Box, BoxProps } from '@mui/material';
import { useWalletBalances } from './hooks/useWalletBalances';
import { usePrices } from './hooks/usePrices';
import { WalletRow } from './components/WalletRow';
import classes from './WalletPage.module.css';

// --- Types ---------------------------------------------------------------

type Blockchain =
  | 'Osmosis'
  | 'Ethereum'
  | 'Arbitrum'
  | 'Zilliqa'
  | 'Neo';

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain; // was missing in the original
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
  usdValue: number;
}

type Props = BoxProps;

// --- Pure helpers (hoisted so they aren't redefined per render) ----------

const BLOCKCHAIN_PRIORITY: Record<Blockchain, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

const DEFAULT_PRIORITY = -99;

const getPriority = (blockchain: Blockchain): number =>
  BLOCKCHAIN_PRIORITY[blockchain] ?? DEFAULT_PRIORITY;

// --- Component -----------------------------------------------------------

export const WalletPage: React.FC<Props> = ({ children, ...rest }) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  // Filter + sort depend only on `balances` — not on `prices`.
  const sortedBalances = useMemo<WalletBalance[]>(() => {
    return balances
      .filter(
        (balance: WalletBalance) =>
          getPriority(balance.blockchain) > DEFAULT_PRIORITY &&
          balance.amount > 0,
      )
      .sort(
        (lhs: WalletBalance, rhs: WalletBalance) =>
          getPriority(rhs.blockchain) - getPriority(lhs.blockchain),
      );
  }, [balances]);

  // Format + compute USD values in a separate memo that *does* depend on prices.
  const processedBalances = useMemo<FormattedWalletBalance[]>(() => {
    return sortedBalances.map((balance: WalletBalance) => ({
      ...balance,
      formatted: balance.amount.toFixed(),
      usdValue: (prices[balance.currency] ?? 0) * balance.amount,
    }));
  }, [sortedBalances, prices]);

  return (
    <Box {...rest}>
      {processedBalances.map((balance: FormattedWalletBalance) => (
        <WalletRow
          className={classes.row}
          key={balance.currency}
          amount={balance.amount}
          usdValue={balance.usdValue}
          formattedAmount={balance.formatted}
        />
      ))}
      {children}
    </Box>
  );
};

export default WalletPage;
