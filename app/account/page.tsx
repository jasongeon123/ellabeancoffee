import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import DeleteAccountButton from "@/components/DeleteAccountButton";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const userId = (session.user as any).id;

  // Get user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      role: true,
      loyaltyPoints: true,
      createdAt: true,
    },
  });

  // Get order history
  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Get points history
  const pointsHistory = await prisma.pointsHistory.findMany({
    where: { userId },
    orderBy: {
      createdAt: "desc",
    },
    take: 10, // Show last 10 transactions
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-coffee-100 to-coffee-50 py-12 sm:py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-10 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-light text-coffee-900 mb-3 tracking-tight">
            My Account
          </h1>
          <p className="text-coffee-600 text-lg font-light">
            Manage your profile and view your order history
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Profile Info */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-coffee-200">
              <div className="mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-coffee-700 to-coffee-900 rounded-full flex items-center justify-center text-white text-3xl font-light mb-4">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <h2 className="text-2xl font-light text-coffee-900 mb-2 tracking-tight">
                  {user?.name || "User"}
                </h2>
                <p className="text-coffee-600 text-sm font-light">{user?.email}</p>
              </div>

              <div className="border-t border-coffee-100 pt-6 space-y-4">
                <div>
                  <p className="text-xs text-coffee-500 uppercase tracking-wider mb-1">Member Since</p>
                  <p className="text-coffee-900 font-light">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-coffee-500 uppercase tracking-wider mb-1">Total Orders</p>
                  <p className="text-coffee-900 font-light">{orders.length}</p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200">
                  <p className="text-xs text-amber-700 uppercase tracking-wider mb-2 font-medium">Loyalty Points</p>
                  <div className="flex items-baseline gap-2 mb-1">
                    <p className="text-3xl font-light text-amber-900">{user?.loyaltyPoints || 0}</p>
                    <span className="text-sm text-amber-700">points</span>
                  </div>
                  <p className="text-xs text-amber-600">Worth ${((user?.loyaltyPoints || 0) * 0.01).toFixed(2)} in rewards</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-coffee-100 space-y-3">
                <Link
                  href="/account/subscriptions"
                  className="block w-full text-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
                >
                  Manage Subscriptions
                </Link>
                <Link
                  href="/account/returns"
                  className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Returns & Refunds
                </Link>
                <Link
                  href="/account/change-email"
                  className="block w-full text-center px-4 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 transition-colors"
                >
                  Change Email
                </Link>
                <Link
                  href="/account/change-password"
                  className="block w-full text-center px-4 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 transition-colors"
                >
                  Change Password
                </Link>
                <DeleteAccountButton />
              </div>
            </div>
          </div>

          {/* Order History */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-coffee-200">
              <h2 className="text-2xl font-light text-coffee-900 mb-6 tracking-tight">
                Order History
              </h2>

              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-block p-6 bg-coffee-50 rounded-full mb-4">
                    <svg className="w-12 h-12 text-coffee-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-light text-coffee-900 mb-2">No orders yet</h3>
                  <p className="text-coffee-600 font-light mb-6">Start shopping to see your order history here</p>
                  <a
                    href="/#products"
                    className="inline-block bg-coffee-900 text-white px-8 py-3 rounded-full hover:bg-coffee-800 transition-all duration-300 uppercase text-xs tracking-widest font-medium shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    Browse Products
                  </a>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order, index) => (
                    <div
                      key={order.id}
                      className="border border-coffee-100 rounded-xl p-6 hover:shadow-md transition-all duration-300"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-xs text-coffee-500 uppercase tracking-wider mb-1">
                            Order Date
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
                          <p className="text-xs text-coffee-500 uppercase tracking-wider mb-1">
                            Total
                          </p>
                          <p className="text-2xl font-light text-coffee-900">
                            ${order.total.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs uppercase tracking-wider font-medium ${
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

                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex gap-4 items-center">
                            <div className="relative w-16 h-16 bg-gradient-to-br from-coffee-50 to-coffee-100 flex-shrink-0 rounded-lg overflow-hidden">
                              <Image
                                src={item.product.image}
                                alt={item.product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-coffee-900 font-light">{item.product.name}</h4>
                              <p className="text-sm text-coffee-600 font-light">
                                Qty: {item.quantity} × ${item.price.toFixed(2)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-coffee-900 font-light">
                                ${(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Points History */}
        {pointsHistory.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-coffee-200">
            <h2 className="text-2xl font-light text-coffee-900 mb-6 tracking-tight flex items-center gap-2">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Points History
            </h2>

            <div className="space-y-3">
              {pointsHistory.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border border-coffee-100 rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex-1">
                    <p className="text-coffee-900 font-light mb-1">{transaction.description}</p>
                    <p className="text-xs text-coffee-500">
                      {new Date(transaction.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-xl font-medium ${
                        transaction.points > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.points > 0 ? "+" : ""}{transaction.points}
                    </p>
                    <p className="text-xs text-coffee-500 capitalize">{transaction.type}</p>
                  </div>
                </div>
              ))}
            </div>

            {pointsHistory.length === 10 && (
              <p className="text-center text-sm text-coffee-600 mt-4">
                Showing last 10 transactions
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
