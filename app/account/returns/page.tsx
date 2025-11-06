import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ReturnsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const userId = (session.user as any).id;

  // Get user's return requests
  const returns = await prisma.return.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  // Get orders eligible for returns (completed orders)
  const orders = await prisma.order.findMany({
    where: {
      userId,
      status: { in: ["completed", "delivered"] },
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-coffee-100 to-coffee-50 py-12 sm:py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-10 sm:mb-12">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-coffee-600 hover:text-coffee-900 mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Account
          </Link>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-light text-coffee-900 mb-3 tracking-tight">
            Returns & Refunds
          </h1>
          <p className="text-coffee-600 text-lg font-light">
            Manage your return requests
          </p>
        </div>

        {/* Existing Return Requests */}
        {returns.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-light text-coffee-900 mb-6 tracking-tight">
              Your Return Requests
            </h2>
            <div className="space-y-4">
              {returns.map((returnRequest) => (
                <div
                  key={returnRequest.id}
                  className="bg-white rounded-xl p-6 border border-coffee-200 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xs text-coffee-500 uppercase tracking-wider mb-1">
                        Return Request
                      </p>
                      <p className="text-lg font-light text-coffee-900">
                        Order {returnRequest.orderNumber}
                      </p>
                      <p className="text-sm text-coffee-600 mt-1">
                        Requested on {new Date(returnRequest.createdAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs uppercase tracking-wider font-medium ${
                          returnRequest.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : returnRequest.status === "approved"
                            ? "bg-blue-100 text-blue-700"
                            : returnRequest.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {returnRequest.status}
                      </span>
                      {returnRequest.refundAmount && (
                        <p className="text-sm text-coffee-600 mt-2">
                          Refund: ${returnRequest.refundAmount.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="border-t border-coffee-100 pt-4">
                    <p className="text-sm text-coffee-600 mb-2 font-medium">Reason:</p>
                    <p className="text-coffee-900 font-light">{returnRequest.reason}</p>
                    {returnRequest.adminNotes && (
                      <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-700 font-medium mb-1">Admin Notes:</p>
                        <p className="text-sm text-blue-900">{returnRequest.adminNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Eligible Orders for Returns */}
        <div>
          <h2 className="text-2xl font-light text-coffee-900 mb-6 tracking-tight">
            Eligible Orders
          </h2>
          {orders.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-coffee-200">
              <div className="inline-block p-6 bg-coffee-50 rounded-full mb-4">
                <svg className="w-12 h-12 text-coffee-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-light text-coffee-900 mb-2">No eligible orders</h3>
              <p className="text-coffee-600 font-light">
                Only completed or delivered orders are eligible for returns
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {orders.map((order) => {
                // Check if this order already has a pending/approved return
                const hasActiveReturn = returns.some(
                  (r) => r.orderNumber === order.orderNumber && ["pending", "approved"].includes(r.status)
                );

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-xl p-6 border border-coffee-200 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-xs text-coffee-500 uppercase tracking-wider mb-1">
                          Order #{order.orderNumber}
                        </p>
                        <p className="text-coffee-900 font-light">
                          {new Date(order.createdAt).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-light text-coffee-900">
                          ${order.total.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex gap-4 items-center">
                          <div className="flex-1">
                            <h4 className="text-coffee-900 font-light">{item.product.name}</h4>
                            <p className="text-sm text-coffee-600 font-light">
                              Qty: {item.quantity} × ${item.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {hasActiveReturn ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                        <p className="text-sm text-yellow-800 font-medium">
                          Return request already submitted for this order
                        </p>
                      </div>
                    ) : (
                      <Link
                        href={`/account/returns/request?orderNumber=${order.orderNumber}`}
                        className="block w-full text-center bg-coffee-900 text-white px-4 py-3 rounded-lg hover:bg-coffee-800 transition-colors font-medium"
                      >
                        Request Return
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
