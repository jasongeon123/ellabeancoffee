"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface SubscribeOptionProps {
  productId: string;
  productPrice: number;
}

export default function SubscribeOption({ productId, productPrice }: SubscribeOptionProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [frequency, setFrequency] = useState<"weekly" | "bi-weekly" | "monthly">("monthly");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const frequencyOptions = [
    { value: "weekly", label: "Weekly", discount: 15 },
    { value: "bi-weekly", label: "Every 2 Weeks", discount: 12 },
    { value: "monthly", label: "Monthly", discount: 10 },
  ];

  const selectedOption = frequencyOptions.find((opt) => opt.value === frequency)!;
  const discountedPrice = productPrice * (1 - selectedOption.discount / 100);
  const totalPrice = discountedPrice * quantity;

  const handleSubscribe = async () => {
    if (!session?.user) {
      router.push("/auth/signin?callbackUrl=" + window.location.pathname);
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          quantity,
          frequency,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: "error", text: data.error || "Failed to create subscription" });
        return;
      }

      setMessage({ type: "success", text: "Subscription created successfully!" });
      setTimeout(() => {
        router.push("/account");
      }, 1500);
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-coffee-50 to-amber-50 rounded-2xl p-6 border-2 border-coffee-200 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-6 h-6 text-coffee-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <h3 className="text-xl font-medium text-coffee-900">Subscribe & Save</h3>
        <span className="ml-auto bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
          Up to 15% OFF
        </span>
      </div>

      <p className="text-coffee-600 text-sm mb-4 font-light">
        Never run out of your favorite coffee. Get automatic deliveries and exclusive discounts!
      </p>

      {/* Frequency Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-coffee-900 mb-2">Delivery Frequency</label>
        <div className="grid grid-cols-3 gap-2">
          {frequencyOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFrequency(option.value as any)}
              className={`relative py-3 px-2 rounded-lg border-2 transition-all ${
                frequency === option.value
                  ? "border-coffee-700 bg-coffee-100 shadow-md"
                  : "border-coffee-200 bg-white hover:border-coffee-400"
              }`}
            >
              <div className="text-xs font-medium text-coffee-900">{option.label}</div>
              <div className={`text-sm font-bold ${frequency === option.value ? "text-coffee-700" : "text-green-600"}`}>
                {option.discount}% OFF
              </div>
              {frequency === option.value && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-coffee-700 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Quantity Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-coffee-900 mb-2">Quantity per Delivery</label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-10 rounded-full bg-white border-2 border-coffee-200 hover:border-coffee-400 flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4 text-coffee-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-20 text-center py-2 border-2 border-coffee-200 rounded-lg font-medium text-coffee-900 focus:outline-none focus:ring-2 focus:ring-coffee-500"
            min="1"
          />
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-10 h-10 rounded-full bg-white border-2 border-coffee-200 hover:border-coffee-400 flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4 text-coffee-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Pricing Summary */}
      <div className="bg-white rounded-lg p-4 mb-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="text-xs text-coffee-600 mb-1">Per Delivery</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-coffee-900">${totalPrice.toFixed(2)}</span>
              <span className="text-sm text-coffee-500 line-through">${(productPrice * quantity).toFixed(2)}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-green-600 font-medium">You Save</div>
            <div className="text-lg font-bold text-green-600">
              ${((productPrice * quantity) - totalPrice).toFixed(2)}
            </div>
          </div>
        </div>
        <div className="text-xs text-coffee-500 mt-2">
          Next delivery: {frequency === "weekly" ? "7 days" : frequency === "bi-weekly" ? "14 days" : "30 days"} from subscription
        </div>
      </div>

      {/* Subscribe Button */}
      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="w-full bg-coffee-900 text-white py-4 rounded-full hover:bg-coffee-800 transition-all duration-300 uppercase text-sm tracking-widest font-medium shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Creating Subscription...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Subscribe Now</span>
          </>
        )}
      </button>

      {/* Message Display */}
      {message && (
        <div
          className={`mt-4 p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Benefits */}
      <div className="mt-4 pt-4 border-t border-coffee-200">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-coffee-700">Cancel anytime</span>
          </div>
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-coffee-700">Pause or skip deliveries</span>
          </div>
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-coffee-700">Free shipping always</span>
          </div>
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-coffee-700">Update frequency anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
}
