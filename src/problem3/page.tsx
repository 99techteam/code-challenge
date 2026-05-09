import { useMemo, type ReactElement } from 'react';
import { usePrices, useWalletBalances } from './hooks';
import type { BoxProps } from './models';
import { WalletRow } from './WalletRow';
import { buildWalletRowViewModels } from './walletRowPipeline';

export function WalletPage(props: BoxProps) {
  const balances = useWalletBalances();
  const prices = usePrices();

  const rows = useMemo((): ReactElement[] => {
    const viewModels = buildWalletRowViewModels(balances, prices);
    return viewModels.map((row) => (
      <WalletRow
        //className={classes.walletRow}
        key={`${row.blockchain}-${row.currency}`}
        amount={row.amount}
        usdValue={row.usdValue}
        formattedAmount={row.formatted}
      />
    ));
  }, [balances, prices]);

  return <div {...props}>{rows}</div>;
}
