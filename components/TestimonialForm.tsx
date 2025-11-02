"use client";

import { useState } from "react";

export default function TestimonialForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rating: 5,
    comment: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/testimonials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(data.message);
        setFormData({ name: "", email: "", rating: 5, comment: "" });
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to submit testimonial");
      }
    } catch (error) {
      setStatus("error");
      setMessage("An unexpected error occurred");
    }
  };

  if (status === "success") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
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
        <h3 className="text-2xl font-light text-coffee-900 mb-2">Thank You!</h3>
        <p className="text-coffee-600 font-light">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-coffee-900 mb-2">
          Your Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 border border-coffee-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-700 focus:border-transparent font-light"
          placeholder="Enter your name"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-coffee-900 mb-2">
          Email (Optional)
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-3 border border-coffee-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-700 focus:border-transparent font-light"
          placeholder="your.email@example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-coffee-900 mb-2">
          Your Rating <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setFormData({ ...formData, rating: star })}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="text-3xl transition-transform hover:scale-110 focus:outline-none"
              aria-label={`Rate ${star} stars`}
            >
              {star <= (hoveredRating || formData.rating) ? (
                <span className="text-amber-500">★</span>
              ) : (
                <span className="text-coffee-300">☆</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-coffee-900 mb-2">
          Your Testimonial <span className="text-red-500">*</span>
        </label>
        <textarea
          id="comment"
          required
          rows={5}
          value={formData.comment}
          onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
          className="w-full px-4 py-3 border border-coffee-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-700 focus:border-transparent font-light resize-none"
          placeholder="Share your experience with Ella Bean Coffee..."
          minLength={10}
          maxLength={1000}
        />
        <p className="text-xs text-coffee-500 mt-1">
          {formData.comment.length}/1000 characters
        </p>
      </div>

      {status === "error" && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{message}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-coffee-900 hover:bg-coffee-800 text-white py-4 rounded-full uppercase text-sm tracking-widest font-medium transition-all disabled:bg-coffee-300 disabled:cursor-not-allowed"
      >
        {status === "loading" ? "Submitting..." : "Submit Testimonial"}
      </button>

      <p className="text-xs text-coffee-500 text-center">
        Your testimonial will be reviewed before being published on our website.
      </p>
    </form>
  );
}
