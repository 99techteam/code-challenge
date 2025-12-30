import React, { useMemo } from 'react';
import { BoxProps, WalletBalance } from '../types';
import { useWalletBalances } from '../hooks/useWalletBalances';
import { usePrices } from '../hooks/usePrices';
import { getPriority } from '../utils/blockchain';
import WalletRow from './WalletRow';

interface Props extends BoxProps {}

const WalletPage: React.FC<Props> = (props: Props) => {
	const { children, ...rest } = props;
	const balances = useWalletBalances();
	const prices = usePrices();

	const sortedBalances = useMemo(() => {
		return balances
			.filter((balance: WalletBalance) => {
				const priority = getPriority(balance.blockchain);
				return priority > -99 && balance.amount > 0;
			})
			.sort((lhs: WalletBalance, rhs: WalletBalance) => {
				const leftPriority = getPriority(lhs.blockchain);
				const rightPriority = getPriority(rhs.blockchain);
				return rightPriority - leftPriority;
			});
	}, [balances]);

	const rows = useMemo(() => {
		return sortedBalances.map((balance: WalletBalance) => {
			const currentPrice = prices[balance.currency] ?? 0;
			const usdValue = currentPrice * balance.amount;

			return (
				<WalletRow
					key={balance.currency}
					className="wallet-row"
					amount={balance.amount}
					usdValue={usdValue}
					formattedAmount={balance.amount.toFixed(2)}
				/>
			);
		});
	}, [sortedBalances, prices]);

	return <div {...rest}>{rows}</div>;
};

export default WalletPage;
