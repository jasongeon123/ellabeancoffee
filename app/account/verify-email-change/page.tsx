"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";

export default function VerifyEmailChangePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const [newEmail, setNewEmail] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link. No token provided.");
        return;
      }

      try {
        const res = await fetch("/api/account/verify-email-change", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (!res.ok) {
          setStatus("error");
          setMessage(data.error || "Failed to verify email change");
          return;
        }

        setStatus("success");
        setMessage(data.message);
        setNewEmail(data.newEmail);

        // Sign out after 3 seconds so user can sign in with new email
        setTimeout(() => {
          signOut({ callbackUrl: "/auth/signin" });
        }, 3000);
      } catch (err) {
        setStatus("error");
        setMessage("An error occurred during verification. Please try again.");
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 via-white to-coffee-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          {status === "loading" && (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-600 mb-4"></div>
              <h2 className="text-xl font-semibold text-coffee-900 mb-2">
                Verifying your email...
              </h2>
              <p className="text-coffee-600">Please wait a moment</p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-coffee-900 mb-2">
                Email Verified!
              </h2>
              <p className="text-coffee-600 mb-4">{message}</p>
              {newEmail && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
                  <p className="text-sm text-green-800">
                    Your new email address: <strong>{newEmail}</strong>
                  </p>
                </div>
              )}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-800">
                  You will be signed out in a few seconds. Please sign in again
                  with your new email address.
                </p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-coffee-900 mb-2">
                Verification Failed
              </h2>
              <p className="text-coffee-600 mb-6">{message}</p>
              <div className="space-y-3">
                <button
                  onClick={() => router.push("/account/change-email")}
                  className="w-full px-4 py-2 bg-coffee-600 text-white rounded-md hover:bg-coffee-700 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => router.push("/account")}
                  className="w-full px-4 py-2 border border-coffee-300 text-coffee-700 rounded-md hover:bg-coffee-50 transition-colors"
                >
                  Back to Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
