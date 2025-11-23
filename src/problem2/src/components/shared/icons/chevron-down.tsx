import { memo } from 'react'

type Props = {
  className?: string
  solid?: boolean
}

const ChevronDown = ({ className, solid = false }: Props) => (
  <svg
    viewBox='0 0 24 24'
    fill={solid ? 'currentColor' : 'none'}
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className={className}
  >
    <path d='m6 9 6 6 6-6' />
  </svg>
)

export default memo(ChevronDown)
