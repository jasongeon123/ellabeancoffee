"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface OrderTrackingFormProps {
  order: {
    id: string;
    orderNumber: string;
    status: string;
    trackingCarrier?: string | null;
    trackingNumber?: string | null;
    trackingUrl?: string | null;
    notes?: string | null;
  };
}

export default function OrderTrackingForm({ order }: OrderTrackingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    status: order.status,
    trackingCarrier: order.trackingCarrier || "",
    trackingNumber: order.trackingNumber || "",
    trackingUrl: order.trackingUrl || "",
    notes: order.notes || "",
    updateMessage: "",
    updateLocation: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/orders/${order.id}/tracking`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update tracking");
      }

      setMessage("Tracking updated successfully!");
      // Clear update fields
      setFormData((prev) => ({
        ...prev,
        updateMessage: "",
        updateLocation: "",
      }));

      // Refresh the page to show new tracking update
      router.refresh();
    } catch (error) {
      setMessage("Error updating tracking");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Order Status */}
      <div>
        <label className="block text-sm font-medium text-coffee-700 mb-1">
          Order Status
        </label>
        <select
          value={formData.status}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, status: e.target.value }))
          }
          className="w-full px-3 py-2 border border-coffee-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-500"
        >
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Tracking Carrier */}
      <div>
        <label className="block text-sm font-medium text-coffee-700 mb-1">
          Carrier
        </label>
        <select
          value={formData.trackingCarrier}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, trackingCarrier: e.target.value }))
          }
          className="w-full px-3 py-2 border border-coffee-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-500"
        >
          <option value="">Select Carrier</option>
          <option value="USPS">USPS</option>
          <option value="UPS">UPS</option>
          <option value="FedEx">FedEx</option>
          <option value="DHL">DHL</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Tracking Number */}
      <div>
        <label className="block text-sm font-medium text-coffee-700 mb-1">
          Tracking Number
        </label>
        <input
          type="text"
          value={formData.trackingNumber}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, trackingNumber: e.target.value }))
          }
          className="w-full px-3 py-2 border border-coffee-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-500"
          placeholder="Enter tracking number"
        />
      </div>

      {/* Tracking URL */}
      <div>
        <label className="block text-sm font-medium text-coffee-700 mb-1">
          Tracking URL
        </label>
        <input
          type="url"
          value={formData.trackingUrl}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, trackingUrl: e.target.value }))
          }
          className="w-full px-3 py-2 border border-coffee-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-500"
          placeholder="https://..."
        />
      </div>

      {/* Admin Notes */}
      <div>
        <label className="block text-sm font-medium text-coffee-700 mb-1">
          Admin Notes (Internal)
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, notes: e.target.value }))
          }
          rows={3}
          className="w-full px-3 py-2 border border-coffee-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-500"
          placeholder="Internal notes..."
        />
      </div>

      <hr className="my-4 border-coffee-200" />

      <h3 className="text-sm font-medium text-coffee-900">Add Tracking Update</h3>

      {/* Update Message */}
      <div>
        <label className="block text-sm font-medium text-coffee-700 mb-1">
          Update Message *
        </label>
        <input
          type="text"
          value={formData.updateMessage}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, updateMessage: e.target.value }))
          }
          className="w-full px-3 py-2 border border-coffee-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-500"
          placeholder="e.g., Package shipped from facility"
        />
      </div>

      {/* Update Location */}
      <div>
        <label className="block text-sm font-medium text-coffee-700 mb-1">
          Location (Optional)
        </label>
        <input
          type="text"
          value={formData.updateLocation}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, updateLocation: e.target.value }))
          }
          className="w-full px-3 py-2 border border-coffee-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-500"
          placeholder="e.g., Los Angeles, CA"
        />
      </div>

      {message && (
        <p
          className={`text-sm ${
            message.includes("Error") ? "text-red-600" : "text-green-600"
          }`}
        >
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-coffee-900 text-white py-2 px-4 rounded-md hover:bg-coffee-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Updating..." : "Update Tracking"}
      </button>
    </form>
  );
}
