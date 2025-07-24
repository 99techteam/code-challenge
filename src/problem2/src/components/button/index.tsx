import { Button as RadixButton, type ButtonProps } from '@radix-ui/themes'
import clsx from 'clsx'
import styles from './styles.module.css'

type Props = ButtonProps & {
  fullWidth?: boolean
}

const Button = ({ className, fullWidth, ...props }: Props) => {
  return (
    <RadixButton
      className={clsx(styles.button, className, { [styles.fullWidth]: fullWidth })}
      {...props}
    />
  )
}

export default Button
