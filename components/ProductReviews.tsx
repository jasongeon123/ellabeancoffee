"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import ReviewForm from "./ReviewForm";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  images: string[];
  verifiedPurchase: boolean;
  helpfulVotes: number;
  notHelpfulVotes: number;
  businessResponse: string | null;
  respondedAt: string | null;
  status: string;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
  };
  userVote?: { helpful: boolean } | null;
}

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [flagReviewId, setFlagReviewId] = useState<string | null>(null);
  const [flagReason, setFlagReason] = useState("");
  const [flagging, setFlagging] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      const response = await fetch(`/api/products/${productId}/reviews`);
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
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

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

  const handleVote = async (reviewId: string, helpful: boolean) => {
    if (!session) {
      return;
    }

    try {
      const response = await fetch(`/api/reviews/${reviewId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ helpful }),
      });

      if (response.ok) {
        // Refresh reviews to get updated vote counts
        fetchReviews();
      }
    } catch (error) {
      console.error("Failed to vote:", error);
    }
  };

  const handleFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flagReviewId || !flagReason.trim()) return;

    try {
      setFlagging(true);
      const response = await fetch(`/api/reviews/${flagReviewId}/flag`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: flagReason.trim() }),
      });

      if (response.ok) {
        alert("Review has been flagged for moderation. Thank you for your feedback.");
        setFlagReviewId(null);
        setFlagReason("");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to flag review");
      }
    } catch (error) {
      console.error("Failed to flag review:", error);
      alert("Failed to flag review. Please try again.");
    } finally {
      setFlagging(false);
    }
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
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-coffee-700 rounded-full flex items-center justify-center text-white font-medium">
                    {(review.user.name || review.user.email).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-coffee-900">
                      {review.user.name || review.user.email.split("@")[0]}
                    </p>
                    {review.verifiedPurchase && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full mt-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified Purchase
                      </span>
                    )}
                    <p className="text-xs text-coffee-500 mt-1">
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                {renderStars(review.rating)}
              </div>

              {review.comment && (
                <p className="text-coffee-700 font-light leading-relaxed mb-4">{review.comment}</p>
              )}

              {/* Review Images */}
              {review.images && review.images.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {review.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(image)}
                      className="relative aspect-square rounded-lg overflow-hidden border border-coffee-200 hover:border-coffee-400 transition-colors cursor-pointer"
                    >
                      <img src={image} alt={`Review photo ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Business Response */}
              {review.businessResponse && (
                <div className="mt-4 bg-coffee-50 border-l-4 border-coffee-700 p-4 rounded">
                  <p className="text-sm font-medium text-coffee-900 mb-2">Response from Ella Bean Coffee:</p>
                  <p className="text-sm text-coffee-700 leading-relaxed">{review.businessResponse}</p>
                  {review.respondedAt && (
                    <p className="text-xs text-coffee-500 mt-2">
                      {new Date(review.respondedAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
              )}

              {/* Voting Section */}
              <div className="flex items-center justify-between pt-4 border-t border-coffee-100">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-coffee-600 font-light">Was this helpful?</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVote(review.id, true)}
                      disabled={!session}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                        review.userVote?.helpful === true
                          ? "bg-green-100 text-green-700 border border-green-300"
                          : "bg-coffee-50 text-coffee-700 hover:bg-coffee-100 border border-coffee-200"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                      <span>{review.helpfulVotes}</span>
                    </button>
                    <button
                      onClick={() => handleVote(review.id, false)}
                      disabled={!session}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                        review.userVote?.helpful === false
                          ? "bg-red-100 text-red-700 border border-red-300"
                          : "bg-coffee-50 text-coffee-700 hover:bg-coffee-100 border border-coffee-200"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                      </svg>
                      <span>{review.notHelpfulVotes}</span>
                    </button>
                  </div>
                </div>

                {/* Flag Button */}
                {session && review.user.email !== (session.user as any)?.email && (
                  <button
                    onClick={() => setFlagReviewId(review.id)}
                    className="text-sm text-coffee-600 hover:text-red-600 transition-colors flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                    </svg>
                    Flag
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={selectedImage}
            alt="Review photo full size"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Flag Review Modal */}
      {flagReviewId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-2xl font-light text-coffee-900 mb-4">Flag Review</h3>
            <p className="text-sm text-coffee-600 mb-4">
              Please let us know why you're flagging this review. Our team will review it promptly.
            </p>
            <form onSubmit={handleFlag}>
              <textarea
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                placeholder="Reason for flagging (e.g., spam, inappropriate content, fake review, etc.)"
                className="w-full border border-coffee-200 rounded px-4 py-3 text-coffee-900 focus:outline-none focus:ring-2 focus:ring-coffee-500 mb-4"
                rows={4}
                required
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={flagging}
                  className="flex-1 bg-red-600 text-white py-3 rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {flagging ? "Flagging..." : "Flag Review"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFlagReviewId(null);
                    setFlagReason("");
                  }}
                  className="flex-1 border border-coffee-300 text-coffee-900 py-3 rounded hover:bg-coffee-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
