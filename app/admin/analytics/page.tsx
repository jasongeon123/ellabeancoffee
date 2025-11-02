import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/");
  }

  // Get all analytics
  const allAnalytics = await prisma.analytics.findMany({
    orderBy: { timestamp: "desc" },
    take: 100,
  });

  // Group by path
  const pageViews = allAnalytics.reduce((acc, item) => {
    acc[item.path] = (acc[item.path] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Group by date
  const viewsByDate = allAnalytics.reduce((acc, item) => {
    const date = new Date(item.timestamp).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-coffee-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-light text-coffee-900 mb-8 tracking-tight">
          Site Analytics
        </h1>

        {/* Total Views */}
        <div className="bg-white border border-coffee-200 p-6 mb-8">
          <h2 className="text-2xl font-light text-coffee-900 mb-4">
            Total Page Views
          </h2>
          <p className="text-5xl font-light text-coffee-900">
            {allAnalytics.length}
          </p>
        </div>

        {/* Page Views Breakdown */}
        <div className="bg-white border border-coffee-200 p-6 mb-8">
          <h2 className="text-2xl font-light text-coffee-900 mb-6">
            Page Views by Path
          </h2>
          <div className="space-y-4">
            {Object.entries(pageViews)
              .sort(([, a], [, b]) => b - a)
              .map(([path, count]) => (
                <div
                  key={path}
                  className="flex justify-between items-center border-b border-coffee-100 pb-3"
                >
                  <span className="text-coffee-900 font-mono">{path}</span>
                  <span className="text-coffee-700 font-medium">
                    {count} views
                  </span>
                </div>
              ))}
            {Object.keys(pageViews).length === 0 && (
              <p className="text-coffee-600 text-center py-4">
                No page views recorded yet
              </p>
            )}
          </div>
        </div>

        {/* Views by Date */}
        <div className="bg-white border border-coffee-200 p-6 mb-8">
          <h2 className="text-2xl font-light text-coffee-900 mb-6">
            Views by Date
          </h2>
          <div className="space-y-4">
            {Object.entries(viewsByDate)
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
              .map(([date, count]) => (
                <div
                  key={date}
                  className="flex justify-between items-center border-b border-coffee-100 pb-3"
                >
                  <span className="text-coffee-900">{date}</span>
                  <span className="text-coffee-700 font-medium">
                    {count} views
                  </span>
                </div>
              ))}
            {Object.keys(viewsByDate).length === 0 && (
              <p className="text-coffee-600 text-center py-4">
                No analytics data yet
              </p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-coffee-200 p-6">
          <h2 className="text-2xl font-light text-coffee-900 mb-6">
            Recent Activity
          </h2>
          <div className="space-y-3">
            {allAnalytics.slice(0, 20).map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-start border-b border-coffee-100 pb-3"
              >
                <div className="flex-1">
                  <p className="text-coffee-900 font-mono text-sm">
                    {item.path}
                  </p>
                  <p className="text-coffee-600 text-xs mt-1">
                    {item.userAgent?.substring(0, 60)}...
                  </p>
                </div>
                <p className="text-coffee-600 text-sm ml-4 whitespace-nowrap">
                  {new Date(item.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
            {allAnalytics.length === 0 && (
              <p className="text-coffee-600 text-center py-4">
                No activity recorded yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
