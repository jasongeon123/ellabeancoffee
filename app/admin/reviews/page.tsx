"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  status: string;
  flagged: boolean;
  flagReason: string | null;
  businessResponse: string | null;
  respondedAt: string | null;
  verifiedPurchase: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  product: {
    id: string;
    name: string;
    image: string;
  };
}

export default function AdminReviewsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [businessResponse, setBusinessResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (
      status === "authenticated" &&
      (session?.user as any)?.role !== "admin"
    ) {
      router.push("/");
    }
  }, [session, status, router]);

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/reviews?filter=${filter}`);
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reviewId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchReviews();
      }
    } catch (error) {
      console.error("Error updating review status:", error);
    }
  };

  const handleUnflag = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unflag: true }),
      });

      if (response.ok) {
        fetchReviews();
      }
    } catch (error) {
      console.error("Error unflagging review:", error);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchReviews();
        if (selectedReview?.id === reviewId) {
          setSelectedReview(null);
        }
      }
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReview || !businessResponse.trim()) return;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/admin/reviews/${selectedReview.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessResponse: businessResponse.trim() }),
      });

      if (response.ok) {
        setBusinessResponse("");
        setSelectedReview(null);
        fetchReviews();
      }
    } catch (error) {
      console.error("Error submitting response:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const openResponseModal = (review: Review) => {
    setSelectedReview(review);
    setBusinessResponse(review.businessResponse || "");
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-coffee-50 flex items-center justify-center">
        <div className="text-coffee-600">Loading...</div>
      </div>
    );
  }

  if ((session?.user as any)?.role !== "admin") {
    return null;
  }

  const stats = {
    total: reviews.length,
    pending: reviews.filter((r) => r.status === "pending").length,
    flagged: reviews.filter((r) => r.flagged).length,
    approved: reviews.filter((r) => r.status === "approved" && !r.flagged)
      .length,
  };

  return (
    <div className="min-h-screen bg-coffee-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-light text-coffee-900 mb-8">
          Review Moderation
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <button
            onClick={() => setFilter("all")}
            className={`bg-white border-2 p-6 rounded-lg text-left transition-all ${
              filter === "all"
                ? "border-coffee-900"
                : "border-coffee-200 hover:border-coffee-400"
            }`}
          >
            <h3 className="text-sm font-medium text-coffee-600 mb-2">
              Total Reviews
            </h3>
            <p className="text-3xl font-light text-coffee-900">{stats.total}</p>
          </button>

          <button
            onClick={() => setFilter("pending")}
            className={`bg-white border-2 p-6 rounded-lg text-left transition-all ${
              filter === "pending"
                ? "border-orange-500"
                : "border-coffee-200 hover:border-coffee-400"
            }`}
          >
            <h3 className="text-sm font-medium text-coffee-600 mb-2">
              Pending Review
            </h3>
            <p className="text-3xl font-light text-orange-600">
              {stats.pending}
            </p>
          </button>

          <button
            onClick={() => setFilter("flagged")}
            className={`bg-white border-2 p-6 rounded-lg text-left transition-all ${
              filter === "flagged"
                ? "border-red-500"
                : "border-coffee-200 hover:border-coffee-400"
            }`}
          >
            <h3 className="text-sm font-medium text-coffee-600 mb-2">
              Flagged Reviews
            </h3>
            <p className="text-3xl font-light text-red-600">{stats.flagged}</p>
          </button>

          <button
            onClick={() => setFilter("approved")}
            className={`bg-white border-2 p-6 rounded-lg text-left transition-all ${
              filter === "approved"
                ? "border-green-500"
                : "border-coffee-200 hover:border-coffee-400"
            }`}
          >
            <h3 className="text-sm font-medium text-coffee-600 mb-2">
              Approved
            </h3>
            <p className="text-3xl font-light text-green-600">
              {stats.approved}
            </p>
          </button>
        </div>

        {/* Reviews List */}
        <div className="bg-white border border-coffee-200 rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-light text-coffee-900 mb-6">
              {filter.charAt(0).toUpperCase() + filter.slice(1)} Reviews
            </h2>

            {reviews.length === 0 ? (
              <p className="text-coffee-600 text-center py-8">
                No reviews found
              </p>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border border-coffee-200 rounded-lg p-6"
                  >
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <Image
                          src={review.product.image}
                          alt={review.product.name}
                          width={80}
                          height={80}
                          className="rounded-lg object-cover"
                        />
                      </div>

                      {/* Review Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-medium text-coffee-900">
                              {review.product.name}
                            </h3>
                            <p className="text-sm text-coffee-600">
                              by {review.user.name || review.user.email}
                              {review.verifiedPurchase && (
                                <span className="ml-2 text-green-600">
                                  ✓ Verified Purchase
                                </span>
                              )}
                            </p>
                          </div>

                          {/* Status Badges */}
                          <div className="flex gap-2">
                            {review.flagged && (
                              <span className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                                Flagged
                              </span>
                            )}
                            <span
                              className={`px-3 py-1 text-xs rounded-full ${
                                review.status === "approved"
                                  ? "bg-green-100 text-green-700"
                                  : review.status === "rejected"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-orange-100 text-orange-700"
                              }`}
                            >
                              {review.status.charAt(0).toUpperCase() +
                                review.status.slice(1)}
                            </span>
                          </div>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={
                                  star <= review.rating
                                    ? "text-yellow-500"
                                    : "text-gray-300"
                                }
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="text-sm text-coffee-600">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Review Comment */}
                        {review.comment && (
                          <p className="text-coffee-700 mb-3">
                            {review.comment}
                          </p>
                        )}

                        {/* Flag Reason */}
                        {review.flagged && review.flagReason && (
                          <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
                            <p className="text-sm text-red-800">
                              <strong>Flag Reason:</strong> {review.flagReason}
                            </p>
                          </div>
                        )}

                        {/* Business Response */}
                        {review.businessResponse && (
                          <div className="bg-coffee-50 border border-coffee-200 rounded p-3 mb-3">
                            <p className="text-sm font-medium text-coffee-900 mb-1">
                              Business Response:
                            </p>
                            <p className="text-sm text-coffee-700">
                              {review.businessResponse}
                            </p>
                            {review.respondedAt && (
                              <p className="text-xs text-coffee-600 mt-1">
                                {new Date(review.respondedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2 mt-4">
                          {review.status !== "approved" && (
                            <button
                              onClick={() =>
                                handleStatusChange(review.id, "approved")
                              }
                              className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                            >
                              Approve
                            </button>
                          )}

                          {review.status !== "rejected" && (
                            <button
                              onClick={() =>
                                handleStatusChange(review.id, "rejected")
                              }
                              className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                            >
                              Reject
                            </button>
                          )}

                          {review.status !== "pending" && (
                            <button
                              onClick={() =>
                                handleStatusChange(review.id, "pending")
                              }
                              className="px-4 py-2 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 transition-colors"
                            >
                              Set Pending
                            </button>
                          )}

                          {review.flagged && (
                            <button
                              onClick={() => handleUnflag(review.id)}
                              className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                            >
                              Unflag
                            </button>
                          )}

                          <button
                            onClick={() => openResponseModal(review)}
                            className="px-4 py-2 bg-coffee-900 text-white text-sm rounded hover:bg-coffee-800 transition-colors"
                          >
                            {review.businessResponse ? "Edit" : "Add"} Response
                          </button>

                          <button
                            onClick={() => handleDeleteReview(review.id)}
                            className="px-4 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Business Response Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h3 className="text-2xl font-light text-coffee-900 mb-4">
              Business Response
            </h3>

            <div className="mb-4 p-4 bg-coffee-50 rounded">
              <p className="text-sm text-coffee-600 mb-2">
                Review by {selectedReview.user.name || selectedReview.user.email}
              </p>
              <div className="flex mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={
                      star <= selectedReview.rating
                        ? "text-yellow-500"
                        : "text-gray-300"
                    }
                  >
                    ★
                  </span>
                ))}
              </div>
              {selectedReview.comment && (
                <p className="text-coffee-700">{selectedReview.comment}</p>
              )}
            </div>

            <form onSubmit={handleSubmitResponse}>
              <textarea
                value={businessResponse}
                onChange={(e) => setBusinessResponse(e.target.value)}
                placeholder="Enter your response to this review..."
                className="w-full border border-coffee-200 rounded px-4 py-3 text-coffee-900 focus:outline-none focus:ring-2 focus:ring-coffee-500 mb-4"
                rows={6}
                required
              />

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-coffee-900 text-white py-3 rounded hover:bg-coffee-800 transition-colors disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Response"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedReview(null);
                    setBusinessResponse("");
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
