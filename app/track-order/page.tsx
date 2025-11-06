"use client";

import { useState } from "react";
import Link from "next/link";

interface TrackingUpdate {
  id: string;
  status: string;
  message: string;
  location?: string | null;
  timestamp: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    image: string;
  };
}

interface OrderData {
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  trackingCarrier?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  items: OrderItem[];
  trackingUpdates: TrackingUpdate[];
}

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderData, setOrderData] = useState<OrderData | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOrderData(null);

    try {
      const response = await fetch(
        `/api/track-order?orderNumber=${encodeURIComponent(orderNumber)}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          setError("Order not found. Please check your order number.");
        } else {
          setError("An error occurred. Please try again.");
        }
        return;
      }

      const data = await response.json();
      setOrderData(data);
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-coffee-50 to-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-light text-coffee-900 mb-4 tracking-tight">
            Track Your Order
          </h1>
          <p className="text-lg text-coffee-600 font-light">
            Enter your order number to see the latest updates
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-coffee-100 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="orderNumber"
                className="block text-sm font-medium text-coffee-700 mb-2"
              >
                Order Number
              </label>
              <input
                type="text"
                id="orderNumber"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="EB-2024-000123"
                className="w-full px-4 py-3 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 text-lg"
                required
              />
              <p className="text-xs text-coffee-500 mt-2">
                You can find your order number in your confirmation email
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-coffee-900 text-white py-3 px-6 rounded-lg hover:bg-coffee-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? "Searching..." : "Track Order"}
            </button>
          </form>
        </div>

        {/* Order Details */}
        {orderData && (
          <div className="space-y-6">
            {/* Order Status */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-coffee-100">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-light text-coffee-900 mb-2 tracking-tight">
                    Order {orderData.orderNumber}
                  </h2>
                  <p className="text-sm text-coffee-600">
                    Placed on{" "}
                    {new Date(orderData.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(
                    orderData.status
                  )}`}
                >
                  {orderData.status.charAt(0).toUpperCase() +
                    orderData.status.slice(1)}
                </span>
              </div>

              {/* Carrier Info */}
              {orderData.trackingNumber && (
                <div className="bg-coffee-50 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-medium text-coffee-900 mb-2">
                    Shipping Information
                  </h3>
                  <div className="space-y-1 text-sm text-coffee-700">
                    {orderData.trackingCarrier && (
                      <p>Carrier: {orderData.trackingCarrier}</p>
                    )}
                    <p>Tracking Number: {orderData.trackingNumber}</p>
                    {orderData.trackingUrl && (
                      <a
                        href={orderData.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-coffee-900 hover:underline font-medium inline-flex items-center gap-1"
                      >
                        Track on carrier website →
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div>
                <h3 className="text-sm font-medium text-coffee-900 mb-3">
                  Order Items
                </h3>
                <div className="space-y-3">
                  {orderData.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center py-2 border-b border-coffee-100 last:border-0"
                    >
                      <div>
                        <p className="text-coffee-900">
                          {item.quantity}× {item.product.name}
                        </p>
                      </div>
                      <p className="text-coffee-700 font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-coffee-200 flex justify-between font-medium text-lg">
                  <span className="text-coffee-900">Total</span>
                  <span className="text-coffee-900">
                    ${orderData.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Tracking Timeline */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-coffee-100">
              <h2 className="text-2xl font-light text-coffee-900 mb-6 tracking-tight">
                Tracking History
              </h2>
              {orderData.trackingUpdates && orderData.trackingUpdates.length > 0 ? (
                <div className="space-y-6 relative">
                  {/* Vertical Line */}
                  <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-coffee-200" />

                  {orderData.trackingUpdates.map((update, index) => (
                    <div key={update.id} className="relative flex gap-4 pl-8">
                      <div
                        className={`absolute left-0 w-6 h-6 rounded-full border-4 border-white ${
                          index === 0
                            ? "bg-coffee-900"
                            : "bg-coffee-300"
                        }`}
                      />
                      <div className="flex-grow">
                        <p className="text-coffee-900 font-medium">
                          {update.message}
                        </p>
                        {update.location && (
                          <p className="text-sm text-coffee-600 mt-1">
                            📍 {update.location}
                          </p>
                        )}
                        <p className="text-xs text-coffee-500 mt-1">
                          {new Date(update.timestamp).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-coffee-600 text-center py-8">
                  No tracking updates available yet
                </p>
              )}
            </div>

            {/* Back to Home */}
            <div className="text-center">
              <Link
                href="/"
                className="inline-block text-coffee-700 hover:text-coffee-900 transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        )}

        {/* Help Text */}
        {!orderData && !loading && (
          <div className="text-center mt-8">
            <p className="text-coffee-600 mb-4">
              Need help? <Link href="/contact" className="text-coffee-900 hover:underline font-medium">Contact us</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
