import { Avatar, Card, Empty, Typography } from 'antd';
import type { Currency } from '../types/currency';
import { getIconUrl } from '../services/currencyService';

interface Props { 
    amount: number; 
    from: Currency | undefined; 
    currencies: Currency[];
}

const format = (n: number) => new Intl.NumberFormat(
    undefined, { maximumSignificantDigits: 12 }
).format(n);

export function ResultGrid({ amount, from, currencies }: Props) {
  if (!from) return <Empty description="Choose a currency and convert" />;

  const results = currencies.filter(c => c.currency !== from.currency)
      .map(to => ({ to, value: amount * from.price / to.price }));
    
  return (
      <div className="result-grid">
          {results.map(({ to, value }) => (
            <Card key={to.currency} size="small" className="result-card">
                <div className="result-currency">
                    <Avatar size={36} src={getIconUrl(to.currency)}>
                        {to.currency.slice(0, 2)}
                    </Avatar>
                    <Typography.Text strong>{to.currency}</Typography.Text>
                </div>
                <Typography.Title level={4}>{format(value)}</Typography.Title>
                <Typography.Text type="secondary">
                    1 {from.currency} = {format(from.price / to.price)} {to.currency}
                </Typography.Text>
            </Card>
          ))}
      </div>
    );
}
