"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

interface Testimonial {
  id: string;
  name: string;
  email: string | null;
  rating: number;
  comment: string;
  approved: boolean;
  featured: boolean;
  createdAt: string;
}

export default function AdminTestimonialsPage() {
  const { data: session, status } = useSession();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");

  useEffect(() => {
    if (status === "unauthenticated" || (session?.user as any)?.role !== "admin") {
      redirect("/");
    }
  }, [session, status]);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await fetch("/api/testimonials");
      if (response.ok) {
        const data = await response.json();
        setTestimonials(data);
      }
    } catch (error) {
      console.error("Failed to fetch testimonials:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/testimonials/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: true }),
      });

      if (response.ok) {
        fetchTestimonials();
      }
    } catch (error) {
      console.error("Failed to approve testimonial:", error);
    }
  };

  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      const response = await fetch(`/api/admin/testimonials/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !currentFeatured }),
      });

      if (response.ok) {
        fetchTestimonials();
      }
    } catch (error) {
      console.error("Failed to toggle featured:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;

    try {
      const response = await fetch(`/api/admin/testimonials/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchTestimonials();
      }
    } catch (error) {
      console.error("Failed to delete testimonial:", error);
    }
  };

  const filteredTestimonials = testimonials.filter((t) => {
    if (filter === "pending") return !t.approved;
    if (filter === "approved") return t.approved;
    return true;
  });

  const approvedCount = testimonials.filter((t) => t.approved).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-coffee-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-900"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-coffee-50 to-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-light text-coffee-900 mb-2 tracking-tight">
            Manage Testimonials
          </h1>
          <p className="text-coffee-600 font-light">
            Review and approve customer testimonials ({approvedCount} approved, {testimonials.length - approvedCount} pending)
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setFilter("pending")}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              filter === "pending"
                ? "bg-coffee-900 text-white"
                : "bg-white text-coffee-700 hover:bg-coffee-100"
            }`}
          >
            Pending ({testimonials.filter((t) => !t.approved).length})
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              filter === "approved"
                ? "bg-coffee-900 text-white"
                : "bg-white text-coffee-700 hover:bg-coffee-100"
            }`}
          >
            Approved ({approvedCount})
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              filter === "all"
                ? "bg-coffee-900 text-white"
                : "bg-white text-coffee-700 hover:bg-coffee-100"
            }`}
          >
            All ({testimonials.length})
          </button>
        </div>

        {/* Testimonials List */}
        {filteredTestimonials.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-coffee-100">
            <p className="text-coffee-600 font-light">No testimonials found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTestimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white rounded-2xl shadow-lg p-6 border border-coffee-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-medium text-coffee-900">
                        {testimonial.name}
                      </h3>
                      {testimonial.approved && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                          Approved
                        </span>
                      )}
                      {testimonial.featured && (
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
                          ⭐ Featured
                        </span>
                      )}
                      {!testimonial.approved && (
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
                          Pending
                        </span>
                      )}
                    </div>
                    {testimonial.email && (
                      <p className="text-sm text-coffee-600 mb-2">{testimonial.email}</p>
                    )}
                    <div className="flex gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className="text-xl">
                          {star <= testimonial.rating ? (
                            <span className="text-amber-500">★</span>
                          ) : (
                            <span className="text-coffee-300">☆</span>
                          )}
                        </span>
                      ))}
                    </div>
                    <p className="text-coffee-700 font-light leading-relaxed">
                      "{testimonial.comment}"
                    </p>
                    <p className="text-xs text-coffee-500 mt-3">
                      Submitted {new Date(testimonial.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-coffee-100">
                  {!testimonial.approved && (
                    <button
                      onClick={() => handleApprove(testimonial.id)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      Approve
                    </button>
                  )}
                  {testimonial.approved && (
                    <button
                      onClick={() => handleToggleFeatured(testimonial.id, testimonial.featured)}
                      className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                        testimonial.featured
                          ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                          : "bg-coffee-100 text-coffee-700 hover:bg-coffee-200"
                      }`}
                    >
                      {testimonial.featured ? "Unfeature" : "Feature"}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(testimonial.id)}
                    className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
