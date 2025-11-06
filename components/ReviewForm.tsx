"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted?: () => void;
}

export default function ReviewForm({ productId, onReviewSubmitted }: ReviewFormProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [canReview, setCanReview] = useState<boolean | null>(null);
  const [checkingEligibility, setCheckingEligibility] = useState(true);

  // Check if user can review this product
  useEffect(() => {
    async function checkReviewEligibility() {
      if (status === 'loading') return;

      if (!session) {
        setCheckingEligibility(false);
        return;
      }

      try {
        const response = await fetch(`/api/user/can-review/${productId}`);
        if (response.ok) {
          const data = await response.json();
          setCanReview(data.canReview);
        } else {
          setCanReview(false);
        }
      } catch (error) {
        console.error('Error checking review eligibility:', error);
        setCanReview(false);
      } finally {
        setCheckingEligibility(false);
      }
    }

    checkReviewEligibility();
  }, [session, status, productId]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 5) {
      setError("Maximum 5 images allowed");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const newImages: string[] = [];

      for (let i = 0; i < Math.min(files.length, 5 - images.length); i++) {
        const file = files[i];

        // Check file size (max 2MB per image)
        if (file.size > 2 * 1024 * 1024) {
          setError(`Image ${file.name} is too large. Maximum size is 2MB`);
          continue;
        }

        // Convert to base64
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        newImages.push(base64);
      }

      setImages([...images, ...newImages]);
    } catch (err) {
      setError("Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

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
          images,
        }),
      });

      if (response.ok) {
        setRating(0);
        setComment("");
        setImages([]);
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

  if (checkingEligibility) {
    return (
      <div className="bg-white rounded-xl p-6 border border-coffee-200">
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coffee-900"></div>
        </div>
      </div>
    );
  }

  if (canReview === false) {
    return (
      <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h3 className="font-medium text-amber-900 mb-2">Purchase Required</h3>
            <p className="text-amber-800 text-sm font-light leading-relaxed">
              Only verified purchasers can leave reviews. Purchase this product to share your experience!
            </p>
          </div>
        </div>
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

      {/* Image Upload */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-coffee-900 mb-2">
          Add Photos (Optional, max 5)
        </label>

        {/* Image Preview Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-5 gap-2 mb-3">
            {images.map((image, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-coffee-200">
                <img src={image} alt={`Review ${index + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        {images.length < 5 && (
          <label className="flex items-center justify-center gap-2 border-2 border-dashed border-coffee-300 rounded-lg p-4 cursor-pointer hover:border-coffee-500 hover:bg-coffee-50 transition-all">
            <svg className="w-6 h-6 text-coffee-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm text-coffee-700">
              {uploading ? "Uploading..." : `Add ${images.length > 0 ? "more " : ""}photos`}
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}
        <p className="text-xs text-coffee-500 mt-2">
          Maximum 5 images, 2MB each. JPG, PNG, or GIF.
        </p>
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
