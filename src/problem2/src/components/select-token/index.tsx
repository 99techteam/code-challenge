import { useMemo, useState } from 'react'
import { DefaultIcon, TokenMap } from '@/constants'
import styles from './styles.module.css'
import DebounceInput from '../debounce-input'
import clsx from 'clsx'
import { usePricesState } from '@/hooks/prices'
import { getBigNumber } from '@/utils'
import { IconSearch } from '@tabler/icons-react'
import Text from '../text'
import Dialog from '../dialog'

type Props = {
  onSelect?: (token: string) => void
  tokens: string[]
  selectedToken: string
  title?: string
}

const SelectToken = ({ onSelect, tokens, selectedToken, title = 'Select Token' }: Props) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { data: prices } = usePricesState()

  const filteredTokens = useMemo(() => {
    return tokens.filter((token) => token.toLowerCase().includes(search.toLowerCase()))
  }, [search, tokens])

  return (
    <>
      <div onClick={() => setOpen(true)}>
        {selectedToken ? (
          <div className={styles.selectToken}>
            {TokenMap[selectedToken]?.icon ?? DefaultIcon}
            <div>
              <Text size="4" weight="medium" as="div">
                {selectedToken.toUpperCase()}
              </Text>
              <Text size="2" weight="medium" as="div" variant="secondary">
                ~$
                {getBigNumber(prices?.[selectedToken] ?? '0')
                  .decimalPlaces(5)
                  .toString()}
              </Text>
            </div>
          </div>
        ) : (
          <Text size="4" weight="medium" as="div" className={styles.selectToken}>
            {DefaultIcon} Select Token
          </Text>
        )}
      </div>
      <Dialog title={title} open={open} onOpenChange={setOpen}>
        <DebounceInput
          leftSlot={<IconSearch />}
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search token"
        />
        <div className={styles.tokenList}>
          {filteredTokens.map((token) => (
            <div
              key={token}
              onClick={() => {
                if (selectedToken !== token) {
                  onSelect?.(token)
                  setOpen(false)
                }
              }}
              className={clsx(styles.tokenItem, {
                [styles.selected]: selectedToken === token,
              })}
            >
              <div className={styles.tokenItemLeft}>
                {TokenMap[token]?.icon ?? DefaultIcon}
                <Text size="4" weight="medium">
                  {token.toUpperCase()}
                </Text>
              </div>

              <div className={styles.tokenItemRight}>
                <Text size="3" weight="medium">
                  ~$
                  {getBigNumber(prices?.[token] ?? '0')
                    .decimalPlaces(5)
                    .toString()}
                </Text>
              </div>
            </div>
          ))}
        </div>
      </Dialog>
    </>
  )
}

export default SelectToken
