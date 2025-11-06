export function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded ${className}`}
      style={{
        animation: "shimmer 2s infinite linear",
      }}
    />
  );
}

export function SkeletonText({ lines = 1, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBox
          key={i}
          className={`h-4 ${i === lines - 1 && lines > 1 ? "w-3/4" : "w-full"}`}
        />
      ))}
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <SkeletonBox className="w-full h-64" />
      <div className="p-6 space-y-4">
        <SkeletonText lines={1} className="h-6" />
        <SkeletonText lines={2} />
        <div className="flex justify-between items-center mt-4">
          <SkeletonBox className="h-8 w-20" />
          <SkeletonBox className="h-10 w-32" />
        </div>
      </div>
    </div>
  );
}

export function ProductPageSkeleton() {
  return (
    <div className="min-h-screen bg-cream-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image skeleton */}
          <SkeletonBox className="w-full h-96 lg:h-[600px]" />

          {/* Details skeleton */}
          <div className="space-y-6">
            <SkeletonText lines={1} className="h-10 w-3/4" />
            <SkeletonBox className="h-12 w-24" />
            <SkeletonText lines={4} />

            <div className="space-y-4 pt-6">
              <SkeletonBox className="h-12 w-full" />
              <SkeletonBox className="h-12 w-full" />
            </div>

            <div className="pt-6 space-y-3">
              <SkeletonText lines={1} className="h-6" />
              <SkeletonText lines={3} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2 flex-1">
          <SkeletonBox className="h-6 w-32" />
          <SkeletonBox className="h-4 w-48" />
        </div>
        <SkeletonBox className="h-8 w-24" />
      </div>
      <SkeletonText lines={2} />
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between">
          <SkeletonBox className="h-6 w-20" />
          <SkeletonBox className="h-6 w-24" />
        </div>
      </div>
    </div>
  );
}

export function CartItemSkeleton() {
  return (
    <div className="flex gap-4 p-4 bg-white rounded-lg shadow-sm">
      <SkeletonBox className="w-20 h-20 flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <SkeletonText lines={1} className="h-5 w-3/4" />
        <SkeletonBox className="h-4 w-20" />
        <div className="flex justify-between items-center">
          <SkeletonBox className="h-8 w-24" />
          <SkeletonBox className="h-6 w-16" />
        </div>
      </div>
    </div>
  );
}

export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="border-b border-gray-200">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <SkeletonBox className="h-6 w-full" />
        </td>
      ))}
    </tr>
  );
}
