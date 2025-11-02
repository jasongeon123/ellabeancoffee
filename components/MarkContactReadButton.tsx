"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MarkContactReadButton({
  contactId,
  isRead,
}: {
  contactId: string;
  isRead: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/contacts/${contactId}/read`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: !isRead }),
      });

      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to update read status:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="px-4 py-2 text-sm border border-coffee-300 rounded hover:bg-coffee-100 transition-colors disabled:opacity-50"
    >
      {loading ? "..." : isRead ? "Mark Unread" : "Mark Read"}
    </button>
  );
}
