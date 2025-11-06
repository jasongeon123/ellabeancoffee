"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import CheckoutFormWrapper from "@/components/CheckoutFormWrapper";
import TrustBadges from "@/components/TrustBadges";
import { useEffect, useState } from "react";
import { trackBeginCheckout } from "@/components/analytics/GoogleAnalytics";
import { trackFBInitiateCheckout } from "@/components/analytics/FacebookPixel";
import { getAllStates } from "@/lib/shipping";

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items, loading } = useCart();

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Loyalty points state
  const [pointsToUse, setPointsToUse] = useState(0);
  const [userPoints, setUserPoints] = useState(0);

  // Shipping address state
  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
    phone: "",
  });
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingMethod, setShippingMethod] = useState("");
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  const [shippingError, setShippingError] = useState("");

  useEffect(() => {
    if (status !== "loading" && items.length === 0 && !loading) {
      router.push("/cart");
    }
  }, [items, loading, status, router]);

  // Fetch user's loyalty points
  useEffect(() => {
    const fetchUserPoints = async () => {
      if (session?.user) {
        try {
          const response = await fetch("/api/user/points");
          if (response.ok) {
            const data = await response.json();
            setUserPoints(data.points);
          }
        } catch (error) {
          console.error("Failed to fetch user points:", error);
        }
      }
    };

    fetchUserPoints();
  }, [session]);

  // Track begin checkout event
  useEffect(() => {
    if (items.length > 0 && !loading) {
      const cartTotal = items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );
      const checkoutItems = items.map((item) => ({
        item_id: item.productId,
        item_name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      }));
      trackBeginCheckout(cartTotal, checkoutItems);
      trackFBInitiateCheckout(cartTotal);
    }
  }, [items, loading]);

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const discount = appliedCoupon?.discountAmount || 0;
  const pointsDiscount = pointsToUse * 0.01; // Each point is worth $0.01
  const totalDiscount = discount + pointsDiscount;
  const tax = (subtotal - totalDiscount + shippingCost) * 0.08;
  const total = subtotal - totalDiscount + shippingCost + tax;

  // Calculate shipping when address changes
  useEffect(() => {
    const calculateShippingCost = async () => {
      // Only calculate if we have required fields
      if (!shippingAddress.address || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zip) {
        setShippingCost(0);
        setShippingMethod("");
        return;
      }

      setCalculatingShipping(true);
      setShippingError("");

      try {
        const response = await fetch('/api/shipping/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...shippingAddress,
            cartSubtotal: subtotal,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setShippingError(data.error || 'Failed to calculate shipping');
          setShippingCost(0);
          setShippingMethod("");
          return;
        }

        setShippingCost(data.cost);
        setShippingMethod(data.method);
        setShippingError("");
      } catch (error) {
        console.error('Shipping calculation error:', error);
        setShippingError('Failed to calculate shipping');
        setShippingCost(0);
        setShippingMethod("");
      } finally {
        setCalculatingShipping(false);
      }
    };

    // Debounce the calculation
    const timer = setTimeout(calculateShippingCost, 500);
    return () => clearTimeout(timer);
  }, [shippingAddress, subtotal]);

  const userId = session?.user ? (session.user as any).id : null;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setValidatingCoupon(true);
    setCouponError("");

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, cartTotal: subtotal }),
      });

      const data = await response.json();

      if (!response.ok) {
        setCouponError(data.error || "Invalid coupon code");
        setAppliedCoupon(null);
        return;
      }

      setAppliedCoupon(data);
      setCouponError("");
    } catch (error) {
      setCouponError("Failed to validate coupon");
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-coffee-50 to-white py-16 flex items-center justify-center">
        <div className="text-coffee-600">Loading checkout...</div>
      </div>
    );
  }

  if (items.length === 0) {
    return null; // Will redirect in useEffect
  }

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
            {/* Shipping Address Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-coffee-100 mb-6">
              <h2 className="text-2xl font-light text-coffee-900 mb-6 tracking-tight">
                Shipping Address
              </h2>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-coffee-900 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={shippingAddress.name}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                    className="w-full border border-coffee-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                    placeholder="John Doe"
                    required
                  />
                </div>

                {/* Address */}
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-coffee-900 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    id="address"
                    value={shippingAddress.address}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                    className="w-full border border-coffee-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                    placeholder="123 Main St, Apt 4B"
                    required
                  />
                </div>

                {/* City and State */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-coffee-900 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      id="city"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      className="w-full border border-coffee-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                      placeholder="Los Angeles"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-coffee-900 mb-2">
                      State *
                    </label>
                    <select
                      id="state"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      className="w-full border border-coffee-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                      required
                    >
                      <option value="">Select State</option>
                      {getAllStates().map((state) => (
                        <option key={state.code} value={state.code}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ZIP and Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="zip" className="block text-sm font-medium text-coffee-900 mb-2">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      id="zip"
                      value={shippingAddress.zip}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, zip: e.target.value })}
                      className="w-full border border-coffee-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                      placeholder="90210"
                      maxLength={10}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-coffee-900 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                      className="w-full border border-coffee-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                      placeholder="(555) 123-4567"
                      required
                    />
                  </div>
                </div>

                {/* Shipping Calculation Status */}
                {calculatingShipping && (
                  <div className="flex items-center gap-2 text-sm text-coffee-600 bg-coffee-50 px-4 py-2 rounded-lg">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Calculating shipping cost...</span>
                  </div>
                )}

                {shippingError && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>{shippingError}</span>
                  </div>
                )}

                {shippingCost > 0 && !calculatingShipping && !shippingError && (
                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Shipping: ${shippingCost.toFixed(2)} ({shippingMethod})</span>
                  </div>
                )}

                {shippingCost === 0 && shippingMethod && !calculatingShipping && !shippingError && (
                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>🎉 {shippingMethod}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Information Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-coffee-100">
              <h2 className="text-2xl font-light text-coffee-900 mb-6 tracking-tight">
                Payment Information
              </h2>
              <CheckoutFormWrapper
                amount={total}
                subtotal={subtotal}
                discount={discount}
                pointsUsed={pointsToUse}
                couponCode={appliedCoupon?.code}
                userId={userId}
                items={items.map(item => ({
                  productId: item.productId,
                  quantity: item.quantity,
                }))}
                shippingAddress={shippingAddress}
                shippingCost={shippingCost}
                tax={tax}
              />
            </div>

            {/* Trust Badges */}
            <div className="mt-6 bg-gray-50 rounded-lg border border-gray-200">
              <TrustBadges />
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-24 border border-coffee-100">
              <h2 className="text-2xl font-light text-coffee-900 mb-6 tracking-tight">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
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

              {/* Coupon Code Input */}
              <div className="mb-6 pb-6 border-b border-coffee-100">
                <h3 className="text-sm font-medium text-coffee-900 mb-3">
                  Have a coupon code?
                </h3>
                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      onKeyPress={(e) => e.key === "Enter" && handleApplyCoupon()}
                      placeholder="Enter code"
                      className="flex-1 border border-coffee-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={validatingCoupon || !couponCode.trim()}
                      className="bg-coffee-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-coffee-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {validatingCoupon ? "..." : "Apply"}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <div>
                      <div className="text-sm font-medium text-green-800">
                        {appliedCoupon.code}
                      </div>
                      {appliedCoupon.description && (
                        <div className="text-xs text-green-600">
                          {appliedCoupon.description}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-green-600 hover:text-green-800 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                )}
                {couponError && (
                  <p className="text-xs text-red-600 mt-2">{couponError}</p>
                )}
              </div>

              {/* Loyalty Points Redemption */}
              {session?.user && userPoints > 0 && (
                <div className="mb-6 pb-6 border-b border-coffee-100">
                  <h3 className="text-sm font-medium text-coffee-900 mb-3">
                    Use Loyalty Points
                  </h3>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-amber-800 font-medium">Available Points</span>
                      <span className="text-lg font-bold text-amber-800">{userPoints}</span>
                    </div>
                    <p className="text-xs text-amber-700">
                      Each point is worth $0.01 • Max {Math.min(userPoints, Math.floor((subtotal - discount) * 100))} points
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={pointsToUse}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        const maxPoints = Math.min(userPoints, Math.floor((subtotal - discount) * 100));
                        setPointsToUse(Math.max(0, Math.min(value, maxPoints)));
                      }}
                      placeholder="Points to use"
                      className="flex-1 border border-coffee-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500"
                      min="0"
                      max={Math.min(userPoints, Math.floor((subtotal - discount) * 100))}
                    />
                    <button
                      onClick={() => {
                        const maxPoints = Math.min(userPoints, Math.floor((subtotal - discount) * 100));
                        setPointsToUse(maxPoints);
                      }}
                      className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 whitespace-nowrap"
                    >
                      Use Max
                    </button>
                  </div>
                  {pointsToUse > 0 && (
                    <p className="text-xs text-green-600 mt-2 font-medium">
                      Saving ${pointsDiscount.toFixed(2)} with {pointsToUse} points
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-4 mb-6 pb-6 border-t border-coffee-100 pt-6">
                <div className="flex justify-between text-coffee-600">
                  <span className="font-light">Subtotal</span>
                  <span className="font-light">${subtotal.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span className="font-light">Discount ({appliedCoupon.code})</span>
                    <span className="font-light">-${discount.toFixed(2)}</span>
                  </div>
                )}
                {pointsToUse > 0 && (
                  <div className="flex justify-between text-amber-600">
                    <span className="font-light">Points Discount ({pointsToUse} pts)</span>
                    <span className="font-light">-${pointsDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-coffee-600">
                  <span className="font-light">Shipping</span>
                  <span className="font-light">
                    {calculatingShipping ? (
                      "Calculating..."
                    ) : shippingCost === 0 && shippingMethod ? (
                      "Free"
                    ) : shippingCost > 0 ? (
                      `$${shippingCost.toFixed(2)}`
                    ) : (
                      "Calculated at checkout"
                    )}
                  </span>
                </div>
                {shippingMethod && !calculatingShipping && (
                  <div className="text-xs text-coffee-500 -mt-2">
                    {shippingMethod}
                  </div>
                )}
                {shippingError && (
                  <div className="text-xs text-red-600 -mt-2">
                    {shippingError}
                  </div>
                )}
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
