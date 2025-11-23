import { memo } from 'react'

type Props = {
  className?: string
  solid?: boolean
}

const ArrowUpDown = ({ className, solid = false }: Props) => (
  <svg
    viewBox='0 0 24 24'
    fill={solid ? 'currentColor' : 'none'}
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className={className}
  >
    <path d='m21 16-4 4-4-4' />
    <path d='M17 20V4' />
    <path d='m3 8 4-4 4 4' />
    <path d='M7 4v16' />
  </svg>
)

export default memo(ArrowUpDown)
