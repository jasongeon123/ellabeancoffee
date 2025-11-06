"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

function PaymentForm({
  amount,
  userId,
}: {
  amount: number;
  userId: string | null;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (!name || !email) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || "An error occurred");
        setLoading(false);
        return;
      }

      const returnUrl = userId
        ? `${window.location.origin}/checkout/success?userId=${userId}`
        : `${window.location.origin}/checkout/success`;

      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
          payment_method_data: {
            billing_details: {
              name,
              email,
            },
          },
        },
      });

      if (confirmError) {
        setError(confirmError.message || "Payment failed");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Field */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-light text-coffee-900 mb-2"
        >
          Full Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-transparent font-light"
          placeholder="John Doe"
          required
        />
      </div>

      {/* Email Field */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-light text-coffee-900 mb-2"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-transparent font-light"
          placeholder="john@example.com"
          required
        />
      </div>

      {/* Stripe Payment Element */}
      <div>
        <label className="block text-sm font-light text-coffee-900 mb-2">
          Card Information
        </label>
        <div className="border border-coffee-300 rounded-lg p-4">
          <PaymentElement />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-coffee-900 text-white py-4 rounded-full hover:bg-coffee-800 transition-all duration-300 uppercase text-xs tracking-widest font-medium shadow-xl hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {loading ? "Processing..." : `Pay $${amount.toFixed(2)}`}
      </button>

      <p className="text-xs text-coffee-600 text-center font-light">
        Your payment information is secure and encrypted
      </p>
    </form>
  );
}

interface ShippingAddress {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
}

export default function CheckoutForm({
  amount,
  subtotal,
  discount,
  pointsUsed,
  couponCode,
  userId,
  items,
  shippingAddress,
  shippingCost,
  tax,
}: {
  amount: number;
  subtotal: number;
  discount: number;
  pointsUsed?: number;
  couponCode?: string;
  userId: string | null;
  items: { productId: string; quantity: number }[];
  shippingAddress: ShippingAddress;
  shippingCost: number;
  tax: number;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create PaymentIntent on mount
    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        subtotal,
        discount,
        pointsUsed,
        couponCode,
        userId,
        items,
        shippingAddress,
        shippingCost,
        tax,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          setError("Failed to initialize payment");
        }
      })
      .catch((err) => {
        setError("Failed to initialize payment");
      });
  }, [amount, subtotal, discount, pointsUsed, couponCode, userId, items, shippingAddress, shippingCost, tax]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg">
        {error}
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-900"></div>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#4B2E2A",
            colorBackground: "#ffffff",
            colorText: "#4B2E2A",
            colorDanger: "#df1b41",
            fontFamily: "system-ui, sans-serif",
            borderRadius: "8px",
          },
        },
      }}
    >
      <PaymentForm amount={amount} userId={userId} />
    </Elements>
  );
}
