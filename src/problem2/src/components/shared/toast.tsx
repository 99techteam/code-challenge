import toast from 'react-hot-toast'

export const successToast = (msg: string) => {
  return toast.success(msg, {
    icon: '🎉',
    style: {
      maxWidth: '672px',
      fontSize: '14px',
      borderRadius: 'calc(infinity * 1px)',
      background: '#102233',
      color: '#fff'
    }
  })
}

export const errorToast = (msg: string) => {
  return toast.error(msg, {
    style: {
      maxWidth: '672px',
      fontSize: '14px',
      borderRadius: 'calc(infinity * 1px)',
      background: '#102233',
      color: '#fff'
    }
  })
}

export const notification = (title: string, msg: string) => {
  return toast.custom(
    t => (
      <div className='pointer-events-auto flex w-full max-w-md rounded-lg bg-[#102233] shadow-lg'>
        <div className='w-0 flex-1 p-4'>
          <div className='ml-3 flex-1'>
            <p className='text-sm font-medium text-white'>{title}</p>
            <p className='mt-1 text-sm text-white'>{msg}</p>
          </div>
        </div>
        <div className='flex border-l text-white/5'>
          <button
            onClick={() => toast.dismiss(t.id)}
            className='flex w-full cursor-pointer items-center justify-center rounded-none rounded-r-lg border border-transparent p-4 text-sm font-medium text-white'
          >
            Close
          </button>
        </div>
      </div>
    ),
    {
      duration: 15000
    }
  )
}
