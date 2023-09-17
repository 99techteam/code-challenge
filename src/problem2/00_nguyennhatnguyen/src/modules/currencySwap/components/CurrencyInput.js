import React, {useCallback, useState} from 'react';
import {Card, Input, Select, Tag, Typography} from 'antd';
import styled from "styled-components";
import CustomSvgIcon from "../../core/components/CustomSvgIcon";
import CustomSelect from "../../core/components/CustomSelect";

const { Option } = Select;
const { Text, Title } = Typography;

const StyledCard = styled(Card)`
  border: none;
  box-shadow: ${(props) => props.theme.boxShadow};
  border-radius: ${(props) => props.theme.borderRadiusBase};
  overflow: hidden;
  margin-bottom: 0;
  background-color: #1b1b1b;
  
  .ant-card-head {
    border: none;
    
    .ant-card-head-title {
      text-align: left;
      padding: 0 10px;

      h4.ant-typography {
        color: #9b9b9b !important;
      }
    }
  }
`;

const StyledSelect = styled(Select)`
  width: 30% !important;
  margin: 0 8px;

  &.slcToken {
    .ant-select-selector {
      background-color: #131313 ;
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 16px;
      color: #fff;
    }
  }
`;

const PriceInput = ({ title = '', value = {}, prices, onChange }) => {
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
        <StyledCard title={<Title level={4}>{title}</Title>}>
            <Input
                value={value.amount || amount}
                onChange={onAmountChange}
                style={{
                    width: '60%',
                    color: '#9b9b9b',
                    background: 'none',
                    border: 'none',
                    fontSize: '25px'
                }}
                name="amount"
            />
            <StyledSelect
                name="currency"
                value={value.currency || currency}
                onChange={onCurrencyChange}
                placeholder="Select a token"
                className="slcToken"
            >
                {prices.map((cur, idx) => {
                    return (
                        <Option key={cur.currency} value={cur.currency}>
                            <div style={{ display: 'flex', justifyContent: 'left', alignItems: 'center' }}>
                                <div style={{marginRight: '10px', display: 'flex', alignItems: 'center'}}>
                                    <CustomSvgIcon
                                        name={cur.currency}
                                        location="tokens"
                                        onCompleted={(iconName) => console.log(`${iconName} successfully loaded`)}
                                        onError={(err) => console.error(err.message)}
                                    />
                                </div>
                                <div>{cur.currency}</div>
                            </div>
                        </Option>
                    );
                })}
            </StyledSelect>
        </StyledCard>
    );
};

export default PriceInput;