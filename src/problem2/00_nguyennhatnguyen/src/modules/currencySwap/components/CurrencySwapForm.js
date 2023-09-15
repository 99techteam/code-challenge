import React from 'react';
import {Form, Card, Button, Typography} from 'antd';
import {SyncOutlined} from '@ant-design/icons';
import PriceInput from './CurrencyInput';
import styled from "styled-components";

const { Text, Title } = Typography;

const StyledCard = styled(Card)`
  border: 1px solid #ddd;
  box-shadow: ${(props) => props.theme.boxShadow};
  border-radius: ${(props) => props.theme.borderRadiusBase};
  overflow: hidden;
  margin: 20px;
  
  .ant-card-head {
    border: none;
    .ant-card-head-title {
      text-align: left;
      padding: 0 10px;
    }
  }
`;

const CurrencySwapForm = ({ currencies }) => {
    const [form] = Form.useForm();

    const checkPrice = (_, { amount, currency }) => {
        if (amount > 0 && currency) {
            return Promise.resolve();
        }
        return Promise.reject(new Error('Please choose both amount and currency!'));
    };

    const onSwapPayReceive = () => {
        const {payPrice, receivePrice} = form.getFieldsValue(['payPrice', 'receivePrice']);
        console.log(payPrice);
        console.log(receivePrice);

        form.setFieldsValue({ payPrice: {...payPrice, ...receivePrice} });
        form.setFieldsValue({ receivePrice: {...receivePrice, ...payPrice} });
    }

    return (
        <StyledCard
            title={<Title level={3}>Currency Swap</Title>}
            bordered={false}
            style={{ width: 600 }}>
            <Form form={form} layout="vertical" autoComplete="off">
                <Form.Item name="payPrice" help=""  rules={[{validator: checkPrice}]} style={{marginBottom: 0}}>
                    <PriceInput title="You pay" currencies={currencies} />
                </Form.Item>
                <Button shape="circle"
                        type="primary"
                        style={{
                            position: 'relative',
                            border: 'none',
                            width: '50px',
                            height: '50px',
                            zIndex: 2,
                            margin: '-18px auto',
                            boxShadow: '0 6px 16px 0 rgb(0 0 0 / 8%), 0 3px 6px -4px rgb(0 0 0 / 12%), 0 9px 28px 8px rgb(0 0 0 / 5%)',
                        }}
                        icon={<SyncOutlined rotate="90" style={{ fontSize: '25px' }} />} onClick={onSwapPayReceive} />
                <Form.Item name="receivePrice" help="" rules={[{validator: checkPrice}]} style={{marginBottom: 0}}>
                    <PriceInput title="You receive" currencies={currencies} />
                </Form.Item>
            </Form>
        </StyledCard>
    )
};

export default CurrencySwapForm;