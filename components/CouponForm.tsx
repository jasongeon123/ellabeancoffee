"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CouponForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    code: "",
    discountType: "percent",
    discountPercent: "",
    discountAmount: "",
    minPurchase: "",
    maxUses: "",
    expiresAt: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload: any = {
        code: formData.code.toUpperCase(),
        discountPercent:
          formData.discountType === "percent"
            ? parseInt(formData.discountPercent)
            : null,
        discountAmount:
          formData.discountType === "amount"
            ? parseFloat(formData.discountAmount)
            : null,
        minPurchase: formData.minPurchase
          ? parseFloat(formData.minPurchase)
          : null,
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : null,
      };

      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create coupon");
      }

      setFormData({
        code: "",
        discountType: "percent",
        discountPercent: "",
        discountAmount: "",
        minPurchase: "",
        maxUses: "",
        expiresAt: "",
      });
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-coffee-900 mb-2">
            Coupon Code *
          </label>
          <input
            type="text"
            required
            value={formData.code}
            onChange={(e) =>
              setFormData({ ...formData, code: e.target.value.toUpperCase() })
            }
            placeholder="SAVE20"
            className="w-full px-4 py-2 border border-coffee-300 rounded focus:ring-2 focus:ring-coffee-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-coffee-900 mb-2">
            Discount Type *
          </label>
          <select
            value={formData.discountType}
            onChange={(e) =>
              setFormData({ ...formData, discountType: e.target.value })
            }
            className="w-full px-4 py-2 border border-coffee-300 rounded focus:ring-2 focus:ring-coffee-500"
          >
            <option value="percent">Percentage (%)</option>
            <option value="amount">Fixed Amount ($)</option>
          </select>
        </div>

        {formData.discountType === "percent" ? (
          <div>
            <label className="block text-sm font-medium text-coffee-900 mb-2">
              Discount Percentage *
            </label>
            <input
              type="number"
              required
              min="1"
              max="100"
              value={formData.discountPercent}
              onChange={(e) =>
                setFormData({ ...formData, discountPercent: e.target.value })
              }
              placeholder="20"
              className="w-full px-4 py-2 border border-coffee-300 rounded focus:ring-2 focus:ring-coffee-500"
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-coffee-900 mb-2">
              Discount Amount *
            </label>
            <input
              type="number"
              required
              min="0.01"
              step="0.01"
              value={formData.discountAmount}
              onChange={(e) =>
                setFormData({ ...formData, discountAmount: e.target.value })
              }
              placeholder="5.00"
              className="w-full px-4 py-2 border border-coffee-300 rounded focus:ring-2 focus:ring-coffee-500"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-coffee-900 mb-2">
            Minimum Purchase (optional)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.minPurchase}
            onChange={(e) =>
              setFormData({ ...formData, minPurchase: e.target.value })
            }
            placeholder="25.00"
            className="w-full px-4 py-2 border border-coffee-300 rounded focus:ring-2 focus:ring-coffee-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-coffee-900 mb-2">
            Max Uses (optional)
          </label>
          <input
            type="number"
            min="1"
            value={formData.maxUses}
            onChange={(e) =>
              setFormData({ ...formData, maxUses: e.target.value })
            }
            placeholder="100"
            className="w-full px-4 py-2 border border-coffee-300 rounded focus:ring-2 focus:ring-coffee-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-coffee-900 mb-2">
            Expires At (optional)
          </label>
          <input
            type="datetime-local"
            value={formData.expiresAt}
            onChange={(e) =>
              setFormData({ ...formData, expiresAt: e.target.value })
            }
            className="w-full px-4 py-2 border border-coffee-300 rounded focus:ring-2 focus:ring-coffee-500"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-coffee-600 text-white py-3 rounded hover:bg-coffee-700 transition-colors disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Coupon"}
      </button>
    </form>
  );
}
