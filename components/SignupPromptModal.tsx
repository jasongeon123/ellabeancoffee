"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SignupPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueAsGuest: () => void;
}

export default function SignupPromptModal({
  isOpen,
  onClose,
  onContinueAsGuest,
}: SignupPromptModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-fadeIn">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-coffee-400 hover:text-coffee-600 transition-colors"
        >
          <svg
            className="w-6 h-6"
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
        </button>

        {/* Icon */}
        <div className="w-16 h-16 bg-coffee-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-coffee-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>

        {/* Content */}
        <h2 className="text-2xl font-light text-coffee-900 text-center mb-4 tracking-tight">
          Create an Account?
        </h2>

        <p className="text-coffee-600 text-center mb-8 font-light">
          Save your order history and checkout faster next time!
        </p>

        {/* Benefits */}
        <div className="bg-coffee-50 rounded-lg p-4 mb-6">
          <ul className="space-y-2">
            <li className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"
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
              <span className="text-sm text-coffee-700">
                Track your order history
              </span>
            </li>
            <li className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"
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
              <span className="text-sm text-coffee-700">
                Faster checkout next time
              </span>
            </li>
            <li className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"
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
              <span className="text-sm text-coffee-700">
                Exclusive offers and updates
              </span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => router.push("/auth/signup")}
            className="w-full bg-coffee-900 text-white px-6 py-3 rounded-lg hover:bg-coffee-800 transition-colors font-medium"
          >
            Create Account
          </button>

          <button
            onClick={() => router.push("/auth/signin")}
            className="w-full bg-white border-2 border-coffee-300 text-coffee-900 px-6 py-3 rounded-lg hover:bg-coffee-50 transition-colors font-medium"
          >
            Sign In
          </button>

          <button
            onClick={onContinueAsGuest}
            className="w-full text-coffee-600 hover:text-coffee-900 transition-colors py-2 text-sm font-light"
          >
            Continue as Guest →
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
