"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { clearGuestCart } from "@/lib/guestCart";
import TestimonialForm from "@/components/TestimonialForm";

export default function CheckoutSuccessPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [processing, setProcessing] = useState(true);

  const paymentIntent = searchParams.get("payment_intent");

  useEffect(() => {
    // Clear guest cart if user is a guest
    if (status !== "loading" && !session) {
      clearGuestCart();
    }

    // Process order if needed
    if (paymentIntent) {
      processOrder();
    } else {
      setProcessing(false);
    }
  }, [paymentIntent, session, status]);

  const processOrder = async () => {
    try {
      // The webhook will handle order creation
      // Just mark as processed
      setProcessing(false);
    } catch (error) {
      console.error("Error processing order:", error);
      setProcessing(false);
    }
  };

  if (processing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-coffee-50 to-white py-16 flex items-center justify-center">
        <div className="text-coffee-600">Processing your order...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-coffee-50 to-white py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 border border-coffee-100">
          {/* Success Icon */}
          <div className="mb-6 inline-block p-6 bg-green-50 rounded-full">
            <svg
              className="w-16 h-16 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl sm:text-4xl font-light text-coffee-900 mb-4 tracking-tight">
            Order Successful!
          </h1>
          <p className="text-lg text-coffee-600 font-light mb-8">
            Thank you for your purchase. Your order has been confirmed and we'll send you an email with the details.
          </p>

          {/* Order Details */}
          <div className="bg-coffee-50 rounded-xl p-6 mb-8">
            <p className="text-sm text-coffee-700 font-light mb-2">
              We're preparing your coffee order with care
            </p>
            <p className="text-xs text-coffee-600 font-light">
              You'll receive a confirmation email shortly with your order details and pickup instructions.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/#products"
              className="inline-block bg-coffee-900 text-white px-8 py-4 rounded-full hover:bg-coffee-800 transition-all duration-300 uppercase text-xs tracking-widest font-medium shadow-lg hover:shadow-xl hover:scale-105"
            >
              Continue Shopping
            </Link>
            <Link
              href="/"
              className="inline-block bg-white text-coffee-900 px-8 py-4 rounded-full hover:bg-coffee-50 transition-all duration-300 uppercase text-xs tracking-widest font-medium shadow-lg hover:shadow-xl hover:scale-105 border border-coffee-300"
            >
              Return Home
            </Link>
          </div>
        </div>

        {/* Testimonial Form Section - Only show for authenticated users */}
        {session && (
          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 border border-coffee-100 mt-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-light text-coffee-900 mb-3 tracking-tight">
                Share Your Experience
              </h2>
              <p className="text-coffee-600 font-light">
                We'd love to hear about your experience with Ella Bean Coffee. Your feedback helps us serve you better!
              </p>
            </div>
            <TestimonialForm />
          </div>
        )}
      </div>
    </div>
  );
}
