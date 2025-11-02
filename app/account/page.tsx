import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

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

        <div className="grid md:grid-cols-3 gap-8 mb-12">
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
                  <p className="text-xs text-coffee-500 uppercase tracking-wider mb-1">Role</p>
                  <p className="text-coffee-900 font-light capitalize">{user?.role}</p>
                </div>
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
              </div>

              <div className="mt-6 pt-6 border-t border-coffee-100">
                <Link
                  href="/account/change-password"
                  className="block w-full text-center px-4 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 transition-colors"
                >
                  Change Password
                </Link>
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
      </div>
    </div>
  );
}
