import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Pool } from '@neondatabase/serverless';
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function InventoryPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    // Get all products with stock information
    const result = await pool.query(
      `SELECT
        p.id,
        p.name,
        p.price,
        p.stock,
        COALESCE(
          json_agg(
            json_build_object(
              'quantity', oi.quantity,
              'createdAt', oi."createdAt"
            ) ORDER BY oi."createdAt" DESC
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) as "orderItems"
      FROM "Product" p
      LEFT JOIN "OrderItem" oi ON p.id = oi."productId"
      GROUP BY p.id, p.name, p.price, p.stock
      ORDER BY p.name ASC`
    );

    await pool.end();

    const products = result.rows;

    // Calculate sales velocity and forecasting for each product
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const inventoryData = products.map((product: any) => {
      // Get sales in last 30 days
      const recentSales = product.orderItems.filter(
        (item: any) => new Date(item.createdAt) >= thirtyDaysAgo
      );
      const totalSold30Days = recentSales.reduce(
        (sum: number, item: any) => sum + item.quantity,
        0
      );

      // Calculate daily sales velocity
      const dailyVelocity = totalSold30Days / 30;

      // Calculate days until out of stock
      const daysUntilOutOfStock =
        dailyVelocity > 0 ? Math.floor(product.stock / dailyVelocity) : Infinity;

      // Determine stock status
      let status: "out" | "critical" | "low" | "good";
      let statusColor: string;
      let statusText: string;

      if (product.stock === 0) {
        status = "out";
        statusColor = "bg-red-500";
        statusText = "Out of Stock";
      } else if (product.stock <= 5) {
        status = "critical";
        statusColor = "bg-red-400";
        statusText = "Critical";
      } else if (product.stock <= 10) {
        status = "low";
        statusColor = "bg-yellow-400";
        statusText = "Low Stock";
      } else {
        status = "good";
        statusColor = "bg-green-500";
        statusText = "Good";
      }

      // Reorder recommendation
      const shouldReorder = daysUntilOutOfStock < 14 && dailyVelocity > 0;

      return {
        ...product,
        totalSold30Days,
        dailyVelocity,
        daysUntilOutOfStock,
        status,
        statusColor,
        statusText,
        shouldReorder,
      };
    });

    // Summary stats
    const totalProducts = products.length;
    const outOfStock = inventoryData.filter((p: any) => p.stock === 0).length;
    const lowStock = inventoryData.filter((p: any) => p.stock > 0 && p.stock <= 10)
      .length;
    const totalInventoryValue = inventoryData.reduce(
      (sum: number, p: any) => sum + parseFloat(p.price) * p.stock,
      0
    );
    const needsReorder = inventoryData.filter((p: any) => p.shouldReorder).length;

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/admin"
              className="text-coffee-600 hover:text-coffee-700 mb-4 inline-block"
            >
              ← Back to Admin Dashboard
            </Link>
            <h1 className="text-3xl font-bold mb-2">Inventory Management</h1>
            <p className="text-gray-600">
              Track stock levels and sales forecasting
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm text-gray-600 mb-1">Total Products</div>
              <div className="text-3xl font-bold">{totalProducts}</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm text-gray-600 mb-1">Out of Stock</div>
              <div className="text-3xl font-bold text-red-600">{outOfStock}</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm text-gray-600 mb-1">Low Stock</div>
              <div className="text-3xl font-bold text-yellow-600">{lowStock}</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm text-gray-600 mb-1">Inventory Value</div>
              <div className="text-3xl font-bold text-green-600">
                ${totalInventoryValue.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Reorder Alerts */}
          {needsReorder > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
              <div className="flex items-center gap-3 mb-2">
                <svg
                  className="w-6 h-6 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <h3 className="text-lg font-bold text-orange-800">
                  Reorder Alert
                </h3>
              </div>
              <p className="text-orange-700">
                {needsReorder} product(s) need to be reordered soon based on sales
                velocity
              </p>
            </div>
          )}

          {/* Inventory Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      30-Day Sales
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Daily Velocity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Days Until Out
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Stock Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inventoryData.map((product: any) => (
                    <tr
                      key={product.id}
                      className={product.shouldReorder ? "bg-orange-50" : ""}
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {product.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        ${parseFloat(product.price).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-bold">{product.stock}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-white text-xs font-medium ${product.statusColor}`}
                        >
                          {product.statusText}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        {product.totalSold30Days} units
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        {product.dailyVelocity.toFixed(2)}/day
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.daysUntilOutOfStock === Infinity ? (
                          <span className="text-gray-400">N/A</span>
                        ) : (
                          <span
                            className={
                              product.daysUntilOutOfStock < 14
                                ? "text-red-600 font-bold"
                                : product.daysUntilOutOfStock < 30
                                ? "text-yellow-600"
                                : "text-gray-900"
                            }
                          >
                            {product.daysUntilOutOfStock} days
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        ${(parseFloat(product.price) * product.stock).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.shouldReorder && (
                          <span className="text-orange-600 text-sm font-medium">
                            Reorder Soon
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Forecasting Explanation */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-bold text-blue-900 mb-2">
              About Inventory Forecasting
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • <strong>Daily Velocity:</strong> Average units sold per day over
                the last 30 days
              </li>
              <li>
                • <strong>Days Until Out:</strong> Estimated days until stock runs
                out based on current sales velocity
              </li>
              <li>
                • <strong>Reorder Alert:</strong> Products with less than 14 days
                of stock remaining need reordering
              </li>
              <li>
                • <strong>Status Levels:</strong> Critical (≤5), Low (6-10), Good
                (11+)
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Failed to fetch inventory:", error);
    await pool.end();
    throw error;
  }
}
