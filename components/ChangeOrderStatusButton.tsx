"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function ChangeOrderStatusButton({
  orderId,
  currentStatus,
  customerEmail,
}: {
  orderId: string;
  currentStatus: string;
  customerEmail: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    const confirmed = confirm(
      `Change order status to ${newStatus}? ${
        newStatus === "completed"
          ? "A confirmation email will be sent to the customer."
          : ""
      }`
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to update order status");
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update order status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <span
        className={`inline-block px-3 py-1 rounded text-xs font-medium text-center ${
          statusColors[currentStatus as keyof typeof statusColors]
        }`}
      >
        {currentStatus}
      </span>
      <div className="flex gap-1">
        {currentStatus !== "completed" && (
          <button
            onClick={() => handleStatusChange("completed")}
            disabled={loading}
            className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            Complete
          </button>
        )}
        {currentStatus !== "cancelled" && (
          <button
            onClick={() => handleStatusChange("cancelled")}
            disabled={loading}
            className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
