import { useState } from 'react'
import { Card, Input, Button, Space, Typography, Spin, Alert } from 'antd'
import { SwapOutlined, DownOutlined } from '@ant-design/icons'
import { useTokenPrices } from '../hooks/useTokenPrices'
import { useSwap } from '../hooks/useSwap'
import { TokenIcon } from './TokenIcon'
import { TokenSelectModal } from './TokenSelectModal'
import { SwapConfirmModal } from './SwapConfirmModal'
import { SlippageSettings } from './SlippageSettings'
import { getMockBalance } from '../utils'
import { t } from '../utils/i18n'

const CARD_STYLE = { maxWidth: 440, margin: '0 auto' } as const
const LOADING_STYLE = {
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  gap: 16,
  padding: 32,
}

export function SwapForm() {
  const { tokens, loading, errorKey, retry } = useTokenPrices()
  const swap = useSwap(tokens)
  const [selectingFor, setSelectingFor] = useState<'from' | 'to' | null>(null)

  if (loading) {
    return (
      <Card style={CARD_STYLE}>
        <div style={LOADING_STYLE}>
          <Spin size="large" />
          <Typography.Text type="secondary">
            {t('swap.loadingTokensAndPrices')}
          </Typography.Text>
        </div>
      </Card>
    )
  }

  if (errorKey || tokens.length === 0) {
    const message = errorKey
      ? t(`swap.errors.${errorKey}`)
      : t('swap.errors.noTokensAvailable')
    return (
      <Card style={CARD_STYLE}>
        <Alert
          type="error"
          showIcon
          message={message}
          action={
            <Button size="small" onClick={retry}>
              {t('swap.tryAgain')}
            </Button>
          }
        />
      </Card>
    )
  }

  const handleTokenSelect = (currency: string) => {
    if (selectingFor === 'from') swap.setFromCurrency(currency)
    else if (selectingFor === 'to') swap.setToCurrency(currency)
    setSelectingFor(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    swap.requestSwap()
  }

  const mockBalance = swap.fromCurrency ? getMockBalance(swap.fromCurrency) : 0

  const buttonText = (): string => {
    if (!swap.fromCurrency || !swap.toCurrency) return t('swap.selectTokens')
    if (swap.sameToken) return t('swap.selectDifferentTokens')
    if (!swap.fromAmount) return t('swap.enterAmount')
    if (swap.amountErrorKey)
      return t(`swap.amountError.${swap.amountErrorKey}`)
    return t('swap.swap')
  }

  const successMessage =
    swap.status === 'success' &&
    swap.fromAmount &&
    swap.estimatedAmount != null
      ? t('swap.successMessage', {
          fromAmount: swap.fromAmount,
          fromCurrency: swap.fromCurrency,
          toAmount: swap.estimatedAmount.toFixed(6),
          toCurrency: swap.toCurrency,
        })
      : ''

  return (
    <>
      <Card
        title={
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography.Title level={5} style={{ margin: 0 }}>
              {t('swap.title')}
            </Typography.Title>
            <SlippageSettings value={swap.slippage} onChange={swap.setSlippage} />
          </div>
        }
        style={CARD_STYLE}
      >
        <form onSubmit={handleSubmit}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 4,
                }}
              >
                <Typography.Text type="secondary">
                  {t('swap.youPay')}
                </Typography.Text>
                {swap.fromCurrency && (
                  <Space size="small">
                    <Typography.Text type="secondary">
                      {t('swap.balance')}: {mockBalance.toFixed(4)}
                    </Typography.Text>
                    <Button
                      type="link"
                      size="small"
                      style={{ padding: 0 }}
                      onClick={() =>
                        swap.setFromAmount(mockBalance.toString())
                      }
                    >
                      {t('swap.max')}
                    </Button>
                  </Space>
                )}
              </div>
              <Input
                size="large"
                placeholder="0"
                value={swap.fromAmount}
                onChange={(e) => swap.setFromAmount(e.target.value)}
                status={swap.amountErrorKey ? 'error' : undefined}
                addonAfter={
                  <Button
                    type="text"
                    onClick={() => setSelectingFor('from')}
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <TokenIcon currency={swap.fromCurrency} size={24} />
                    {swap.fromCurrency || t('common.select')}
                    <DownOutlined />
                  </Button>
                }
              />
              {swap.fromToken && swap.fromAmount && !swap.amountErrorKey && (
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  ≈ $
                  {(Number(swap.fromAmount) * swap.fromToken.price).toLocaleString(
                    undefined,
                    { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                  )}
                </Typography.Text>
              )}
              {swap.amountErrorKey && (
                <Typography.Text type="danger" style={{ fontSize: 12 }}>
                  {t(`swap.amountError.${swap.amountErrorKey}`)}
                </Typography.Text>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                type="default"
                shape="circle"
                icon={<SwapOutlined />}
                onClick={swap.swapDirection}
                aria-label="Swap direction"
              />
            </div>

            <div>
              <Typography.Text type="secondary">
                {t('swap.youReceive')}
              </Typography.Text>
              <Input
                size="large"
                readOnly
                placeholder="0"
                value={
                  swap.estimatedAmount != null
                    ? swap.estimatedAmount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 6,
                      })
                    : ''
                }
                style={{ marginTop: 4 }}
                addonAfter={
                  <Button
                    type="text"
                    onClick={() => setSelectingFor('to')}
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <TokenIcon currency={swap.toCurrency} size={24} />
                    {swap.toCurrency || t('common.select')}
                    <DownOutlined />
                  </Button>
                }
              />
              {swap.toToken && swap.estimatedAmount != null && (
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  ≈ $
                  {(swap.estimatedAmount * swap.toToken.price).toLocaleString(
                    undefined,
                    { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                  )}
                </Typography.Text>
              )}
              {swap.sameToken && (
                <Typography.Text type="danger" style={{ fontSize: 12 }}>
                  {t('swap.selectDifferentToken')}
                </Typography.Text>
              )}
            </div>

            {swap.exchangeRate != null && !swap.sameToken && (
              <Space
                direction="vertical"
                size={4}
                style={{
                  width: '100%',
                  padding: 12,
                  background: 'rgba(0,0,0,0.02)',
                  borderRadius: 8,
                }}
              >
                <DetailRow
                  label={t('swap.rate')}
                  value={`1 ${swap.fromCurrency} = ${swap.exchangeRate.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 6,
                  })} ${swap.toCurrency}`}
                />
                {swap.estimatedAmount != null && (
                  <>
                    <DetailRow
                      label={t('swap.priceImpact')}
                      value={`~${swap.priceImpact < 0.01 ? '< 0.01' : swap.priceImpact.toFixed(2)}%`}
                      valueType={swap.priceImpact > 1 ? 'danger' : 'success'}
                    />
                    <DetailRow
                      label={t('swap.slippage')}
                      value={`${swap.slippage}%`}
                    />
                  </>
                )}
              </Space>
            )}

            {swap.status === 'success' && successMessage && (
              <Alert type="success" showIcon message={successMessage} />
            )}

            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              disabled={!swap.canSubmit}
            >
              {buttonText()}
            </Button>
          </Space>
        </form>
      </Card>

      <TokenSelectModal
        open={selectingFor !== null}
        tokens={tokens}
        selectedCurrency={
          selectingFor === 'from' ? swap.fromCurrency : swap.toCurrency
        }
        onSelect={handleTokenSelect}
        onClose={() => setSelectingFor(null)}
      />

      {(swap.status === 'confirming' || swap.status === 'swapping') &&
        swap.fromToken &&
        swap.toToken &&
        swap.estimatedAmount != null &&
        swap.exchangeRate != null &&
        swap.minimumReceived != null && (
          <SwapConfirmModal
            fromToken={swap.fromToken}
            toToken={swap.toToken}
            fromAmount={swap.fromAmount}
            estimatedAmount={swap.estimatedAmount}
            exchangeRate={swap.exchangeRate}
            priceImpact={swap.priceImpact}
            slippage={swap.slippage}
            minimumReceived={swap.minimumReceived}
            onConfirm={swap.confirmSwap}
            onCancel={swap.cancelSwap}
            swapping={swap.status === 'swapping'}
          />
        )}
    </>
  )
}

function DetailRow({
  label,
  value,
  valueType,
}: {
  label: string
  value: string
  valueType?: 'success' | 'warning' | 'danger'
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 13,
      }}
    >
      <Typography.Text type="secondary">{label}</Typography.Text>
      <Typography.Text type={valueType}>{value}</Typography.Text>
    </div>
  )
}
