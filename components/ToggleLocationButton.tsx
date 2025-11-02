"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ToggleLocationButton({
  locationId,
  currentStatus,
}: {
  locationId: string;
  currentStatus: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/locations/${locationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentStatus }),
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to toggle location:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="text-coffee-700 hover:text-coffee-900 text-sm disabled:opacity-50 px-3 py-1 border border-coffee-300"
    >
      {loading ? "..." : currentStatus ? "Hide" : "Show"}
    </button>
  );
}
