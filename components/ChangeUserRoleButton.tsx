"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ChangeUserRoleButton({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleChangeRole = async () => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    const confirmed = confirm(
      `Change user role to ${newRole}? This will ${
        newRole === "admin"
          ? "grant admin privileges"
          : "remove admin privileges"
      }.`
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to change user role");
      }
    } catch (error) {
      console.error("Failed to change role:", error);
      alert("Failed to change user role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleChangeRole}
      disabled={loading}
      className="px-3 py-1 text-sm border border-coffee-300 rounded hover:bg-coffee-100 transition-colors disabled:opacity-50"
    >
      {loading ? "..." : currentRole === "admin" ? "Remove Admin" : "Make Admin"}
    </button>
  );
}
