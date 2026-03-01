import { Modal, Button, Space, Typography, Spin } from 'antd'
import { ArrowDownOutlined } from '@ant-design/icons'
import { TokenIcon } from './TokenIcon'
import type { TokenWithPrice } from '../types'
import { t } from '../utils/i18n'

interface SwapConfirmModalProps {
  fromToken: TokenWithPrice
  toToken: TokenWithPrice
  fromAmount: string
  estimatedAmount: number
  exchangeRate: number
  priceImpact: number
  slippage: number
  minimumReceived: number
  onConfirm: () => Promise<void>
  onCancel: () => void
  swapping: boolean
}

const DETAIL_BOX_STYLE = {
  width: '100%' as const,
  padding: 12,
  background: 'rgba(0,0,0,0.02)',
  borderRadius: 8,
}

export function SwapConfirmModal({
  fromToken,
  toToken,
  fromAmount,
  estimatedAmount,
  exchangeRate,
  priceImpact,
  slippage,
  minimumReceived,
  onConfirm,
  onCancel,
  swapping,
}: SwapConfirmModalProps) {
  return (
    <Modal
      title={t('swap.confirmSwap')}
      open
      onCancel={onCancel}
      footer={null}
      width={400}
      maskClosable={!swapping}
      closable={!swapping}
      keyboard={!swapping}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {t('swap.youPay')}
          </Typography.Text>
          <Space>
            <TokenIcon currency={fromToken.currency} size={28} />
            <Typography.Text strong style={{ fontSize: 18 }}>
              {fromAmount} {fromToken.currency}
            </Typography.Text>
          </Space>
        </Space>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <ArrowDownOutlined
            style={{ fontSize: 16, color: 'rgba(0,0,0,0.25)' }}
          />
        </div>

        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {t('swap.youReceive')}
          </Typography.Text>
          <Space>
            <TokenIcon currency={toToken.currency} size={28} />
            <Typography.Text strong style={{ fontSize: 18 }}>
              {estimatedAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 6,
              })}{' '}
              {toToken.currency}
            </Typography.Text>
          </Space>
        </Space>

        <Space direction="vertical" size={8} style={DETAIL_BOX_STYLE}>
          <DetailRow
            label={t('swap.rate')}
            value={`1 ${fromToken.currency} = ${exchangeRate.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 6,
            })} ${toToken.currency}`}
          />
          <DetailRow
            label={t('swap.priceImpact')}
            value={`${priceImpact < 0.01 ? '< 0.01' : priceImpact.toFixed(2)}%`}
            valueType={
              priceImpact > 1 ? 'danger' : priceImpact > 0.3 ? 'warning' : 'success'
            }
          />
          <DetailRow label={t('swap.maxSlippage')} value={`${slippage}%`} />
          <DetailRow
            label={t('swap.minReceived')}
            value={`${minimumReceived.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 6,
            })} ${toToken.currency}`}
          />
        </Space>

        <Button
          type="primary"
          block
          size="large"
          onClick={onConfirm}
          disabled={swapping}
          icon={swapping ? <Spin size="small" /> : null}
        >
          {swapping ? t('swap.swapping') : t('swap.confirmSwap')}
        </Button>
      </Space>
    </Modal>
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
