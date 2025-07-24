import { IconButton } from '@radix-ui/themes'
import { IconWallet } from '@tabler/icons-react'
import { useState } from 'react'
import styles from './styles.module.css'
import { useBalancesState } from '@/hooks/balances'
import Text from '../text'
import Dialog from '../dialog'
import { DefaultIcon, TokenMap } from '@/constants'

const WalletButton = () => {
  const { data: balances } = useBalancesState()
  const [open, setOpen] = useState(false)

  return (
    <>
      <IconButton size="2" radius="full" color="indigo" onClick={() => setOpen(true)}>
        <IconWallet size={20} />
      </IconButton>

      <Dialog title="Your Balances" open={open} onOpenChange={setOpen}>
        <div className={styles.tokenList}>
          {Object.entries(balances ?? {}).map(([token, balance], index) => (
            <div key={index} className={styles.tokenItem}>
              <div className={styles.tokenItemLeft}>
                {TokenMap[token]?.icon ?? DefaultIcon}
                <Text size="4" weight="medium">
                  {token.toUpperCase()}
                </Text>
              </div>

              <div className={styles.tokenItemRight}>
                <Text size="3" weight="medium">
                  {balance}
                </Text>
              </div>
            </div>
          ))}
        </div>
      </Dialog>
    </>
  )
}

export default WalletButton
