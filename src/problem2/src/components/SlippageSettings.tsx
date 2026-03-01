import { useState } from 'react'
import { Popover, Button, Input, Space, Typography } from 'antd'
import { SettingOutlined } from '@ant-design/icons'
import { SLIPPAGE_OPTIONS } from '../constants'
import { t } from '../utils/i18n'

interface SlippageSettingsProps {
  value: number
  onChange: (v: number) => void
}

export function SlippageSettings({ value, onChange }: SlippageSettingsProps) {
  const [custom, setCustom] = useState('')
  const isPreset = SLIPPAGE_OPTIONS.some((opt) => opt === value)

  const handleCustom = (val: string) => {
    setCustom(val)
    const num = parseFloat(val)
    if (!Number.isNaN(num) && num > 0 && num <= 50) {
      onChange(num)
    }
  }

  const content = (
    <Space direction="vertical" size="small" style={{ width: 260 }}>
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        {t('swap.slippageTolerance')}
      </Typography.Text>
      <Space wrap>
        {SLIPPAGE_OPTIONS.map((opt) => (
          <Button
            key={opt}
            type={value === opt ? 'primary' : 'default'}
            size="small"
            onClick={() => {
              onChange(opt)
              setCustom('')
            }}
          >
            {opt}%
          </Button>
        ))}
        <Space.Compact size="small">
          <Input
            style={{ width: 72 }}
            placeholder={t('swap.custom')}
            value={isPreset ? '' : custom}
            onChange={(e) => handleCustom(e.target.value)}
            suffix="%"
          />
        </Space.Compact>
      </Space>
      {value > 5 && (
        <Typography.Text type="warning" style={{ fontSize: 12 }}>
          {t('swap.highSlippageWarning')}
        </Typography.Text>
      )}
    </Space>
  )

  return (
    <Popover
      content={content}
      title={null}
      trigger="click"
      placement="bottomRight"
    >
      <Button
        type="text"
        icon={<SettingOutlined />}
        aria-label="Swap settings"
      />
    </Popover>
  )
}
