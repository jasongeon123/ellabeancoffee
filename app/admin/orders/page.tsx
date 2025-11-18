import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Pool } from '@neondatabase/serverless';
import { redirect } from "next/navigation";
import Link from "next/link";
import ChangeOrderStatusButton from "@/components/ChangeOrderStatusButton";

export default async function AdminOrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const result = await pool.query(
      `SELECT
        o.*,
        json_build_object(
          'name', u.name,
          'email', u.email
        ) as user,
        COALESCE(
          json_agg(
            json_build_object(
              'id', oi.id,
              'quantity', oi.quantity,
              'price', oi.price,
              'product', json_build_object(
                'id', p.id,
                'name', p.name,
                'description', p.description,
                'price', p.price,
                'category', p.category,
                'image', p.image
              )
            ) ORDER BY oi."createdAt"
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) as items
      FROM "Order" o
      LEFT JOIN "User" u ON o."userId" = u.id
      LEFT JOIN "OrderItem" oi ON o.id = oi."orderId"
      LEFT JOIN "Product" p ON oi."productId" = p.id
      GROUP BY o.id, u.name, u.email
      ORDER BY o."createdAt" DESC`
    );

    await pool.end();

    const orders = result.rows;

    const stats = {
      total: orders.length,
      pending: orders.filter((o: any) => o.status === "pending").length,
      completed: orders.filter((o: any) => o.status === "completed").length,
      cancelled: orders.filter((o: any) => o.status === "cancelled").length,
      revenue: orders
        .filter((o: any) => o.status === "completed")
        .reduce((sum: number, o: any) => sum + parseFloat(o.total), 0),
    };

    return (
      <div className="min-h-screen bg-coffee-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-light text-coffee-900 mb-8 tracking-tight">
            Order Management
          </h1>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white border border-coffee-200 rounded-lg p-4">
              <p className="text-sm text-coffee-600">Total Orders</p>
              <p className="text-2xl font-light text-coffee-900">{stats.total}</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-700">Pending</p>
              <p className="text-2xl font-light text-yellow-900">{stats.pending}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-700">Completed</p>
              <p className="text-2xl font-light text-green-900">{stats.completed}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">Cancelled</p>
              <p className="text-2xl font-light text-red-900">{stats.cancelled}</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-700">Revenue</p>
              <p className="text-2xl font-light text-purple-900">
                ${stats.revenue.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Orders List */}
          <div className="bg-white border border-coffee-200 rounded-lg overflow-hidden">
            {orders.length === 0 ? (
              <div className="p-12 text-center text-coffee-600">
                No orders yet.
              </div>
            ) : (
              <div className="divide-y divide-coffee-100">
                {orders.map((order: any) => (
                  <div key={order.id} className="p-6 hover:bg-coffee-50">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-lg font-medium text-coffee-900 hover:text-coffee-700 transition-colors"
                        >
                          {order.orderNumber}
                        </Link>
                        <p className="font-medium text-coffee-900 mt-1">
                          {order.user?.name || order.guestEmail || "Guest"}
                        </p>
                        <p className="text-sm text-coffee-600">
                          {order.user?.email || order.guestEmail}
                        </p>
                        <p className="text-xs text-coffee-500 mt-1">
                          {new Date(order.createdAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        {order.trackingNumber && (
                          <p className="text-xs text-coffee-600 mt-2">
                            📦 Tracking: {order.trackingNumber}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-light text-coffee-900 mb-2">
                          ${parseFloat(order.total).toFixed(2)}
                        </p>
                        <ChangeOrderStatusButton
                          orderId={order.id}
                          currentStatus={order.status}
                          customerEmail={order.user?.email || order.guestEmail || ""}
                        />
                      </div>
                    </div>

                    <div className="bg-coffee-50 rounded p-4">
                      <p className="text-xs text-coffee-600 uppercase mb-2">
                        Items
                      </p>
                      <div className="space-y-2">
                        {order.items.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-coffee-900">
                              {item.quantity}× {item.product.name}
                            </span>
                            <span className="text-coffee-600">
                              ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    await pool.end();
    throw error;
  }
}
