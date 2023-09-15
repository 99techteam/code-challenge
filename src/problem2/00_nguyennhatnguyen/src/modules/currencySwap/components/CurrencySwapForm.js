import React from 'react';
import { Form, Card, Button } from 'antd';
import {SyncOutlined} from '@ant-design/icons';
import PriceInput from './CurrencyInput';

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

        form.setFieldsValue({ payPrice: [...payPrice, receivePrice] });
        form.setFieldsValue({ receivePrice: [...receivePrice, payPrice] });
    }

    return (
        <Card
            title="Currency Swap"
            bordered={false}
            style={{ width: 600 }}>
            <Form form={form} layout="vertical" autoComplete="off">
                <Card title="You pay">
                    <Form.Item name="payPrice" help=""  rules={[{validator: checkPrice}]} >
                        <PriceInput currencies={currencies} />
                    </Form.Item>
                </Card>
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
                <Card title="You receive">
                    <Form.Item name="receivePrice" help="" rules={[{validator: checkPrice}]} >
                        <PriceInput currencies={currencies} />
                    </Form.Item>
                </Card>
            </Form>
        </Card>
    )
};

export default CurrencySwapForm;