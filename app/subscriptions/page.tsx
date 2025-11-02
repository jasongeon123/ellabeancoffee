import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";

export default async function SubscriptionsPage() {
  const session = await getServerSession(authOptions);
  const userId = session ? (session.user as any).id : null;

  // Get available products for subscription
  const products = await prisma.product.findMany({
    where: { inStock: true },
    take: 6,
  });

  // Get user's active subscriptions if logged in
  const userSubscriptions = userId
    ? await prisma.subscription.findMany({
        where: {
          userId,
          status: "active",
        },
      })
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-coffee-100 to-coffee-50 py-12 sm:py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-2 bg-coffee-900 text-white text-xs uppercase tracking-widest font-medium mb-6 rounded-full">
            Subscribe & Save
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-light text-coffee-900 mb-4 tracking-tight">
            Coffee Subscriptions
          </h1>
          <p className="text-lg sm:text-xl text-coffee-600 font-light max-w-2xl mx-auto">
            Never run out of your favorite coffee. Subscribe and get fresh coffee delivered to your next location.
          </p>
        </div>

        {/* Subscription Benefits */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white rounded-xl p-6 border border-coffee-200 text-center">
            <div className="text-4xl mb-4">☕</div>
            <h3 className="text-xl font-light text-coffee-900 mb-2">Fresh Coffee</h3>
            <p className="text-coffee-600 font-light text-sm">
              Get freshly roasted coffee delivered regularly
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-coffee-200 text-center">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-light text-coffee-900 mb-2">Save Money</h3>
            <p className="text-coffee-600 font-light text-sm">
              Subscribers get 10% off every order
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-coffee-200 text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-light text-coffee-900 mb-2">Flexible</h3>
            <p className="text-coffee-600 font-light text-sm">
              Pause, skip, or cancel anytime
            </p>
          </div>
        </div>

        {/* Coming Soon Note */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 mb-12 text-center">
          <h2 className="text-2xl font-light text-coffee-900 mb-3">Coming Soon!</h2>
          <p className="text-coffee-700 font-light mb-6">
            We're currently setting up our subscription service with Stripe.
            This feature will be available soon!
          </p>
          <p className="text-sm text-coffee-600 font-light">
            In the meantime, you can still order individual items from our shop.
          </p>
        </div>

        {/* Product Grid - Preview */}
        <div>
          <h2 className="text-3xl font-light text-coffee-900 mb-8 tracking-tight">
            Available for Subscription
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-coffee-200"
              >
                <div className="relative h-48 bg-gradient-to-br from-coffee-50 to-coffee-100">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-light text-coffee-900 mb-2">{product.name}</h3>
                  <p className="text-coffee-600 text-sm mb-4 line-clamp-2 font-light">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-light text-coffee-900">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-green-600 font-light">Save 10%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/#products"
            className="inline-block bg-coffee-900 text-white px-8 py-4 rounded-full hover:bg-coffee-800 transition-all duration-300 uppercase text-xs tracking-widest font-medium shadow-lg hover:shadow-xl hover:scale-105"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </div>
  );
}
