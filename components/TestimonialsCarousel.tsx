"use client";

import { useState, useEffect } from "react";

type Testimonial = {
  id: string;
  name: string;
  email: string | null;
  rating: number;
  comment: string;
  featured: boolean;
  approved: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export default function TestimonialsCarousel({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [testimonials.length]);

  const currentTestimonial = testimonials[currentIndex];

  return (
    <div className="relative max-w-4xl mx-auto">
      {/* Testimonial Card */}
      <div className="bg-white rounded-2xl p-8 sm:p-12 md:p-16 shadow-xl border border-coffee-100 transition-all duration-500">
        {/* Rating Stars */}
        <div className="flex gap-1 justify-center mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <span key={star} className="text-2xl sm:text-3xl">
              {star <= currentTestimonial.rating ? (
                <span className="text-amber-500">★</span>
              ) : (
                <span className="text-coffee-300">☆</span>
              )}
            </span>
          ))}
        </div>

        {/* Testimonial Text */}
        <blockquote className="text-xl sm:text-2xl md:text-3xl text-coffee-700 font-light leading-relaxed mb-8 text-center italic">
          "{currentTestimonial.comment}"
        </blockquote>

        {/* Author */}
        <div className="flex items-center justify-center gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-coffee-700 to-coffee-900 flex items-center justify-center text-white font-medium text-lg sm:text-xl">
            {currentTestimonial.name.charAt(0).toUpperCase()}
          </div>
          <div className="text-left">
            <p className="font-medium text-coffee-900 text-lg sm:text-xl">
              {currentTestimonial.name}
            </p>
            <p className="text-sm sm:text-base text-coffee-500">
              Verified Customer
            </p>
          </div>
          {currentTestimonial.featured && (
            <span className="text-amber-500 text-xl" title="Featured Review">
              ⭐
            </span>
          )}
        </div>
      </div>

      {/* Carousel Indicators */}
      <div className="flex justify-center gap-2 mt-8">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "bg-coffee-900 w-8"
                : "bg-coffee-300 hover:bg-coffee-500"
            }`}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() =>
          setCurrentIndex(
            (prev) => (prev - 1 + testimonials.length) % testimonials.length
          )
        }
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-12 w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-coffee-900 hover:bg-coffee-100 transition-all duration-300"
        aria-label="Previous testimonial"
      >
        ←
      </button>
      <button
        onClick={() =>
          setCurrentIndex((prev) => (prev + 1) % testimonials.length)
        }
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-12 w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-coffee-900 hover:bg-coffee-100 transition-all duration-300"
        aria-label="Next testimonial"
      >
        →
      </button>
    </div>
  );
}
