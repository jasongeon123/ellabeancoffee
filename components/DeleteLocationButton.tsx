"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteLocationButton({ locationId }: { locationId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this location?")) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/locations/${locationId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to delete location:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50 px-3 py-1"
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}
