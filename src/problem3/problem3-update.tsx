interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: BlockchainName;
}

// extends WalletBalance to reuse the properties
interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

// create a new enum for blockchain names
enum BlockchainEnum {
  Osmosis = 100,
  Ethereum = 50,
  Arbitrum = 30,
  Zilliqa = 20,
  Neo = 20,
  Default = -99,
}

const BLOCK_CHAINS = {
  OSMOSIS: "Osmosis",
  ETHEREUM: "Ethereum",
  ARBITRUM: "Arbitrum",
  ZILLIQA: "Zilliqa",
  NEO: "Neo",
} as const;

// create a type for the blockchain names
type BlockchainName = (typeof BLOCK_CHAINS)[keyof typeof BLOCK_CHAINS];

// Create a mapping from BlockchainEnum to BLOCK_CHAINS. We can use this to get the priority of a blockchain
const BlockchainMapping: Record<BlockchainName, BlockchainEnum> = {
  [BLOCK_CHAINS.OSMOSIS]: BlockchainEnum.Osmosis,
  [BLOCK_CHAINS.ETHEREUM]: BlockchainEnum.Ethereum,
  [BLOCK_CHAINS.ARBITRUM]: BlockchainEnum.Arbitrum,
  [BLOCK_CHAINS.ZILLIQA]: BlockchainEnum.Zilliqa,
  [BLOCK_CHAINS.NEO]: BlockchainEnum.Neo,
};

// I will assume we already had BoxProps type
interface Props extends BoxProps {}

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances: WalletBalance[] = useWalletBalances();
  const prices = usePrices();

  // use BlockchainType instead of any
  const getPriority = useCallBack((blockchain: BlockchainName): number => {
    switch (blockchain) {
      case BLOCK_CHAINS.OSMOSIS:
        return BlockchainEnum.Osmosis;
      case BLOCK_CHAINS.ETHEREUM:
        return BlockchainEnum.Ethereum;
      case BLOCK_CHAINS.ARBITRUM:
        return BlockchainEnum.Arbitrum;
      case BLOCK_CHAINS.ZILLIQA:
        return BlockchainEnum.Zilliqa;
      case BLOCK_CHAINS.NEO: // we can combine Zilliqa and Neo since they have the same priority, but keep them separate for clarity
        return BlockchainEnum.Neo;
      default:
        return -99;
    }
  }, []);

  const sortedBalances = useMemo(
    () =>
      balances
        // Remove unused variable `lhsPriority`, remove `balancePriority` since getPriority is meaning enough
        // Update if logic
        .filter(
          (balance: WalletBalance) =>
            getPriority(balance.blockchain) > -99 && balance.amount > 0
        )
        // remove variables since the function is meaning enough and update logic
        .sort(
          (lhs: WalletBalance, rhs: WalletBalance) =>
            getPriority(rhs.blockchain) - getPriority(lhs.blockchain)
        ),
    [balances]
  ); // remove prices dependency since it's redundant

  const formattedBalances = useMemo(
    () =>
      sortedBalances.map((balance: WalletBalance) => {
        return {
          ...balance,
          formatted: balance.amount.toFixed(2), // should be toFixed(2) instead of toFixed() for currency values
        };
      }),
    [sortedBalances]
  );

  // use formattedBalances instead of sortedBalances since the balance's type is FormattedWalletBalance
  const rows = useMemo(() => {
    return formattedBalances.map((balance) => {
      const usdValue = prices[balance.currency] * balance.amount;
      return (
        <WalletRow
          className={classes.row}
          key={`${balance.currency}-${balance.blockchain}`} // More robust key
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.formatted}
        />
      );
    });
  }, [formattedBalances, prices]); // separates useMemo hooks for better readability and performance.

  return (
    <div {...rest}>
      {...rows} {/* Spread or map based on the business */}
      {children} {/* add children since it's missing */}
    </div>
  );
};