import React, {useState} from 'react';
import {Card, Input, Select, Typography} from 'antd';
import styled from "styled-components";

const { Option } = Select;
const { Text, Title } = Typography;

const StyledCard = styled(Card)`
  border: 1px solid #ddd;
  box-shadow: ${(props) => props.theme.boxShadow};
  border-radius: ${(props) => props.theme.borderRadiusBase};
  overflow: hidden;
  margin-bottom: 0;
  
  .ant-card-head {
    border: none;
    .ant-card-head-title {
      text-align: left;
      padding: 0 10px;
    }
  }
`;

const PriceInput = ({ title = '', value = {}, currencies, onChange }) => {
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
        <StyledCard title={<Title level={5}>You pay</Title>}>
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
                    return <Option key={cur} value={cur}>{cur}</Option>;
                })}
            </Select>
        </StyledCard>
    );
};

export default PriceInput;