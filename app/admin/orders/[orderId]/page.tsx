import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import OrderTrackingForm from "@/components/OrderTrackingForm";

export default async function AdminOrderDetailsPage({
  params,
}: {
  params: { orderId: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/");
  }

  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      trackingUpdates: {
        orderBy: {
          timestamp: "desc",
        },
      },
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!order) {
    return (
      <div className="min-h-screen bg-coffee-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-light text-coffee-900 mb-8">
            Order Not Found
          </h1>
          <Link
            href="/admin/orders"
            className="text-coffee-700 hover:underline"
          >
            ← Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-coffee-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/orders"
            className="text-sm text-coffee-700 hover:underline mb-4 inline-block"
          >
            ← Back to Orders
          </Link>
          <h1 className="text-4xl font-light text-coffee-900 mb-2 tracking-tight">
            Order {order.orderNumber}
          </h1>
          <p className="text-coffee-600">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <div className="bg-white border border-coffee-200 rounded-lg p-6">
              <h2 className="text-xl font-light text-coffee-900 mb-4 tracking-tight">
                Customer Information
              </h2>
              <div className="space-y-2">
                <p className="text-coffee-900">
                  <span className="text-coffee-600">Name:</span>{" "}
                  {order.user?.name || order.guestEmail || "Guest"}
                </p>
                <p className="text-coffee-900">
                  <span className="text-coffee-600">Email:</span>{" "}
                  {order.user?.email || order.guestEmail}
                </p>
                <p className="text-coffee-900">
                  <span className="text-coffee-600">Type:</span>{" "}
                  {order.user ? "Registered User" : "Guest Checkout"}
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white border border-coffee-200 rounded-lg p-6">
              <h2 className="text-xl font-light text-coffee-900 mb-4 tracking-tight">
                Order Items
              </h2>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center py-3 border-b border-coffee-100 last:border-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-coffee-600 font-medium">
                        {item.quantity}×
                      </div>
                      <div>
                        <p className="text-coffee-900 font-medium">
                          {item.product.name}
                        </p>
                        <p className="text-sm text-coffee-600">
                          ${item.price.toFixed(2)} each
                        </p>
                      </div>
                    </div>
                    <p className="text-coffee-900 font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-coffee-200">
                <div className="flex justify-between text-lg font-medium text-coffee-900">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Tracking History */}
            <div className="bg-white border border-coffee-200 rounded-lg p-6">
              <h2 className="text-xl font-light text-coffee-900 mb-4 tracking-tight">
                Tracking History
              </h2>
              {order.trackingUpdates && order.trackingUpdates.length > 0 ? (
                <div className="space-y-4">
                  {order.trackingUpdates.map((update) => (
                    <div
                      key={update.id}
                      className="flex gap-4 pb-4 border-b border-coffee-100 last:border-0"
                    >
                      <div className="flex-shrink-0 w-2 h-2 mt-2 bg-coffee-700 rounded-full" />
                      <div className="flex-grow">
                        <p className="text-coffee-900 font-medium">
                          {update.message}
                        </p>
                        {update.location && (
                          <p className="text-sm text-coffee-600">
                            📍 {update.location}
                          </p>
                        )}
                        <p className="text-xs text-coffee-500 mt-1">
                          {new Date(update.timestamp).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-coffee-600 text-center py-4">
                  No tracking updates yet
                </p>
              )}
            </div>
          </div>

          {/* Sidebar - Update Tracking */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-coffee-200 rounded-lg p-6 sticky top-6">
              <h2 className="text-xl font-light text-coffee-900 mb-4 tracking-tight">
                Update Tracking
              </h2>
              <OrderTrackingForm order={order} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
