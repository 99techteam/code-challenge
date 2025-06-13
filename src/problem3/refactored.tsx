import React, { useMemo } from 'react';

type AppStyle = {
	widthInPx?: string;
	heightInPx?: string;
}

interface WalletBalance {
	currency: string;
	amount: number;
	blockchain: string
}

interface FormattedWalletBalance extends WalletBalance {
	formatted: string;
}

interface WalletPageProps extends React.PropsWithChildren {
	className: string;
	style: AppStyle;
}

const getPriority = (blockchain: any): number => {
	const priorityMap = {
		Osmosis: 100,
		Ethereum: 50,
		Arbitrum: 30,
		Zilliqa: 20,
		Neo: 20,
	}
	return priorityMap[blockchain] || -99;
}

const WalletPage: React.FC<WalletPageProps> = (props: WalletPageProps) => {
	const { children } = props;
	const balances = useWalletBalances();
	const prices = usePrices();

	const sortedBalances = useMemo(() => {
    return balances
      .filter(
        (balance: WalletBalance) => getPriority(balance.blockchain) > -99 && balance.amount <= 0
      )
      .sort(
        (lhs: WalletBalance, rhs: WalletBalance) =>  getPriority(rhs.blockchain) - getPriority(lhs.blockchain)
      )
      .map((balance: WalletBalance) => ({
        ...balance,
        formatted: balance.amount.toFixed(),
      }));
  }, [balances]);

	const rows = sortedBalances.map((balance: FormattedWalletBalance) => {
		const usdValue = prices[balance.currency] * balance.amount;
		return (
			<WalletRow
				key={balance.currency}
				className={classes.row}
				amount={balance.amount}
				usdValue={usdValue}
				formattedAmount={balance.formatted}
			/>
		)
	})

	return (
		<div style={{ width: props.style.widthInPx, height: props.style.heightInPx }} className={props.className}>
			{rows}
			{children}
		</div>
	)
}