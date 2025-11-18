import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Pool } from '@neondatabase/serverless';
import { redirect } from "next/navigation";

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    // E-COMMERCE METRICS - Total Revenue
    const ordersResult = await pool.query(
      `SELECT
        o.total,
        o."createdAt",
        COALESCE(
          json_agg(
            json_build_object(
              'quantity', oi.quantity,
              'price', oi.price,
              'product', json_build_object(
                'id', p.id,
                'name', p.name
              )
            )
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) as items
      FROM "Order" o
      LEFT JOIN "OrderItem" oi ON o.id = oi."orderId"
      LEFT JOIN "Product" p ON oi."productId" = p.id
      WHERE o.status IN ('completed', 'delivered', 'shipped')
      GROUP BY o.id, o.total, o."createdAt"`
    );

    const orders = ordersResult.rows;
    const totalRevenue = orders.reduce((sum: number, order: any) => sum + parseFloat(order.total), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Revenue by date (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentOrders = orders.filter(
      (order: any) => new Date(order.createdAt) >= thirtyDaysAgo
    );

    const revenueByDate = recentOrders.reduce((acc: any, order: any) => {
      const date = new Date(order.createdAt).toLocaleDateString();
      acc[date] = (acc[date] || 0) + parseFloat(order.total);
      return acc;
    }, {} as Record<string, number>);

    // Top selling products
    const productSales = orders.flatMap((order: any) => order.items).reduce((acc: any, item: any) => {
      const productId = item.product.id;
      if (!acc[productId]) {
        acc[productId] = {
          name: item.product.name,
          quantity: 0,
          revenue: 0,
        };
      }
      acc[productId].quantity += item.quantity;
      acc[productId].revenue += parseFloat(item.price) * item.quantity;
      return acc;
    }, {} as Record<string, { name: string; quantity: number; revenue: number }>);

    const topProducts = Object.entries(productSales)
      .sort(([, a]: any, [, b]: any) => b.quantity - a.quantity)
      .slice(0, 10);

    // Customer metrics
    const customersResult = await pool.query(
      `SELECT COUNT(*) FROM "User" WHERE role = 'user'`
    );
    const totalCustomers = parseInt(customersResult.rows[0].count);

    const customersWithOrdersResult = await pool.query(
      `SELECT COUNT(DISTINCT "userId") FROM "Order" WHERE "userId" IS NOT NULL`
    );
    const customersWithOrders = parseInt(customersWithOrdersResult.rows[0].count);

    // Get total analytics count
    const analyticsCountResult = await pool.query(
      `SELECT COUNT(*) FROM "Analytics"`
    );
    const totalPageViews = parseInt(analyticsCountResult.rows[0].count);

    // Get ALL analytics for accurate stats (grouped by path)
    const allAnalyticsResult = await pool.query(
      `SELECT path, timestamp FROM "Analytics"`
    );
    const allAnalytics = allAnalyticsResult.rows;

    // Get recent analytics for activity feed
    const recentAnalyticsResult = await pool.query(
      `SELECT id, path, timestamp, "userAgent"
       FROM "Analytics"
       ORDER BY timestamp DESC
       LIMIT 20`
    );
    const recentAnalytics = recentAnalyticsResult.rows;

    await pool.end();

    // Group by path (all time)
    const pageViews = allAnalytics.reduce((acc: any, item: any) => {
      acc[item.path] = (acc[item.path] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by date (all time)
    const viewsByDate = allAnalytics.reduce((acc: any, item: any) => {
      const date = new Date(item.timestamp).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return (
      <div className="min-h-screen bg-coffee-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-light text-coffee-900 mb-8 tracking-tight">
            Business Analytics
          </h1>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Revenue */}
            <div className="bg-white border border-coffee-200 p-6 rounded-lg">
              <h3 className="text-sm font-medium text-coffee-600 mb-2">
                Total Revenue
              </h3>
              <p className="text-3xl font-light text-green-600">
                ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-coffee-500 mt-1">
                {totalOrders} completed orders
              </p>
            </div>

            {/* Average Order Value */}
            <div className="bg-white border border-coffee-200 p-6 rounded-lg">
              <h3 className="text-sm font-medium text-coffee-600 mb-2">
                Avg. Order Value
              </h3>
              <p className="text-3xl font-light text-blue-600">
                ${averageOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-coffee-500 mt-1">
                Per transaction
              </p>
            </div>

            {/* Total Customers */}
            <div className="bg-white border border-coffee-200 p-6 rounded-lg">
              <h3 className="text-sm font-medium text-coffee-600 mb-2">
                Total Customers
              </h3>
              <p className="text-3xl font-light text-purple-600">
                {totalCustomers}
              </p>
              <p className="text-xs text-coffee-500 mt-1">
                {customersWithOrders} with orders
              </p>
            </div>

            {/* Page Views */}
            <div className="bg-white border border-coffee-200 p-6 rounded-lg">
              <h3 className="text-sm font-medium text-coffee-600 mb-2">
                Total Page Views
              </h3>
              <p className="text-3xl font-light text-orange-600">
                {totalPageViews.toLocaleString()}
              </p>
              <p className="text-xs text-coffee-500 mt-1">
                All time
              </p>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white border border-coffee-200 p-6 rounded-lg mb-8">
            <h2 className="text-2xl font-light text-coffee-900 mb-6">
              Top Selling Products
            </h2>
            <div className="space-y-4">
              {topProducts.map(([productId, data]: any) => (
                <div
                  key={productId}
                  className="flex justify-between items-center border-b border-coffee-100 pb-3"
                >
                  <div className="flex-1">
                    <p className="text-coffee-900 font-medium">{data.name}</p>
                    <p className="text-sm text-coffee-600">
                      {data.quantity} units sold
                    </p>
                  </div>
                  <p className="text-coffee-900 font-medium text-lg">
                    ${data.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
              {topProducts.length === 0 && (
                <p className="text-coffee-600 text-center py-4">
                  No sales data yet
                </p>
              )}
            </div>
          </div>

          {/* Revenue by Date (Last 30 Days) */}
          <div className="bg-white border border-coffee-200 p-6 rounded-lg mb-8">
            <h2 className="text-2xl font-light text-coffee-900 mb-6">
              Revenue (Last 30 Days)
            </h2>
            <div className="space-y-3">
              {Object.entries(revenueByDate)
                .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                .map(([date, revenue]: any) => (
                  <div
                    key={date}
                    className="flex justify-between items-center border-b border-coffee-100 pb-2"
                  >
                    <span className="text-coffee-900">{date}</span>
                    <div className="flex items-center gap-4">
                      <div className="w-48 h-2 bg-coffee-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{
                            width: `${(revenue / Math.max(...(Object.values(revenueByDate) as number[]))) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-coffee-900 font-medium w-24 text-right">
                        ${revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                ))}
              {Object.keys(revenueByDate).length === 0 && (
                <p className="text-coffee-600 text-center py-4">
                  No revenue data for the last 30 days
                </p>
              )}
            </div>
          </div>

          {/* Page Views Breakdown */}
          <div className="bg-white border border-coffee-200 p-6 mb-8">
            <h2 className="text-2xl font-light text-coffee-900 mb-6">
              Page Views by Path
            </h2>
            <div className="space-y-4">
              {Object.entries(pageViews)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .map(([path, count]) => (
                  <div
                    key={path}
                    className="flex justify-between items-center border-b border-coffee-100 pb-3"
                  >
                    <span className="text-coffee-900 font-mono">{path}</span>
                    <span className="text-coffee-700 font-medium">
                      {count as number} views
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
                      {count as number} views
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
              Recent Activity (Last 20)
            </h2>
            <div className="space-y-3">
              {recentAnalytics.slice(0, 20).map((item: any) => (
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
              {recentAnalytics.length === 0 && (
                <p className="text-coffee-600 text-center py-4">
                  No activity recorded yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Failed to fetch analytics:", error);
    await pool.end();
    throw error;
  }
}
