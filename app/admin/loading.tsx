export default function Loading() {
  return (
    <div className="min-h-screen bg-coffee-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="animate-pulse">
          <div className="h-12 bg-coffee-200 rounded w-1/3 mb-8"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white border border-coffee-200 p-6">
                <div className="h-4 bg-coffee-200 rounded w-1/2 mb-4"></div>
                <div className="h-10 bg-coffee-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-coffee-200 p-6">
            <div className="h-8 bg-coffee-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-coffee-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
