import { memo } from 'react'

type Props = {
  className?: string
  solid?: boolean
}

const CircleQuestionMark = ({ className, solid = false }: Props) => (
  <svg
    viewBox='0 0 24 24'
    fill={solid ? 'currentColor' : 'none'}
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    className={className}
  >
    <circle cx='12' cy='12' r='10' />
    <path d='M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' />
    <path d='M12 17h.01' />
  </svg>
)

export default memo(CircleQuestionMark)
