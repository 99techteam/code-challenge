import { Avatar, Space, Typography } from 'antd';
import { getIconUrl } from '../services/currencyService';
import type { Currency } from '../types/currency';

export function CurrencyOption({ currency }: { currency: Currency }) {
  return (
      <Space>
          <Avatar size={28} src={currency.iconUrl}>
              {currency.currency.slice(0, 2)}
          </Avatar>
          <Typography.Text strong>{currency.currency}</Typography.Text>
      </Space>
  );
}
