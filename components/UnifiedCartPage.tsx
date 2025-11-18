"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import SignupPromptModal from "./SignupPromptModal";
import { clearGuestCart } from "@/lib/guestCart";
import { CartItemSkeleton } from "./SkeletonLoader";

export default function UnifiedCartPage() {
  const { data: session, status } = useSession();
  const { items, loading, updateItem, removeItem, getTotalPrice } = useCart();
  const router = useRouter();
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  const total = getTotalPrice();
  const taxRate = 0.08;
  const taxAmount = total * taxRate;
  const grandTotal = total + taxAmount;

  const handleCheckout = () => {
    if (!session?.user) {
      // Guest user - show signup prompt
      setShowSignupPrompt(true);
    } else {
      // Authenticated user - proceed to checkout
      proceedToCheckout();
    }
  };

  const proceedToCheckout = () => {
    // Redirect to checkout page for both guest and authenticated users
    router.push("/checkout");
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-coffee-50 to-white py-8 sm:py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-8 sm:mb-10 md:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-coffee-900 mb-3 sm:mb-4 tracking-tight">
              Shopping Cart
            </h1>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-4">
              <CartItemSkeleton />
              <CartItemSkeleton />
              <CartItemSkeleton />
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-coffee-100 sticky top-24">
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-6"></div>
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </div>
                <div className="h-12 bg-gray-200 rounded-lg animate-pulse mt-6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-coffee-50 to-white py-8 sm:py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-8 sm:mb-10 md:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-coffee-900 mb-3 sm:mb-4 tracking-tight">
              Shopping Cart
            </h1>
            <p className="text-coffee-600 text-base sm:text-lg font-light">
              {items.length} {items.length === 1 ? "item" : "items"} in your
              cart
            </p>
          </div>

          {items.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 md:p-16 text-center border border-coffee-100">
              <div className="max-w-md mx-auto">
                <div className="mb-4 sm:mb-6 inline-block p-4 sm:p-6 bg-coffee-50 rounded-full">
                  <svg
                    className="w-12 h-12 sm:w-16 sm:h-16 text-coffee-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-light text-coffee-900 mb-2 sm:mb-3">
                  Your cart is empty
                </h2>
                <p className="text-sm sm:text-base text-coffee-600 mb-6 sm:mb-8 font-light">
                  Looks like you haven't added any items yet
                </p>
                <Link
                  href="/#products"
                  className="inline-block bg-coffee-900 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-full hover:bg-coffee-800 transition-all duration-300 uppercase text-xs tracking-widest font-medium shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Start Shopping
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {items.map((item, index) => (
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
                            <span className="text-sm text-coffee-500">
                              Price:
                            </span>
                            <span className="text-xl font-light text-coffee-900">
                              ${item.product.price.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-between gap-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 bg-coffee-50 rounded-lg p-1">
                          <button
                            onClick={() =>
                              updateItem(item.productId, item.quantity - 1)
                            }
                            className="w-8 h-8 flex items-center justify-center bg-white rounded hover:bg-coffee-100 transition-colors"
                          >
                            -
                          </button>
                          <span className="w-12 text-center font-medium text-coffee-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateItem(item.productId, item.quantity + 1)
                            }
                            className="w-8 h-8 flex items-center justify-center bg-white rounded hover:bg-coffee-100 transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-red-600 hover:text-red-800 text-sm font-light"
                        >
                          Remove
                        </button>
                        <div className="text-right">
                          <div className="text-xs text-coffee-500 uppercase tracking-wider mb-1">
                            Subtotal
                          </div>
                          <p className="text-2xl font-light text-coffee-900">
                            $
                            {(item.product.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-24 border border-coffee-100">
                  <h2 className="text-2xl font-light text-coffee-900 mb-6 tracking-tight">
                    Order Summary
                  </h2>

                  <div className="space-y-4 mb-6 pb-6 border-b border-coffee-100">
                    <div className="flex justify-between text-coffee-600">
                      <span className="font-light">Subtotal</span>
                      <span className="font-light">${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-coffee-600">
                      <span className="font-light">Shipping</span>
                      <span className="font-light">Calculated at checkout</span>
                    </div>
                    <div className="flex justify-between text-coffee-600">
                      <span className="font-light">Tax</span>
                      <span className="font-light">
                        ${taxAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-baseline mb-8 pb-6 border-b border-coffee-200">
                    <span className="text-xl font-light text-coffee-900">
                      Total
                    </span>
                    <span className="text-4xl font-light text-coffee-900">
                      ${grandTotal.toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={checkingOut}
                    className="w-full bg-coffee-900 text-white px-8 py-4 rounded-full hover:bg-coffee-800 transition-all duration-300 uppercase text-xs tracking-widest font-medium shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                  >
                    {checkingOut
                      ? "Processing..."
                      : "Proceed to Checkout"}
                  </button>

                  <Link
                    href="/#products"
                    className="block text-center text-coffee-600 hover:text-coffee-900 transition-colors font-light text-sm"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <SignupPromptModal
        isOpen={showSignupPrompt}
        onClose={() => setShowSignupPrompt(false)}
        onContinueAsGuest={proceedToCheckout}
      />
    </>
  );
}
