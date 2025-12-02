type ReactNode = unknown;

declare function useMemo<T>(factory: () => T, deps: unknown[]): T;
declare function useWalletBalances(): WalletBalance[];
declare function usePrices(): Record<string, number>;
declare function createElement(type: any, props: Record<string, unknown>, ...children: ReactNode[]): ReactNode;

type WalletRowProps = {
  className?: string;
  amount: number;
  usdValue: number;
  formattedAmount: string;
  key?: string;
};
declare function WalletRow(props: WalletRowProps): ReactNode;

const classes = { row: 'wallet-row' } as const;

interface BoxProps {
  className?: string;
  style?: Record<string, unknown>;
  [key: string]: unknown;
}

export type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo';

export interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain;
}

interface Props extends BoxProps {
  children?: ReactNode;
}

const PRIORITY: Record<Blockchain, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20
};

const getPriority = (blockchain: Blockchain): number => PRIORITY[blockchain] ?? -99;

export const WalletPage = ({ children, ...rest }: Props) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance) => getPriority(balance.blockchain) > -99 && balance.amount > 0)
      .sort((lhs, rhs) => getPriority(rhs.blockchain) - getPriority(lhs.blockchain));
  }, [balances]);

  const rows = useMemo(() => {
    return sortedBalances.map((balance) => {
      const formattedAmount = balance.amount.toFixed(4);
      const price = prices[balance.currency] ?? 0;
      const usdValue = price * balance.amount;

      return createElement(WalletRow, {
        className: classes.row,
        key: balance.currency,
        amount: balance.amount,
        usdValue,
        formattedAmount
      });
    });
  }, [sortedBalances, prices]);

  return createElement('div', { ...rest }, rows);
};
