"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted?: () => void;
}

export default function ReviewForm({ productId, onReviewSubmitted }: ReviewFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      router.push("/auth/signin");
      return;
    }

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          rating,
          comment,
        }),
      });

      if (response.ok) {
        setRating(0);
        setComment("");
        if (onReviewSubmitted) {
          onReviewSubmitted();
        }
      } else {
        const data = await response.json();
        setError(data.error || "Failed to submit review");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="bg-coffee-50 rounded-xl p-6 text-center border border-coffee-200">
        <p className="text-coffee-700 mb-4 font-light">Sign in to leave a review</p>
        <button
          onClick={() => router.push("/auth/signin")}
          className="bg-coffee-900 text-white px-6 py-2 rounded-full hover:bg-coffee-800 transition-all text-sm uppercase tracking-wider font-medium"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 border border-coffee-200">
      <h3 className="text-xl font-light text-coffee-900 mb-4 tracking-tight">Write a Review</h3>

      {/* Star Rating */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-coffee-900 mb-2">Your Rating</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="text-3xl transition-all hover:scale-110"
            >
              {star <= (hoveredRating || rating) ? (
                <span className="text-amber-500">★</span>
              ) : (
                <span className="text-coffee-300">☆</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Comment */}
      <div className="mb-4">
        <label htmlFor="comment" className="block text-sm font-medium text-coffee-900 mb-2">
          Your Review (Optional)
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-900 focus:border-transparent transition-all resize-none"
          placeholder="Tell us about your experience with this coffee..."
        />
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || rating === 0}
        className="w-full bg-coffee-900 text-white py-3 rounded-full hover:bg-coffee-800 transition-all duration-300 uppercase text-xs tracking-widest font-medium shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
