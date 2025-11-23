import { memo } from 'react'

type Props = {
  className?: string
  solid?: boolean
}

const EqualApproximately = ({ className, solid = false }: Props) => (
  <svg
    viewBox='0 0 24 24'
    fill={solid ? 'currentColor' : 'none'}
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className={className}
  >
    <path d='M5 15a6.5 6.5 0 0 1 7 0 6.5 6.5 0 0 0 7 0' />
    <path d='M5 9a6.5 6.5 0 0 1 7 0 6.5 6.5 0 0 0 7 0' />
  </svg>
)

export default memo(EqualApproximately)
