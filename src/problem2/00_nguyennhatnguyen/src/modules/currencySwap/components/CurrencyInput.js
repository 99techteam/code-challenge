import React, {useState} from 'react';
import { Input, Select } from 'antd';

const { Option } = Select;

const PriceInput = ({ value = {}, currencies, onChange }) => {
    const [amount, setAmount] = useState(0);
    const [currency, setCurrency] = useState();
    const triggerChange = (changedValue) => {
        onChange?.({
            amount,
            currency,
            ...value,
            ...changedValue,
        });
    };
    const onAmountChange = (e) => {
        const newAmount = parseInt(e.target.value || '0', 10);
        if (Number.isNaN(amount)) {
            return;
        }
        if (!('amount' in value)) {
            setAmount(newAmount);
        }
        triggerChange({
            amount: newAmount,
        });
    };
    const onCurrencyChange = (newCurrency) => {
        if (!('currency' in value)) {
            setCurrency(newCurrency);
        }
        triggerChange({
            currency: newCurrency,
        });
    };
    return (
        <div>
            <Input
                value={value.amount || amount}
                onChange={onAmountChange}
                style={{
                    width: '60%',
                }}
                name="amount"
            />
            <Select
                name="currency"
                value={value.currency || currency}
                style={{
                    width: '30%',
                    margin: '0 8px',
                }}
                onChange={onCurrencyChange}
                placeholder="Select a token"
            >
                {currencies.map((cur, idx) => {
                    return <Option value={cur.value}>{cur.title}</Option>;
                })}
            </Select>
        </div>
    );
};

export default PriceInput;