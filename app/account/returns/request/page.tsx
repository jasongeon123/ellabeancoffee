"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    image: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

export default function ReturnRequestPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");

  const [order, setOrder] = useState<Order | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderNumber) {
      router.push("/account/returns");
      return;
    }

    // Fetch order details
    fetch(`/api/orders?orderNumber=${orderNumber}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.order) {
          setOrder(data.order);
          // Select all items by default
          setSelectedItems(data.order.items.map((item: OrderItem) => item.id));
        } else {
          setError("Order not found");
        }
      })
      .catch((err) => {
        setError("Failed to load order");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [orderNumber, router]);

  const toggleItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedItems.length === 0) {
      setError("Please select at least one item to return");
      return;
    }

    if (!reason.trim()) {
      setError("Please provide a reason for the return");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber,
          reason,
          items: selectedItems,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/account/returns");
      } else {
        setError(data.error || "Failed to submit return request");
      }
    } catch (err) {
      setError("Failed to submit return request");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-coffee-100 to-coffee-50 flex items-center justify-center">
        <div className="text-coffee-600">Loading order...</div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-coffee-100 to-coffee-50 py-24">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg">
            {error}
          </div>
          <Link
            href="/account/returns"
            className="inline-block mt-6 text-coffee-600 hover:text-coffee-900"
          >
            ← Back to Returns
          </Link>
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-coffee-100 to-coffee-50 py-12 sm:py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <Link
            href="/account/returns"
            className="inline-flex items-center gap-2 text-coffee-600 hover:text-coffee-900 mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Returns
          </Link>
          <h1 className="text-4xl sm:text-5xl font-light text-coffee-900 mb-3 tracking-tight">
            Request Return
          </h1>
          <p className="text-coffee-600 text-lg font-light">
            Order #{order.orderNumber}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Select Items */}
          <div className="bg-white rounded-xl p-6 border border-coffee-200 shadow-sm">
            <h2 className="text-xl font-light text-coffee-900 mb-4 tracking-tight">
              Select Items to Return
            </h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <label
                  key={item.id}
                  className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedItems.includes(item.id)
                      ? "border-coffee-600 bg-coffee-50"
                      : "border-coffee-200 hover:border-coffee-400"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => toggleItem(item.id)}
                    className="w-5 h-5 text-coffee-600 rounded focus:ring-coffee-500"
                  />
                  <div className="relative w-16 h-16 bg-gradient-to-br from-coffee-50 to-coffee-100 flex-shrink-0 rounded-lg overflow-hidden">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-coffee-900 font-light">{item.product.name}</h3>
                    <p className="text-sm text-coffee-600 font-light">
                      Qty: {item.quantity} × ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-coffee-900 font-light">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Reason for Return */}
          <div className="bg-white rounded-xl p-6 border border-coffee-200 shadow-sm">
            <h2 className="text-xl font-light text-coffee-900 mb-4 tracking-tight">
              Reason for Return
            </h2>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-transparent font-light"
              placeholder="Please describe why you'd like to return this order..."
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || selectedItems.length === 0}
            className="w-full bg-coffee-900 text-white py-4 rounded-lg hover:bg-coffee-800 transition-colors font-medium uppercase text-xs tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting..." : "Submit Return Request"}
          </button>
        </form>
      </div>
    </div>
  );
}
