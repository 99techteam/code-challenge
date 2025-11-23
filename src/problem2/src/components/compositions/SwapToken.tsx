import ArrowUpDown from '../shared/icons/arrow-up-down'

type SwapTokenProps = {
  onClick?: () => void
}

const SwapToken = ({ onClick }: SwapTokenProps) => {
  return (
    <div className='absolute top-1/2 left-1/2 -translate-1/2 rounded-full bg-[#0F1921] p-2.5'>
      <button
        className='block cursor-pointer rounded-full border border-[rgba(255,255,255,0.02)] bg-[#131C24]'
        onClick={onClick}
      >
        <span className='block w-fit rounded-full bg-linear-to-b from-transparent to-white/0.5 p-2.5'>
          <ArrowUpDown className='size-6' />
        </span>
      </button>
    </div>
  )
}

export default SwapToken
