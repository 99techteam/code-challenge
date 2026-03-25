import { Skeleton } from '@/components/ui/skeleton'

function FieldSkeleton() {
  return (
    <div className='flex flex-col gap-2 w-full'>
      <Skeleton className="h-5 w-30" />
      <Skeleton className="h-8 w-full" />
    </div>
  )
}

export function TokenExchangeFormSkeleton() {
  return (
    <div className='flex flex-col gap-4 w-full max-w-xs items-center'>
      <FieldSkeleton />
      <FieldSkeleton />

      <Skeleton className="h-12 w-12 rounded-full" />

      <FieldSkeleton />
      <FieldSkeleton />

      <Skeleton className="h-10 w-full mt-5 rounded-xl" />
    </div>
  )
}
