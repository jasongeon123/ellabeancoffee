import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CheckoutFormWrapper from "@/components/CheckoutFormWrapper";

export default async function CheckoutPage() {
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

  if (!cart || cart.items.length === 0) {
    redirect("/cart");
  }

  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-gradient-to-b from-coffee-50 to-white py-8 sm:py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-8 sm:mb-10 md:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-coffee-900 mb-3 sm:mb-4 tracking-tight">
            Checkout
          </h1>
          <p className="text-coffee-600 text-base sm:text-lg font-light">
            Complete your order
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-coffee-100">
              <h2 className="text-2xl font-light text-coffee-900 mb-6 tracking-tight">
                Payment Information
              </h2>
              <CheckoutFormWrapper amount={total} cartId={cart.id} userId={userId} />
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-24 border border-coffee-100">
              <h2 className="text-2xl font-light text-coffee-900 mb-6 tracking-tight">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="text-coffee-900 font-light">
                        {item.product.name}
                      </p>
                      <p className="text-coffee-600 text-xs">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="text-coffee-900 font-light">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-4 mb-6 pb-6 border-t border-coffee-100 pt-6">
                <div className="flex justify-between text-coffee-600">
                  <span className="font-light">Subtotal</span>
                  <span className="font-light">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-coffee-600">
                  <span className="font-light">Shipping</span>
                  <span className="font-light">Free</span>
                </div>
                <div className="flex justify-between text-coffee-600">
                  <span className="font-light">Tax</span>
                  <span className="font-light">${tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-baseline pb-6 border-t border-coffee-200 pt-6">
                <span className="text-xl font-light text-coffee-900">Total</span>
                <span className="text-4xl font-light text-coffee-900">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
