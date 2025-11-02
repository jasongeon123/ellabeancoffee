export default function Loading() {
  return (
    <div className="min-h-screen bg-coffee-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-800 mb-4"></div>
        <p className="text-coffee-700 font-light">Loading...</p>
      </div>
    </div>
  );
}
