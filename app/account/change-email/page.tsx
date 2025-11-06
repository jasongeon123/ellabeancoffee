"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function ChangeEmailPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
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
      const res = await fetch("/api/account/change-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newEmail,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to initiate email change");
        setLoading(false);
        return;
      }

      setSuccess(data.message);
      setNewEmail("");
      setPassword("");
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
            Change Email Address
          </h1>
          <p className="mt-2 text-sm text-coffee-600">
            Update your account email address
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-8">
          {/* Security Notice */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-600 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  How this works:
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Enter your new email and current password</li>
                    <li>We'll send a verification link to your new email</li>
                    <li>We'll notify your current email about this change</li>
                    <li>Click the link in your new email to complete the change</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

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
                htmlFor="currentEmail"
                className="block text-sm font-medium text-coffee-900 mb-2"
              >
                Current Email
              </label>
              <input
                type="email"
                id="currentEmail"
                value={session?.user?.email || ""}
                disabled
                className="w-full px-4 py-2 border border-coffee-200 rounded-md bg-gray-50 text-gray-500"
              />
            </div>

            <div>
              <label
                htmlFor="newEmail"
                className="block text-sm font-medium text-coffee-900 mb-2"
              >
                New Email Address
              </label>
              <input
                type="email"
                id="newEmail"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-coffee-200 rounded-md focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                disabled={loading}
                placeholder="your.new.email@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-coffee-900 mb-2"
              >
                Current Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-coffee-200 rounded-md focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                disabled={loading}
                placeholder="Verify your identity"
              />
              <p className="mt-1 text-xs text-coffee-600">
                Required for security verification
              </p>
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
                {loading ? "Sending..." : "Send Verification"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
