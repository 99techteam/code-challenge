import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Col, ConfigProvider, Form, InputNumber, Row, Select, Space, Typography, message } from 'antd';
import type { Currency } from './types/currency';
import { fetchCurrencies, getIconUrl } from './services/currencyService';
import { CurrencyOption } from './components/CurrencyOption';
import { ProcessingModal } from './components/ProcessingModal';
import { ResultGrid } from './components/ResultGrid';
import './styles.css';

export default function App() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [amount, setAmount] = useState<number | null>(100);
  const [from, setFrom] = useState('USD');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string>();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
      fetchCurrencies()
          .then(records => setCurrencies(
              records.map(c => ({ ...c, iconUrl: getIconUrl(c.currency) }))
          ))
          .catch(e => setError(e instanceof Error ? e.message : 'Unable to load currencies'))
          .finally(() => setLoading(false));
  }, []);

  const selected = useMemo(
      () => currencies.find(c => c.currency === from),
      [currencies, from]
  );

  async function submit() {
    if (!amount || amount <= 0 || !selected) return;
    setProcessing(true);
    setSubmitted(false);
    await new Promise(resolve => setTimeout(resolve, 650));
    setSubmitted(true);
    setProcessing(false);
    messageApi.success('Conversion complete');
  }

  return (
      <ConfigProvider theme={{ token: { colorPrimary: '#1677ff', borderRadius: 10 } }}>
          {contextHolder}<ProcessingModal open={processing} />
          <main className="page">
              <div className="container">
                  <Space direction="vertical" size={4} className="heading">
                      <Typography.Title>Currency Converter</Typography.Title>
                      <Typography.Text type="secondary">Convert one currency into every available currency.</Typography.Text>
                  </Space>
                  <Card className="form-card">
                      {error &&
                          <Alert type="error" showIcon message="Could not load currencies" description={error} action={<Button size="small" onClick={() => window.location.reload()}>Retry</Button>} style={{ marginBottom: 20 }} />
                      }
                      <Form layout="vertical" onFinish={submit} disabled={processing || loading}>
                          <Row gutter={[16, 8]} align="bottom">
                              <Col xs={24} md={8}>
                                  <Form.Item label="Amount" required>
                                      <InputNumber min={0.00000001} precision={12} value={amount} onChange={setAmount} style={{ width: '100%' }} placeholder="Enter amount" />
                                  </Form.Item>
                              </Col>
                              <Col xs={24} md={10}>
                                  <Form.Item label="From currency" required>
                                      <Select showSearch optionFilterProp="label" value={from} onChange={value => { setFrom(value); setSubmitted(false); }} loading={loading} style={{ width: '100%' }} options={currencies.map(c => ({ value: c.currency, label: c.currency, currency: c }))} optionRender={option => <CurrencyOption currency={option.data.currency} />} />
                                  </Form.Item>
                              </Col>
                              <Col xs={24} md={6}>
                                  <Form.Item>
                                      <Button type="primary" htmlType="submit" block disabled={!amount || amount <= 0 || !selected} loading={processing}>
                                          Convert
                                      </Button>
                                  </Form.Item>
                              </Col>
                          </Row>
                      </Form>
                  </Card>
                  {submitted && selected &&
                      <section className="results">
                          <div className="results-header">
                              <div>
                                  <Typography.Title level={3}>Converted amounts</Typography.Title>
                                  <Typography.Text type="secondary">
                                      {amount?.toLocaleString()} {selected.currency} → {currencies.length - 1} currencies
                                  </Typography.Text>
                              </div>
                          </div>
                          <ResultGrid amount={amount ?? 0} from={selected} currencies={currencies} />
                      </section>
                  }
            </div>
        </main>
    </ConfigProvider>
  );
}
