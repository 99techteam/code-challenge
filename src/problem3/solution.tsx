import React, { useMemo } from 'react';

type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo';

interface WalletBalance {
	blockchain: Blockchain | string;
	currency: string;
	amount: number;
}

interface FormattedWalletBalance extends WalletBalance {
	formatted: string;
	usdValue: number;
}

interface Props extends BoxProps {}

const getPriority = (blockchain: Blockchain | string): number => {
	switch (blockchain) {
		case 'Osmosis':
			return 100;
		case 'Ethereum':
			return 50;
		case 'Arbitrum':
			return 30;
		case 'Zilliqa':
			return 20;
		case 'Neo':
			return 20;
		default:
			return -99;
	}
};

const WalletPage: React.FC<Props> = (props: Props) => {
	const { children, ...rest } = props;
	const balances = useWalletBalances();
	const prices = usePrices();

	const sortedAndFormattedBalances = useMemo((): FormattedWalletBalance[] => {
		return balances
			.map((balance: WalletBalance) => ({
				balance,
				priority: getPriority(balance.blockchain)
			}))
			.filter(({ priority, balance }) => priority > -99 && balance.amount > 0)
			.sort((lhs, rhs) => rhs.priority - lhs.priority)
			.map(
				({ balance }): FormattedWalletBalance => ({
					...balance,
					formatted: balance.amount.toFixed(),
					usdValue: prices[balance.currency] * balance.amount
				})
			);
	}, [balances, prices]);

	const rows = useMemo(() => {
		return sortedAndFormattedBalances.map((balance: FormattedWalletBalance) => (
			<WalletRow
				className={classes.row}
				key={balance.currency}
				amount={balance.amount}
				usdValue={balance.usdValue}
				formattedAmount={balance.formatted}
			/>
		));
	}, [sortedAndFormattedBalances]);

	return (
		<div {...rest}>
			{children}
			{rows}
		</div>
	);
};

export default React.memo(WalletPage);
