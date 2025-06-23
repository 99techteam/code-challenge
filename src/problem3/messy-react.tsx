//fake importing
import React, { useMemo } from "react";
import { usePrices } from "./hooks/usePrices";
import { useWalletBalances } from "./hooks/useWalletBalances";
import { BoxProps } from "./BoxProps";
import { WalletRow } from "./WalletRow";
import classes from "./WalletPage.module.css";

interface WalletBalance {
	currency: string;
	amount: number;
	blockchain: string;
}
interface FormattedWalletBalance {
	currency: string;
	amount: number;
	formatted: string;
}

interface Props extends BoxProps {}
const WalletPage: React.FC<Props> = (props: Props) => {
	const { ...rest } = props;
	const balances = useWalletBalances();
	// Ensure type returned
	const prices: { [currency: string]: number } = usePrices();

	const priorityList = {
		Osmosis: 100,
		Ethereum: 50,
		Arbitrum: 30,
		Zilliqa: 20,
		Neo: 20,
	};

	// should not have any type for blockchain
	const getPriority = (blockchain: string): number => {
		if (!priorityList.hasOwnProperty(blockchain)) {
			return -99;
		}
		return priorityList[blockchain];
	};

	const sortedBalances = useMemo(() => {
		return balances
			.filter((balance: WalletBalance) => {
				const priority = getPriority(balance.blockchain);
				return priority > -99 && balance.amount > 0;
			})
			.sort((lhs: WalletBalance, rhs: WalletBalance) => {
				const leftPriority = getPriority(lhs.blockchain);
				const rightPriority = getPriority(rhs.blockchain);
				if (leftPriority > rightPriority) return -1;
				if (leftPriority < rightPriority) return 1;
				return 0;
			});
	}, [balances]);

	const formattedBalances: FormattedWalletBalance[] = sortedBalances.map(
		(balance: WalletBalance) => ({
			...balance,
			formatted: balance.amount.toFixed(2),
		})
	);

	const rows = formattedBalances.map((balance: FormattedWalletBalance) => {
		const usdValue = (prices[balance.currency] ?? 0) * balance.amount;
		return (
			<WalletRow
				className={classes.row}
				key={`${balance.currency}-${balance.blockchain}`}
				amount={balance.amount}
				usdValue={usdValue}
				formattedAmount={balance.formatted}
			/>
		);
	});

	return <div {...rest}>{rows}</div>;
};
