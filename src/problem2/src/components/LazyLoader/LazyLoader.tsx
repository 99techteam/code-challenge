import { Suspense, ReactNode } from 'react'

const DefaultFallback = () => (
  <div className='animate-pulse space-y-4 p-4 bg-gray-100 rounded-lg'>
    <div className='h-4 bg-gray-300 rounded w-3/4'></div>
    <div className='h-4 bg-gray-300 rounded w-1/2'></div>
    <div className='h-4 bg-gray-300 rounded w-full'></div>
  </div>
)

interface LazyLoaderProps {
  children: ReactNode
  fallback?: ReactNode
}

const LazyLoader = ({ children, fallback = <DefaultFallback /> }: LazyLoaderProps) => {
  return <Suspense fallback={fallback}>{children}</Suspense>
}

export default LazyLoader
