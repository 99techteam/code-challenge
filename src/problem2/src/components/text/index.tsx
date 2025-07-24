import { Text as TextComponent, type TextProps } from '@radix-ui/themes'
import clsx from 'clsx'
import styles from './styles.module.css'

type Props = TextProps & {
  variant?: 'primary' | 'secondary' | 'highlight' | 'success' | 'error' | 'warning'
}

const Text = ({ variant = 'primary', className, ...props }: Props) => {
  return (
    <TextComponent
      className={clsx(className, {
        [styles.primary]: variant === 'primary',
        [styles.secondary]: variant === 'secondary',
        [styles.highlight]: variant === 'highlight',
        [styles.success]: variant === 'success',
        [styles.error]: variant === 'error',
        [styles.warning]: variant === 'warning',
      })}
      {...props}
    />
  )
}

export default Text
