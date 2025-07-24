import React, { forwardRef, useState } from 'react'
import clsx from 'clsx'
import styles from './styles.module.css'
import ClickAwayListener from 'react-click-away-listener'

export type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean
  wrapperClassName?: string
  leftSlot?: React.ReactNode
  fullWidth?: boolean
}

const Input = forwardRef<HTMLInputElement, Props>(
  ({ leftSlot, className, error, wrapperClassName, fullWidth, ...props }, ref) => {
    const [focused, setFocused] = useState(false)

    return (
      <ClickAwayListener
        onClickAway={() => {
          setFocused(false)
        }}
      >
        <div
          onFocus={() => {
            setFocused(true)
          }}
          onBlur={() => {
            setFocused(false)
          }}
          className={clsx(
            styles.wrapper,
            wrapperClassName,
            { [styles.focused]: focused },
            { [styles.error]: error },
            { [styles.fullWidth]: fullWidth },
          )}
        >
          {leftSlot}
          <input
            className={clsx(styles.input, className)}
            aria-invalid={!!error}
            ref={ref}
            {...props}
          />
        </div>
      </ClickAwayListener>
    )
  },
)

export default Input
