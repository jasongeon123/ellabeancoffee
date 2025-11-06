import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import SubscriptionCard from "@/components/SubscriptionCard";
import Link from "next/link";

export default async function SubscriptionsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const userId = (session.user as any).id;

  // Get user subscriptions
  const subscriptions = await prisma.subscription.findMany({
    where: { userId },
    include: {
      product: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const activeSubscriptions = subscriptions.filter(s => s.status === "active");
  const pausedSubscriptions = subscriptions.filter(s => s.status === "paused");
  const cancelledSubscriptions = subscriptions.filter(s => s.status === "cancelled");

  return (
    <div className="min-h-screen bg-gradient-to-b from-coffee-100 to-coffee-50 py-12 sm:py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-coffee-600 hover:text-coffee-900 transition-colors mb-4 font-light"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Account
          </Link>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-light text-coffee-900 mb-3 tracking-tight">
            My Subscriptions
          </h1>
          <p className="text-coffee-600 text-lg font-light">
            Manage your Subscribe & Save coffee deliveries
          </p>
        </div>

        {/* Statistics */}
        {subscriptions.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6 border border-coffee-100">
              <div className="text-coffee-600 text-sm font-light mb-1">Active</div>
              <div className="text-3xl font-light text-coffee-900">{activeSubscriptions.length}</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border border-coffee-100">
              <div className="text-coffee-600 text-sm font-light mb-1">Paused</div>
              <div className="text-3xl font-light text-coffee-900">{pausedSubscriptions.length}</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border border-coffee-100">
              <div className="text-coffee-600 text-sm font-light mb-1">Cancelled</div>
              <div className="text-3xl font-light text-coffee-900">{cancelledSubscriptions.length}</div>
            </div>
          </div>
        )}

        {/* No Subscriptions State */}
        {subscriptions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 border border-coffee-200 text-center">
            <div className="inline-block p-6 bg-coffee-50 rounded-full mb-6">
              <svg className="w-16 h-16 text-coffee-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h2 className="text-2xl font-light text-coffee-900 mb-3">No Active Subscriptions</h2>
            <p className="text-coffee-600 font-light mb-6 max-w-md mx-auto">
              Subscribe to your favorite coffee and save up to 15%! Get automatic deliveries and never run out.
            </p>
            <Link
              href="/#products"
              className="inline-block bg-coffee-900 text-white px-8 py-3 rounded-full hover:bg-coffee-800 transition-all duration-300 uppercase text-xs tracking-widest font-medium shadow-lg hover:shadow-xl hover:scale-105"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            {/* Active Subscriptions */}
            {activeSubscriptions.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-light text-coffee-900 mb-4 tracking-tight">
                  Active Subscriptions
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {activeSubscriptions.map((subscription) => (
                    <SubscriptionCard key={subscription.id} subscription={subscription} />
                  ))}
                </div>
              </div>
            )}

            {/* Paused Subscriptions */}
            {pausedSubscriptions.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-light text-coffee-900 mb-4 tracking-tight">
                  Paused Subscriptions
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {pausedSubscriptions.map((subscription) => (
                    <SubscriptionCard key={subscription.id} subscription={subscription} />
                  ))}
                </div>
              </div>
            )}

            {/* Cancelled Subscriptions */}
            {cancelledSubscriptions.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-light text-coffee-900 mb-4 tracking-tight">
                  Cancelled Subscriptions
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {cancelledSubscriptions.map((subscription) => (
                    <SubscriptionCard key={subscription.id} subscription={subscription} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
