// ISSUE: WalletBalance did not include `blockchain`
// but the code was using balance.blockchain
// FIX: add blockchain to the interface
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

// ISSUE: FormattedWalletBalance was missing `blockchain`
// but it was later used in the key
// FIX: extend WalletBalance to keep all fields consistent
interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

// ISSUE: Props was empty and did not extend BoxProps
// FIX: we can overwrite it to type Props = BoxProps or extend it to allow future additions
interface Props extends BoxProps {}

// ISSUE: priority logic defined inside component
// recreated on every render unnecessarily
// FIX: move it outside as a constant
const PRIORITY_MAP: Record<string, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

// ISSUE: used `|| -99` which is unsafe for falsy values
// FIX: use `?? -99` to only fallback on null/undefined
const getPriority = (blockchain: string): number =>
  PRIORITY_MAP[blockchain] ?? -99;

const WalletPage: React.FC<Props> = (props) => {
  // ISSUE: destructured `children` but never used
  // FIX: remove unused variable
  const { ...rest } = props;

  const balances = useWalletBalances();
  const prices = usePrices();

  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const priority = getPriority(balance.blockchain);

        // ISSUES:
        // - used wrong variable (lhsPriority instead of balancePriority)
        // - incorrect logic (kept balances with amount <= 0)
        // FIX: keep only valid balances
        return priority > -99 && balance.amount > 0;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        // ISSUE: comparator did not always return a value
        // FIX: return numeric difference (clean & correct)
        return getPriority(rhs.blockchain) - getPriority(lhs.blockchain);
      });

    // ISSUE: included `prices` as dependency unnecessarily
    // FIX: only depend on balances
  }, [balances]);

  const formattedBalances = useMemo<FormattedWalletBalance[]>(() => {
    // ISSUE: formattedBalances was used but never defined
    // FIX: explicitly compute it here
    return sortedBalances.map((balance: WalletBalance) => ({
      ...balance,
      formatted: balance.amount.toFixed(),
    }));
  }, [sortedBalances]);

  const rows = useMemo(() => {
    return formattedBalances.map((balance: FormattedWalletBalance) => {
      // ISSUE: prices[balance.currency] may be undefined so results in NaN
      // FIX: provide fallback value
      const usdValue = (prices[balance.currency] ?? 0) * balance.amount;

      return (
        <WalletRow
          className={classes.row}
          // ISSUE: used index as key so unstable for sorted/filtered lists
          // FIX: use stable composite key
          key={`${balance.blockchain}-${balance.currency}`}
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.formatted}
        />
      );
    });

    // ISSUE: rows computation not memoized or dependencies unclear
    // FIX: proper dependency array for better readability and performance.
  }, [formattedBalances, prices]);

  return <div {...rest}>{rows}</div>;
};
