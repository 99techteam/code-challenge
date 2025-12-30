import React from 'react';

interface WalletRowProps {
	amount: number;
	usdValue: number;
	formattedAmount: string;
	className?: string;
}

const WalletRow: React.FC<WalletRowProps> = ({
	amount,
	usdValue,
	formattedAmount,
	className,
}) => {
	return (
		<div
			className={className}
			style={{
				display: 'flex',
				justifyContent: 'space-between',
				padding: '10px',
			}}
		>
			<div>
				<strong>{formattedAmount}</strong>
				<span style={{ marginLeft: '10px', color: '#666' }}>({amount})</span>
			</div>
			<div>${usdValue.toLocaleString()}</div>
		</div>
	);
};

export default WalletRow;
