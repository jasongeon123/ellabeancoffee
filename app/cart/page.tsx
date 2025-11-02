import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Image from "next/image";
import CartActions from "@/components/CartActions";
import CheckoutButton from "@/components/CheckoutButton";

export default async function CartPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const userId = (session.user as any).id;

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  const total = cart?.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  ) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-coffee-50 to-white py-8 sm:py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-8 sm:mb-10 md:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-coffee-900 mb-3 sm:mb-4 tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-coffee-600 text-base sm:text-lg font-light">
            {cart?.items.length || 0} {cart?.items.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        {!cart || cart.items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 md:p-16 text-center border border-coffee-100">
            <div className="max-w-md mx-auto">
              <div className="mb-4 sm:mb-6 inline-block p-4 sm:p-6 bg-coffee-50 rounded-full">
                <svg className="w-12 h-12 sm:w-16 sm:h-16 text-coffee-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-light text-coffee-900 mb-2 sm:mb-3">Your cart is empty</h2>
              <p className="text-sm sm:text-base text-coffee-600 mb-6 sm:mb-8 font-light">Looks like you haven't added any items yet</p>
              <a
                href="/#products"
                className="inline-block bg-coffee-900 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-full hover:bg-coffee-800 transition-all duration-300 uppercase text-xs tracking-widest font-medium shadow-lg hover:shadow-xl hover:scale-105"
              >
                Start Shopping
              </a>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-coffee-100"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex flex-col sm:flex-row gap-6 p-6">
                    <div className="relative w-full sm:w-32 h-32 bg-gradient-to-br from-coffee-50 to-coffee-100 flex-shrink-0 rounded-xl overflow-hidden">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, 128px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-2xl font-light text-coffee-900 mb-2 tracking-tight">
                          {item.product.name}
                        </h3>
                        <p className="text-coffee-600 text-sm font-light mb-4">
                          {item.product.description}
                        </p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm text-coffee-500">Price:</span>
                          <span className="text-xl font-light text-coffee-900">
                            ${item.product.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-between gap-4">
                      <CartActions itemId={item.id} quantity={item.quantity} />
                      <div className="text-right">
                        <div className="text-xs text-coffee-500 uppercase tracking-wider mb-1">Subtotal</div>
                        <p className="text-2xl font-light text-coffee-900">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-24 border border-coffee-100">
                <h2 className="text-2xl font-light text-coffee-900 mb-6 tracking-tight">Order Summary</h2>

                <div className="space-y-4 mb-6 pb-6 border-b border-coffee-100">
                  <div className="flex justify-between text-coffee-600">
                    <span className="font-light">Subtotal</span>
                    <span className="font-light">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-coffee-600">
                    <span className="font-light">Shipping</span>
                    <span className="font-light">Free</span>
                  </div>
                  <div className="flex justify-between text-coffee-600">
                    <span className="font-light">Tax</span>
                    <span className="font-light">${(total * 0.08).toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-baseline mb-8 pb-6 border-b border-coffee-200">
                  <span className="text-xl font-light text-coffee-900">Total</span>
                  <span className="text-4xl font-light text-coffee-900">
                    ${(total * 1.08).toFixed(2)}
                  </span>
                </div>

                <CheckoutButton />

                <a
                  href="/#products"
                  className="block text-center text-coffee-600 hover:text-coffee-900 transition-colors font-light text-sm"
                >
                  Continue Shopping
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
