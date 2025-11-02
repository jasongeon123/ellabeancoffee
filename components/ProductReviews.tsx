"use client";

import { useState, useEffect } from "react";
import ReviewForm from "./ReviewForm";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
  };
}

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews/${productId}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews);
        setAverageRating(data.averageRating);
        setTotalReviews(data.totalReviews);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className="text-lg">
            {star <= rating ? (
              <span className="text-amber-500">★</span>
            ) : (
              <span className="text-coffee-300">☆</span>
            )}
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-coffee-600 font-light">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Average Rating Summary */}
      <div className="bg-white rounded-xl p-6 border border-coffee-200">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-5xl font-light text-coffee-900 mb-2">
              {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
            </div>
            {renderStars(Math.round(averageRating))}
            <p className="text-sm text-coffee-600 font-light mt-2">
              {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
            </p>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-light text-coffee-900 mb-3 tracking-tight">
              Customer Reviews
            </h3>
            <p className="text-coffee-600 font-light text-sm">
              {totalReviews > 0
                ? "See what our customers are saying"
                : "Be the first to review this product!"}
            </p>
          </div>
        </div>
      </div>

      {/* Review Form */}
      <ReviewForm productId={productId} onReviewSubmitted={fetchReviews} />

      {/* Reviews List */}
      {reviews.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-light text-coffee-900 tracking-tight">All Reviews</h3>
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-xl p-6 border border-coffee-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-coffee-900">
                    {review.user.name || review.user.email.split("@")[0]}
                  </p>
                  <p className="text-xs text-coffee-500 mt-1">
                    {new Date(review.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                {renderStars(review.rating)}
              </div>
              {review.comment && (
                <p className="text-coffee-700 font-light leading-relaxed">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
