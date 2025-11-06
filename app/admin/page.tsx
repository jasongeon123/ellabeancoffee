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

  // === USER STATISTICS ===
  const totalUsers = await prisma.user.count();
  const usersByRole = await prisma.user.groupBy({
    by: ["role"],
    _count: true,
  });

  // === PRODUCT STATISTICS ===
  const totalProducts = await prisma.product.count();
  const inStockProducts = await prisma.product.count({
    where: { inStock: true },
  });
  const outOfStockProducts = totalProducts - inStockProducts;
  const lowStockProducts = await prisma.product.count({
    where: {
      inStock: true,
      stockQuantity: { lte: 10, not: null },
    },
  });

  // === ORDER STATISTICS ===
  const totalOrders = await prisma.order.count();
  const pendingOrders = await prisma.order.count({
    where: { status: "pending" },
  });
  const completedOrders = await prisma.order.count({
    where: { status: "completed" },
  });
  const cancelledOrders = await prisma.order.count({
    where: { status: "cancelled" },
  });

  // === REVENUE STATISTICS ===
  const allCompletedOrders = await prisma.order.findMany({
    where: { status: "completed" },
  });
  const totalRevenue = allCompletedOrders.reduce(
    (sum, order) => sum + order.total,
    0
  );

  // Revenue this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const thisMonthOrders = await prisma.order.findMany({
    where: {
      status: "completed",
      createdAt: { gte: startOfMonth },
    },
  });
  const thisMonthRevenue = thisMonthOrders.reduce(
    (sum, order) => sum + order.total,
    0
  );

  const averageOrderValue =
    allCompletedOrders.length > 0
      ? totalRevenue / allCompletedOrders.length
      : 0;

  // === TOP SELLING PRODUCTS ===
  const topProducts = await prisma.orderItem.groupBy({
    by: ["productId"],
    _sum: {
      quantity: true,
    },
    orderBy: {
      _sum: {
        quantity: "desc",
      },
    },
    take: 5,
  });

  const topProductsWithDetails = await Promise.all(
    topProducts.map(async (item) => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });
      return {
        ...product,
        totalSold: item._sum.quantity || 0,
      };
    })
  );

  // === RECENT ORDERS ===
  const recentOrders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  // === OTHER STATISTICS ===
  const activeLocations = await prisma.location.count({
    where: { active: true },
  });
  const totalReviews = await prisma.review.count();
  const pendingReviews = await prisma.review.count({
    where: { status: "pending" },
  });
  const flaggedReviews = await prisma.review.count({
    where: { flagged: true },
  });
  const totalPageViews = await prisma.analytics.count();

  return (
    <div className="min-h-screen bg-coffee-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-light text-coffee-900 tracking-tight">
            Admin Dashboard
          </h1>
          <Link
            href="/admin/users"
            className="px-4 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 transition-colors"
          >
            Manage Users
          </Link>
        </div>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md border border-coffee-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-coffee-600 text-sm uppercase tracking-wide mb-1">
                  Total Users
                </p>
                <p className="text-3xl font-light text-coffee-900">{totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-coffee-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-coffee-600 text-sm uppercase tracking-wide mb-1">
                  Total Revenue
                </p>
                <p className="text-3xl font-light text-coffee-900">
                  ${totalRevenue.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-coffee-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-coffee-600 text-sm uppercase tracking-wide mb-1">
                  Total Orders
                </p>
                <p className="text-3xl font-light text-coffee-900">{totalOrders}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-coffee-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-coffee-600 text-sm uppercase tracking-wide mb-1">
                  Total Products
                </p>
                <p className="text-3xl font-light text-coffee-900">{totalProducts}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Statistics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* User Breakdown */}
          <div className="bg-white rounded-lg shadow-md border border-coffee-200 p-6">
            <h2 className="text-xl font-medium text-coffee-900 mb-4">
              Users by Role
            </h2>
            <div className="space-y-3">
              {usersByRole.map((roleGroup) => (
                <div key={roleGroup.role} className="flex justify-between items-center">
                  <span className="text-coffee-700 capitalize">
                    {roleGroup.role === "admin" ? "Admins" : "Customers"}
                  </span>
                  <span className="font-semibold text-coffee-900">
                    {roleGroup._count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="bg-white rounded-lg shadow-md border border-coffee-200 p-6">
            <h2 className="text-xl font-medium text-coffee-900 mb-4">
              Revenue Stats
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-coffee-700">This Month</span>
                <span className="font-semibold text-green-600">
                  ${thisMonthRevenue.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-coffee-700">Avg Order Value</span>
                <span className="font-semibold text-coffee-900">
                  ${averageOrderValue.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-coffee-700">Completed Orders</span>
                <span className="font-semibold text-coffee-900">
                  {completedOrders}
                </span>
              </div>
            </div>
          </div>

          {/* Order Status Breakdown */}
          <div className="bg-white rounded-lg shadow-md border border-coffee-200 p-6">
            <h2 className="text-xl font-medium text-coffee-900 mb-4">
              Order Status
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-yellow-700">Pending</span>
                <span className="font-semibold text-yellow-700">
                  {pendingOrders}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-green-700">Completed</span>
                <span className="font-semibold text-green-700">
                  {completedOrders}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-red-700">Cancelled</span>
                <span className="font-semibold text-red-700">
                  {cancelledOrders}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Product & Inventory Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md border border-coffee-200 p-6 text-center">
            <p className="text-coffee-600 text-sm uppercase tracking-wide mb-2">
              In Stock
            </p>
            <p className="text-3xl font-light text-green-600">{inStockProducts}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md border border-coffee-200 p-6 text-center">
            <p className="text-coffee-600 text-sm uppercase tracking-wide mb-2">
              Out of Stock
            </p>
            <p className="text-3xl font-light text-red-600">{outOfStockProducts}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md border border-coffee-200 p-6 text-center">
            <p className="text-coffee-600 text-sm uppercase tracking-wide mb-2">
              Low Stock
            </p>
            <p className="text-3xl font-light text-yellow-600">{lowStockProducts}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md border border-coffee-200 p-6 text-center">
            <p className="text-coffee-600 text-sm uppercase tracking-wide mb-2">
              Page Views
            </p>
            <p className="text-3xl font-light text-blue-600">{totalPageViews}</p>
          </div>
        </div>

        {/* Two Column Layout for Top Products and Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Selling Products */}
          <div className="bg-white rounded-lg shadow-md border border-coffee-200 p-6">
            <h2 className="text-xl font-medium text-coffee-900 mb-4">
              Top Selling Products
            </h2>
            <div className="space-y-3">
              {topProductsWithDetails.length > 0 ? (
                topProductsWithDetails.map((product, index) => (
                  <div
                    key={product?.id}
                    className="flex items-center justify-between border-b border-coffee-100 pb-3 last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-coffee-400">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="text-coffee-900 font-medium">
                          {product?.name}
                        </p>
                        <p className="text-sm text-coffee-600">
                          ${product?.price?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-coffee-900 font-semibold">
                        {product?.totalSold}
                      </p>
                      <p className="text-xs text-coffee-600">sold</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-coffee-600 text-center py-4">
                  No sales data yet
                </p>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-md border border-coffee-200 p-6">
            <h2 className="text-xl font-medium text-coffee-900 mb-4">
              Recent Orders
            </h2>
            <div className="space-y-3">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between border-b border-coffee-100 pb-3 last:border-b-0"
                  >
                    <div>
                      <p className="text-coffee-900 font-medium">
                        {order.user?.name || order.user?.email || order.guestEmail || "Guest"}
                      </p>
                      <p className="text-sm text-coffee-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-coffee-900 font-semibold">
                        ${order.total.toFixed(2)}
                      </p>
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded ${
                          order.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : order.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-coffee-600 text-center py-4">
                  No orders yet
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/admin/products"
            className="bg-white rounded-lg shadow-md border border-coffee-200 p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-lg font-medium text-coffee-900 mb-2">
              Manage Products
            </h2>
            <p className="text-coffee-600 text-sm">Add, edit, or remove products</p>
          </Link>
          <Link
            href="/admin/bulk-products"
            className="bg-white rounded-lg shadow-md border border-coffee-200 p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-lg font-medium text-coffee-900 mb-2">
              Bulk Products
            </h2>
            <p className="text-coffee-600 text-sm">Import/export CSV files</p>
          </Link>
          <Link
            href="/admin/orders"
            className="bg-white rounded-lg shadow-md border border-coffee-200 p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-lg font-medium text-coffee-900 mb-2">
              Manage Orders
            </h2>
            <p className="text-coffee-600 text-sm">View and update orders</p>
          </Link>
          <Link
            href="/admin/analytics"
            className="bg-white rounded-lg shadow-md border border-coffee-200 p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-lg font-medium text-coffee-900 mb-2">
              View Analytics
            </h2>
            <p className="text-coffee-600 text-sm">Detailed site traffic metrics</p>
          </Link>
          <Link
            href="/admin/reviews"
            className="bg-white rounded-lg shadow-md border border-coffee-200 p-6 hover:shadow-lg transition-shadow relative"
          >
            <h2 className="text-lg font-medium text-coffee-900 mb-2">
              Review Moderation
              {(pendingReviews > 0 || flaggedReviews > 0) && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                  {pendingReviews + flaggedReviews}
                </span>
              )}
            </h2>
            <p className="text-coffee-600 text-sm">Moderate customer reviews</p>
          </Link>
          <Link
            href="/admin/reports"
            className="bg-white rounded-lg shadow-md border border-coffee-200 p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-lg font-medium text-coffee-900 mb-2">
              Sales Reports
            </h2>
            <p className="text-coffee-600 text-sm">Revenue trends and insights</p>
          </Link>
          <Link
            href="/admin/locations"
            className="bg-white rounded-lg shadow-md border border-coffee-200 p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-lg font-medium text-coffee-900 mb-2">
              Manage Locations
            </h2>
            <p className="text-coffee-600 text-sm">Update bulletin board locations</p>
          </Link>
          <Link
            href="/admin/subscriptions"
            className="bg-white rounded-lg shadow-md border border-coffee-200 p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-lg font-medium text-coffee-900 mb-2">
              Subscription Settings
            </h2>
            <p className="text-coffee-600 text-sm">Configure subscription frequencies and discounts</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
