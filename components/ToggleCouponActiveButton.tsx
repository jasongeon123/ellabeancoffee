"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ToggleCouponActiveButton({
  couponId,
  isActive,
}: {
  couponId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/coupons/${couponId}/active`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !isActive }),
      });

      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to toggle coupon:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`px-3 py-1 text-sm rounded transition-colors ${
        isActive
          ? "bg-green-600 text-white hover:bg-green-700"
          : "bg-gray-400 text-white hover:bg-gray-500"
      } disabled:opacity-50`}
    >
      {loading ? "..." : isActive ? "Active" : "Inactive"}
    </button>
  );
}
