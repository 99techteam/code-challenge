import { Dialog as DialogRadix } from '@radix-ui/themes'
import { IconX } from '@tabler/icons-react'
import styles from './styles.module.css'

type Props = {
  title: string
  children: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
}

const Dialog = ({ title, children, open, onOpenChange }: Props) => {
  return (
    <DialogRadix.Root open={open} onOpenChange={onOpenChange}>
      <DialogRadix.Content className={styles.dialogContent} align="start">
        <div className={styles.dialogHeader}>
          <DialogRadix.Title>{title}</DialogRadix.Title>
          <DialogRadix.Close>
            <IconX />
          </DialogRadix.Close>
        </div>

        {children}
      </DialogRadix.Content>
    </DialogRadix.Root>
  )
}

export default Dialog
