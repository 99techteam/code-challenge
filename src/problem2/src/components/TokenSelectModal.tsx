import { useState, useMemo } from 'react'
import { Modal, Input, Space, Button, Typography } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { TokenIcon } from './TokenIcon'
import type { TokenWithPrice } from '../types'
import { POPULAR_TOKENS } from '../constants'

interface TokenSelectModalProps {
  tokens: TokenWithPrice[]
  selectedCurrency: string
  onSelect: (currency: string) => void
  onClose: () => void
  open: boolean
}

export function TokenSelectModal({
  tokens,
  selectedCurrency,
  onSelect,
  onClose,
  open,
}: TokenSelectModalProps) {
  const [search, setSearch] = useState('')

  const filteredTokens = useMemo(() => {
    if (!search.trim()) return tokens
    const q = search.toLowerCase()
    return tokens.filter((token) => token.currency.toLowerCase().includes(q))
  }, [tokens, search])

  const popularTokens = useMemo(
    () => tokens.filter((token) => (POPULAR_TOKENS as readonly string[]).includes(token.currency)),
    [tokens],
  )

  const handleSelect = (currency: string) => {
    onSelect(currency)
    setSearch('')
    onClose()
  }

  return (
    <Modal
      title="Select a token"
      open={open}
      onCancel={onClose}
      footer={null}
      width={420}
      destroyOnClose
      afterOpenChange={(visible) => !visible && setSearch('')}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Input
          placeholder="Search by token name..."
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          size="large"
        />

        {!search && popularTokens.length > 0 && (
          <div>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Popular tokens
            </Typography.Text>
            <Space size="small" wrap style={{ marginTop: 8 }}>
              {popularTokens.map((t) => (
                <Button
                  key={t.currency}
                  type={t.currency === selectedCurrency ? 'primary' : 'default'}
                  size="small"
                  onClick={() => handleSelect(t.currency)}
                  icon={<TokenIcon currency={t.currency} size={18} />}
                >
                  {t.currency}
                </Button>
              ))}
            </Space>
          </div>
        )}

        <div style={{ maxHeight: 320, overflowY: 'auto' }}>
          {filteredTokens.length === 0 ? (
            <Typography.Text type="secondary">No tokens found.</Typography.Text>
          ) : (
            <Space direction="vertical" size={0} style={{ width: '100%' }}>
              {filteredTokens.map((t) => (
                <Button
                  key={t.currency}
                  type="text"
                  block
                  style={{
                    height: 56,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    background: t.currency === selectedCurrency ? 'rgba(22, 119, 255, 0.08)' : undefined,
                  }}
                  onClick={() => handleSelect(t.currency)}
                >
                  <TokenIcon currency={t.currency} size={36} />
                  <Space style={{ marginLeft: 12, flex: 1 }}>
                    <Typography.Text strong>{t.currency}</Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      $
                      {t.price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 4,
                      })}
                    </Typography.Text>
                  </Space>
                  {t.currency === selectedCurrency && (
                    <Typography.Text type="success">✓</Typography.Text>
                  )}
                </Button>
              ))}
            </Space>
          )}
        </div>
      </Space>
    </Modal>
  )
}
