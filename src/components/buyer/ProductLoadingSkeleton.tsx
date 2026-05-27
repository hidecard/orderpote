export default function ProductLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#f8fbfc]">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header Card Skeleton */}
        <div className="mb-6 rounded-[1.5rem] overflow-hidden bg-white shadow-2xl border border-gray-100">
          <div className="bg-[#1a7f8c] px-6 py-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="h-10 bg-[#0f5a66] rounded-lg w-3/4 animate-pulse"></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-[#0f5a66] animate-pulse"></div>
                <div className="text-right">
                  <div className="h-3 bg-[#0f5a66] rounded w-16 mb-2 animate-pulse"></div>
                  <div className="h-5 bg-[#0f5a66] rounded w-24 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Image Skeleton */}
          <div className="p-4 bg-white">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-200 animate-pulse">
              <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer"></div>
            </div>
          </div>
        </div>

        {/* Product Info Skeleton */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          {/* Title */}
          <div className="mb-4">
            <div className="h-8 bg-gray-200 rounded-lg w-3/4 mb-2 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded-lg w-1/2 animate-pulse"></div>
          </div>

          {/* Rating Skeleton */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-4 h-4 bg-gray-200 rounded-full animate-pulse"></div>
              ))}
            </div>
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>

          {/* Price Skeleton */}
          <div className="mb-4">
            <div className="h-10 bg-gradient-to-r from-[#1a7f8c] to-[#0f5a66] rounded-lg w-1/3 animate-pulse"></div>
          </div>

          {/* Description Skeleton */}
          <div className="mb-4 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
          </div>

          {/* Size Options Skeleton */}
          <div className="mb-4">
            <div className="h-5 bg-gray-200 rounded w-32 mb-3 animate-pulse"></div>
            <div className="flex flex-wrap gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded-lg w-16 animate-pulse"></div>
              ))}
            </div>
          </div>

          {/* Color Options Skeleton */}
          <div className="mb-6">
            <div className="h-5 bg-gray-200 rounded w-32 mb-3 animate-pulse"></div>
            <div className="flex flex-wrap gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
              ))}
            </div>
          </div>

          {/* Quantity & Buttons Skeleton */}
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="h-10 bg-gray-200 rounded-lg w-24 animate-pulse"></div>
              <div className="flex-1 h-10 bg-gradient-to-r from-[#1a7f8c] to-[#0f5a66] rounded-lg animate-pulse"></div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="flex-1 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Reviews Section Skeleton */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border-b pb-4 last:border-b-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-1 animate-pulse"></div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, j) => (
                        <div key={j} className="w-3 h-3 bg-gray-200 rounded-full animate-pulse"></div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
