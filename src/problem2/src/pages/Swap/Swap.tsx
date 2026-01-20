import SwapForm from 'src/components/SwapForm'

export default function Swap() {
  return (
    <div className='relative min-h-screen overflow-hidden bg-[#0f0f1a]'>
      {/* Animated gradient background */}
      <div className='absolute inset-0'>
        {/* Main gradient mesh */}
        <div className='absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950' />

        {/* Animated orbs */}
        <div className='absolute -left-40 -top-40 h-[500px] w-[500px] animate-pulse rounded-full bg-gradient-to-br from-indigo-600/30 to-purple-600/20 blur-[100px]' />
        <div className='absolute -right-40 top-1/4 h-[400px] w-[400px] animate-pulse rounded-full bg-gradient-to-bl from-blue-600/25 to-cyan-600/15 blur-[80px]' style={{ animationDelay: '1s' }} />
        <div className='absolute -bottom-40 left-1/3 h-[450px] w-[450px] animate-pulse rounded-full bg-gradient-to-tr from-purple-600/25 to-pink-600/15 blur-[90px]' style={{ animationDelay: '2s' }} />

        {/* Grid pattern overlay */}
        <div
          className='absolute inset-0 opacity-[0.03]'
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />

        {/* Radial gradient overlay for depth */}
        <div className='absolute inset-0 bg-gradient-to-t from-[#0f0f1a] via-transparent to-transparent' />
      </div>

      <div className='relative z-10 flex flex-col items-center px-4 py-12'>
        {/* Header */}
        <div className='mb-8 text-center'>
          <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 backdrop-blur-sm'>
            <svg className='h-5 w-5 text-indigo-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4'
              />
            </svg>
            <span className='font-medium text-indigo-300'>Token Swap</span>
          </div>
          <h1 className='mb-3 bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl'>
            Swap Tokens Instantly
          </h1>
          <p className='max-w-md text-gray-400'>Exchange your tokens at the best rates. Fast, secure, and easy to use.</p>
        </div>

        {/* Swap Card */}
        <div className='w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl sm:p-8'>
          <SwapForm />
        </div>

        {/* Footer Stats */}
        <div className='mt-10 grid grid-cols-3 gap-8 text-center'>
          <div className='group'>
            <div className='mb-1 text-2xl font-bold text-white transition-colors group-hover:text-indigo-400'>100+</div>
            <div className='text-sm text-gray-500'>Supported Tokens</div>
          </div>
          <div className='group'>
            <div className='mb-1 text-2xl font-bold text-white transition-colors group-hover:text-green-400'>0%</div>
            <div className='text-sm text-gray-500'>Platform Fee</div>
          </div>
          <div className='group'>
            <div className='mb-1 text-2xl font-bold text-white transition-colors group-hover:text-purple-400'>Instant</div>
            <div className='text-sm text-gray-500'>Transactions</div>
          </div>
        </div>

        {/* Trust badges */}
        <div className='mt-10 flex items-center gap-8'>
          <div className='flex items-center gap-2 text-gray-500 transition-colors hover:text-emerald-400'>
            <svg className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
              />
            </svg>
            <span className='text-sm font-medium'>Secure</span>
          </div>
          <div className='flex items-center gap-2 text-gray-500 transition-colors hover:text-yellow-400'>
            <svg className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 10V3L4 14h7v7l9-11h-7z' />
            </svg>
            <span className='text-sm font-medium'>Fast</span>
          </div>
          <div className='flex items-center gap-2 text-gray-500 transition-colors hover:text-blue-400'>
            <svg className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
            <span className='text-sm font-medium'>Best Rates</span>
          </div>
        </div>

        {/* Floating particles decoration */}
        <div className='pointer-events-none absolute inset-0 overflow-hidden'>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className='absolute h-1 w-1 rounded-full bg-indigo-400/40'
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
                animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* CSS Animation for floating particles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.4; }
          50% { transform: translateY(-20px) scale(1.2); opacity: 0.8; }
        }
      `}</style>
    </div>
  )
}
