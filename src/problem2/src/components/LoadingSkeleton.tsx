function LoadingSkeleton() {
  return (
    <div className="w-full max-w-3xl animate-pulse">
      <div className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-200/60 border border-gray-100">
        {/* Title */}
        <div className="h-6 bg-gray-100 rounded-lg w-14 mb-5" />

        {/* From input skeleton */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-3">
          <div className="h-3 bg-gray-200/60 rounded w-16 mb-3" />
          <div className="flex items-center justify-between">
            <div className="h-8 bg-gray-200/60 rounded-lg w-24" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gray-200 rounded-full" />
              <div className="h-5 bg-gray-200/60 rounded w-12" />
              <div className="h-4 bg-blue-100 rounded w-8" />
            </div>
          </div>
          <div className="h-3 bg-gray-100 rounded w-20 mt-2" />
        </div>

        {/* Swap button skeleton */}
        <div className="flex items-center py-1 -my-1">
          <div className="flex-1 flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 rounded" />
            <div className="h-3 bg-gray-100 rounded w-20" />
          </div>
          <div className="w-9 h-9 bg-gray-100 rounded-full border-2 border-gray-200" />
          <div className="flex-1" />
        </div>

        {/* To input skeleton */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-3 mt-1">
          <div className="h-3 bg-gray-200/60 rounded w-14 mb-3" />
          <div className="flex items-center justify-between">
            <div className="h-8 bg-gray-200/60 rounded-lg w-28" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gray-200 rounded-full" />
              <div className="h-5 bg-gray-200/60 rounded w-10" />
              <div className="h-4 bg-blue-100 rounded w-8" />
            </div>
          </div>
          <div className="h-3 bg-gray-100 rounded w-20 mt-2" />
        </div>

        {/* Rate info skeleton */}
        <div className="flex justify-between py-2">
          <div className="h-3 bg-gray-100 rounded w-20" />
          <div className="h-3 bg-gray-100 rounded w-36" />
        </div>

        {/* Button skeleton */}
        <div className="h-12 bg-blue-100 rounded-xl mt-3" />
      </div>
    </div>
  );
}

export default LoadingSkeleton;
