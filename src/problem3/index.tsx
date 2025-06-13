interface WalletBalance {
	currency: string;
	amount: number;
}
//	1. This interface should extends from WalletBalance
interface FormattedWalletBalance {
	currency: string;
	amount: number;
	formatted: string;
}

//	2. Seem BoxProps isn't defined, then we can remove it
//	   also rename for better illustration and since we use children
//	   we can extends with React.PropsWithChildren 
interface Props extends BoxProps {

}
//  3. We should import React first
const WalletPage: React.FC<Props> = (props: Props) => {
	const { children, ...rest } = props;
	const balances = useWalletBalances();
	const prices = usePrices();

	//	4. This function has nothing to do with react, so we can move it out of the component
	const getPriority = (blockchain: any): number => {
		switch (blockchain) {
			case 'Osmosis':
				return 100
			case 'Ethereum':
				return 50
			case 'Arbitrum':
				return 30
			case 'Zilliqa':
				return 20
			case 'Neo':
				return 20
			default:
				return -99
		}
	}

	const sortedBalances = useMemo(() => {
		return balances.filter((balance: WalletBalance) => {
			// 5. Property 'blockchain' does not exist on type 'WalletBalance'
			//	  we should define it first
			const balancePriority = getPriority(balance.blockchain);
			// 6. Seem 'lhsPriority' is not defined here
			// 7. We should simplify the return statement
			if (lhsPriority > -99) {
				if (balance.amount <= 0) {
					return true;
				}
			}
			return false
		}).sort((lhs: WalletBalance, rhs: WalletBalance) => {
			const leftPriority = getPriority(lhs.blockchain);
			const rightPriority = getPriority(rhs.blockchain);
			// 8. We should simplify the return statement
			if (leftPriority > rightPriority) {
				return -1;
			} else if (rightPriority > leftPriority) {
				return 1;
			}
		});
		// 9. prices as dependency as is redandant
	}, [balances, prices]);

	// 10. we should merge this into sortedBalances
	const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
		return {
			...balance,
			formatted: balance.amount.toFixed()
		}
	})

	const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) => {
		const usdValue = prices[balance.currency] * balance.amount;
		// 11. We shouldn't use index for key, it's unstable due to the array, effect to virtual dom and hence degrade the performance
		return (
			<WalletRow
				className={classes.row}
				key={index}
				amount={balance.amount}
				usdValue={usdValue}
				formattedAmount={balance.formatted}
			/>
		)
	})

	return (
		// 12. should not use spread operator since we don't know what props are passed	
		//     It will potenially override existing props due to mismatch between
		//     self-define props and html prop, make component unstable.
		<div {...rest}>
			{rows}
		</div>
	)
}