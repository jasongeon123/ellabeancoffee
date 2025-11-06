"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ReturnRequest {
  id: string;
  orderNumber: string;
  reason: string;
  items: string[];
  status: string;
  refundAmount: number | null;
  adminNotes: string | null;
  createdAt: Date;
  user: {
    name: string | null;
    email: string;
  };
}

interface ReturnManagementCardProps {
  returnRequest: ReturnRequest;
}

export default function ReturnManagementCard({
  returnRequest,
}: ReturnManagementCardProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [adminNotes, setAdminNotes] = useState(returnRequest.adminNotes || "");
  const [refundAmount, setRefundAmount] = useState(
    returnRequest.refundAmount?.toString() || ""
  );

  const handleStatusUpdate = async (newStatus: string) => {
    if (!confirm(`Are you sure you want to mark this return as ${newStatus}?`)) {
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch(`/api/admin/returns/${returnRequest.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          adminNotes: adminNotes || undefined,
          refundAmount: refundAmount ? parseFloat(refundAmount) : undefined,
        }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("Failed to update return status");
      }
    } catch (error) {
      alert("Failed to update return status");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-coffee-200 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs text-coffee-500 uppercase tracking-wider mb-1">
            Return Request
          </p>
          <h3 className="text-lg font-light text-coffee-900 mb-1">
            Order #{returnRequest.orderNumber}
          </h3>
          <p className="text-sm text-coffee-600">
            Customer: {returnRequest.user.name || returnRequest.user.email}
          </p>
          <p className="text-xs text-coffee-500 mt-1">
            Requested on{" "}
            {new Date(returnRequest.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="text-right">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs uppercase tracking-wider font-medium ${
              returnRequest.status === "completed"
                ? "bg-green-100 text-green-700"
                : returnRequest.status === "approved"
                ? "bg-blue-100 text-blue-700"
                : returnRequest.status === "rejected"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {returnRequest.status}
          </span>
          {returnRequest.refundAmount && (
            <p className="text-sm text-coffee-600 mt-2">
              Refund: ${returnRequest.refundAmount.toFixed(2)}
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-coffee-100 pt-4 mb-4">
        <p className="text-sm text-coffee-600 mb-2 font-medium">Reason:</p>
        <p className="text-coffee-900 font-light">{returnRequest.reason}</p>
        <p className="text-xs text-coffee-500 mt-2">
          {returnRequest.items.length} item(s) to be returned
        </p>
      </div>

      {/* Admin Notes Section */}
      {(showNotes || returnRequest.adminNotes) && (
        <div className="border-t border-coffee-100 pt-4 mb-4">
          <label className="block text-sm text-coffee-600 mb-2 font-medium">
            Admin Notes:
          </label>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 text-sm"
            placeholder="Add notes about this return..."
          />
        </div>
      )}

      {/* Refund Amount */}
      {returnRequest.status !== "rejected" && (
        <div className="border-t border-coffee-100 pt-4 mb-4">
          <label className="block text-sm text-coffee-600 mb-2 font-medium">
            Refund Amount:
          </label>
          <input
            type="number"
            step="0.01"
            value={refundAmount}
            onChange={(e) => setRefundAmount(e.target.value)}
            className="w-full px-3 py-2 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 text-sm"
            placeholder="0.00"
          />
        </div>
      )}

      {/* Action Buttons */}
      {returnRequest.status === "pending" && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleStatusUpdate("approved")}
            disabled={isUpdating}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {isUpdating ? "Updating..." : "Approve"}
          </button>
          <button
            onClick={() => handleStatusUpdate("rejected")}
            disabled={isUpdating}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {isUpdating ? "Updating..." : "Reject"}
          </button>
          {!showNotes && !returnRequest.adminNotes && (
            <button
              onClick={() => setShowNotes(true)}
              className="px-4 py-2 border border-coffee-300 text-coffee-700 rounded-lg hover:bg-coffee-50 transition-colors text-sm font-medium"
            >
              Add Notes
            </button>
          )}
        </div>
      )}

      {returnRequest.status === "approved" && (
        <button
          onClick={() => handleStatusUpdate("completed")}
          disabled={isUpdating}
          className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
        >
          {isUpdating ? "Updating..." : "Mark as Completed"}
        </button>
      )}
    </div>
  );
}
