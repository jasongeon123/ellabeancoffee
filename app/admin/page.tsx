import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/");
  }

  // Get analytics data
  const totalUsers = await prisma.user.count();
  const totalProducts = await prisma.product.count();
  const totalOrders = await prisma.order.count();
  const activeLocations = await prisma.location.count({
    where: { active: true },
  });

  // Get recent analytics
  const recentViews = await prisma.analytics.findMany({
    orderBy: { timestamp: "desc" },
    take: 10,
  });

  // Get revenue
  const orders = await prisma.order.findMany({
    where: { status: "completed" },
  });
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="min-h-screen bg-coffee-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-light text-coffee-900 mb-8 tracking-tight">
          Admin Dashboard
        </h1>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link
            href="/admin/products"
            className="bg-white border border-coffee-200 p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-medium text-coffee-900 mb-2">
              Manage Products
            </h2>
            <p className="text-coffee-600">Add, edit, or remove products</p>
          </Link>
          <Link
            href="/admin/locations"
            className="bg-white border border-coffee-200 p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-medium text-coffee-900 mb-2">
              Manage Locations
            </h2>
            <p className="text-coffee-600">Update bulletin board locations</p>
          </Link>
          <Link
            href="/admin/analytics"
            className="bg-white border border-coffee-200 p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-medium text-coffee-900 mb-2">
              View Analytics
            </h2>
            <p className="text-coffee-600">Detailed site traffic and metrics</p>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white border border-coffee-200 p-6">
            <p className="text-coffee-600 text-sm uppercase tracking-wide mb-2">
              Total Users
            </p>
            <p className="text-4xl font-light text-coffee-900">{totalUsers}</p>
          </div>
          <div className="bg-white border border-coffee-200 p-6">
            <p className="text-coffee-600 text-sm uppercase tracking-wide mb-2">
              Total Products
            </p>
            <p className="text-4xl font-light text-coffee-900">{totalProducts}</p>
          </div>
          <div className="bg-white border border-coffee-200 p-6">
            <p className="text-coffee-600 text-sm uppercase tracking-wide mb-2">
              Total Orders
            </p>
            <p className="text-4xl font-light text-coffee-900">{totalOrders}</p>
          </div>
          <div className="bg-white border border-coffee-200 p-6">
            <p className="text-coffee-600 text-sm uppercase tracking-wide mb-2">
              Total Revenue
            </p>
            <p className="text-4xl font-light text-coffee-900">
              ${totalRevenue.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-coffee-200 p-6">
          <h2 className="text-2xl font-light text-coffee-900 mb-6">
            Recent Site Activity
          </h2>
          <div className="space-y-3">
            {recentViews.length > 0 ? (
              recentViews.map((view) => (
                <div
                  key={view.id}
                  className="border-b border-coffee-100 pb-4 mb-4 last:border-b-0"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="text-coffee-900 font-medium">{view.path}</p>
                      {view.ip && (
                        <p className="text-coffee-700 text-sm font-mono mt-1">
                          IP: {view.ip}
                        </p>
                      )}
                    </div>
                    <p className="text-coffee-600 text-sm whitespace-nowrap ml-4">
                      {new Date(view.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-coffee-500 text-xs truncate">
                    {view.userAgent || "Unknown device"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-coffee-600">No analytics data yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
