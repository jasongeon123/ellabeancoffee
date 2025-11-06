"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface SubscriptionCardProps {
  subscription: {
    id: string;
    productId: string;
    quantity: number;
    frequency: string;
    discount: number;
    status: string;
    nextDeliveryDate: Date | null;
    product: {
      id: string;
      name: string;
      price: number;
      image: string;
    };
  };
}

export default function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showFrequencyModal, setShowFrequencyModal] = useState(false);
  const [newFrequency, setNewFrequency] = useState(subscription.frequency);

  const frequencyLabels: { [key: string]: string } = {
    weekly: "Weekly",
    "bi-weekly": "Every 2 Weeks",
    monthly: "Monthly",
  };

  const discountedPrice = subscription.product.price * (1 - subscription.discount / 100);
  const totalPrice = discountedPrice * subscription.quantity;

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/subscriptions/${subscription.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("Failed to update subscription");
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setLoading(false);
      setShowActions(false);
    }
  };

  const handleFrequencyChange = async () => {
    if (newFrequency === subscription.frequency) {
      setShowFrequencyModal(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/subscriptions/${subscription.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frequency: newFrequency }),
      });

      if (response.ok) {
        router.refresh();
        setShowFrequencyModal(false);
      } else {
        alert("Failed to update frequency");
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/subscriptions/${subscription.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("Failed to update quantity");
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this subscription?")) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/subscriptions/${subscription.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("Failed to cancel subscription");
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-md border border-coffee-100 overflow-hidden hover:shadow-lg transition-shadow">
        {/* Status Badge */}
        <div className="px-6 pt-4">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs uppercase tracking-wider font-medium ${
              subscription.status === "active"
                ? "bg-green-100 text-green-700"
                : subscription.status === "paused"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {subscription.status}
          </span>
        </div>

        {/* Product Info */}
        <div className="p-6">
          <div className="flex gap-4 mb-4">
            <div className="relative w-24 h-24 bg-gradient-to-br from-coffee-50 to-coffee-100 flex-shrink-0 rounded-lg overflow-hidden">
              <Image
                src={subscription.product.image}
                alt={subscription.product.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-light text-coffee-900 mb-2">
                {subscription.product.name}
              </h3>
              <p className="text-sm text-coffee-600 font-light mb-1">
                {frequencyLabels[subscription.frequency]} • {subscription.discount}% OFF
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-light text-coffee-900">
                  ${totalPrice.toFixed(2)}
                </span>
                <span className="text-sm text-coffee-500 line-through">
                  ${(subscription.product.price * subscription.quantity).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Quantity */}
          <div className="mb-4">
            <label className="block text-xs text-coffee-600 mb-2 font-medium">Quantity per Delivery</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleQuantityChange(subscription.quantity - 1)}
                disabled={loading || subscription.status === "cancelled"}
                className="w-8 h-8 rounded-full bg-coffee-100 hover:bg-coffee-200 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 text-coffee-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="text-lg font-medium text-coffee-900">{subscription.quantity}</span>
              <button
                onClick={() => handleQuantityChange(subscription.quantity + 1)}
                disabled={loading || subscription.status === "cancelled"}
                className="w-8 h-8 rounded-full bg-coffee-100 hover:bg-coffee-200 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 text-coffee-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Next Delivery */}
          {subscription.status === "active" && subscription.nextDeliveryDate && (
            <div className="bg-coffee-50 rounded-lg p-3 mb-4">
              <div className="text-xs text-coffee-600 font-medium mb-1">Next Delivery</div>
              <div className="text-coffee-900 font-light">
                {new Date(subscription.nextDeliveryDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2">
            {subscription.status === "active" && (
              <>
                <button
                  onClick={() => setShowFrequencyModal(true)}
                  disabled={loading}
                  className="w-full bg-coffee-100 text-coffee-900 py-2 px-4 rounded-lg hover:bg-coffee-200 transition-colors font-medium text-sm disabled:opacity-50"
                >
                  Change Frequency
                </button>
                <button
                  onClick={() => handleStatusChange("paused")}
                  disabled={loading}
                  className="w-full bg-yellow-100 text-yellow-800 py-2 px-4 rounded-lg hover:bg-yellow-200 transition-colors font-medium text-sm disabled:opacity-50"
                >
                  {loading ? "Pausing..." : "Pause Subscription"}
                </button>
              </>
            )}

            {subscription.status === "paused" && (
              <button
                onClick={() => handleStatusChange("active")}
                disabled={loading}
                className="w-full bg-green-100 text-green-800 py-2 px-4 rounded-lg hover:bg-green-200 transition-colors font-medium text-sm disabled:opacity-50"
              >
                {loading ? "Resuming..." : "Resume Subscription"}
              </button>
            )}

            {subscription.status !== "cancelled" && (
              <button
                onClick={handleCancel}
                disabled={loading}
                className="w-full bg-red-50 text-red-700 py-2 px-4 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm disabled:opacity-50"
              >
                {loading ? "Cancelling..." : "Cancel Subscription"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Frequency Change Modal */}
      {showFrequencyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-2xl font-light text-coffee-900 mb-4">Change Delivery Frequency</h3>
            <div className="space-y-3 mb-6">
              {["weekly", "bi-weekly", "monthly"].map((freq) => (
                <button
                  key={freq}
                  onClick={() => setNewFrequency(freq)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    newFrequency === freq
                      ? "border-coffee-700 bg-coffee-50"
                      : "border-coffee-200 hover:border-coffee-400"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-coffee-900">{frequencyLabels[freq]}</div>
                      <div className="text-sm text-coffee-600">
                        {freq === "weekly" ? "15%" : freq === "bi-weekly" ? "12%" : "10%"} discount
                      </div>
                    </div>
                    {newFrequency === freq && (
                      <svg className="w-6 h-6 text-coffee-700" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFrequencyModal(false)}
                className="flex-1 py-2 px-4 border-2 border-coffee-200 text-coffee-900 rounded-lg hover:bg-coffee-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleFrequencyChange}
                disabled={loading}
                className="flex-1 py-2 px-4 bg-coffee-900 text-white rounded-lg hover:bg-coffee-800 transition-colors disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
