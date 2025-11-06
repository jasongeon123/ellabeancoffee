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

  const handleChangeRole = async (newRole: string) => {
    if (newRole === currentRole) return;

    const roleDescriptions = {
      user: "Customer (can make purchases and reviews)",
      admin: "Admin (full system access)",
    };

    const confirmed = confirm(
      `Change user role to ${newRole}?\n\n${roleDescriptions[newRole as keyof typeof roleDescriptions]}`
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
        const data = await res.json();
        alert(data.error || "Failed to change user role");
      }
    } catch (error) {
      console.error("Failed to change role:", error);
      alert("Failed to change user role");
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-700 border-purple-300";
      case "user":
        return "bg-green-100 text-green-700 border-green-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  return (
    <select
      value={currentRole}
      onChange={(e) => handleChangeRole(e.target.value)}
      disabled={loading}
      className={`px-3 py-1 text-sm border rounded transition-colors disabled:opacity-50 cursor-pointer ${getRoleColor(currentRole)}`}
    >
      <option value="user">Customer</option>
      <option value="admin">Admin</option>
    </select>
  );
}
