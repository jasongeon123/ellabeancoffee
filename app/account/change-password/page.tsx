"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-coffee-600">Loading...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/account/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to change password");
        setLoading(false);
        return;
      }

      setSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Redirect to account page after 2 seconds
      setTimeout(() => {
        router.push("/account");
      }, 2000);
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 via-white to-coffee-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-coffee-900 tracking-tight">
            Change Password
          </h1>
          <p className="mt-2 text-sm text-coffee-600">
            Update your account password
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-coffee-900 mb-2"
              >
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-coffee-200 rounded-md focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-coffee-900 mb-2"
              >
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-coffee-200 rounded-md focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                disabled={loading}
              />
              <p className="mt-1 text-xs text-coffee-600">
                Minimum 6 characters
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-coffee-900 mb-2"
              >
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-coffee-200 rounded-md focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.push("/account")}
                className="flex-1 px-4 py-2 border border-coffee-300 text-coffee-700 rounded-md hover:bg-coffee-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-coffee-600 text-white rounded-md hover:bg-coffee-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "Changing..." : "Change Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
