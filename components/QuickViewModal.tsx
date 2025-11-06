"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import AddToCartButton from "./AddToCartButton";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  roastLevel?: string;
  origin?: string;
  inStock: boolean;
  tastingNotes?: string[];
  brewingMethods?: string[];
  averageRating?: number;
  reviewCount?: number;
}

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Close on escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      style={{ margin: 0 }}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scale-in mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110"
          aria-label="Close modal"
        >
          <svg
            className="w-6 h-6 text-coffee-900"
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

        <div className="grid md:grid-cols-2 gap-6 p-6 md:p-8">
          {/* Product Image */}
          <div className="relative aspect-square bg-gradient-to-br from-coffee-50 to-coffee-100 rounded-xl overflow-hidden">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-coffee-900 text-white text-xs uppercase tracking-wider font-medium rounded-full mb-3">
                {product.category}
              </span>
              <h2 className="text-3xl md:text-4xl font-light text-coffee-900 mb-3 tracking-tight">
                {product.name}
              </h2>

              {/* Rating */}
              {product.reviewCount !== undefined && product.reviewCount > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="text-base">
                        {star <= Math.round(product.averageRating || 0) ? (
                          <span className="text-amber-500">★</span>
                        ) : (
                          <span className="text-coffee-300">☆</span>
                        )}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-coffee-600 font-light">
                    {product.averageRating?.toFixed(1)} ({product.reviewCount})
                  </span>
                </div>
              )}

              <p className="text-coffee-600 leading-relaxed font-light mb-4">
                {product.description}
              </p>

              {/* Quick Details */}
              {(product.roastLevel || product.origin) && (
                <div className="bg-coffee-50 rounded-lg p-4 mb-4 space-y-2">
                  {product.roastLevel && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-coffee-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                      </svg>
                      <span className="text-sm text-coffee-900">
                        <span className="font-medium">Roast:</span> {product.roastLevel}
                      </span>
                    </div>
                  )}
                  {product.origin && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-coffee-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-coffee-900">
                        <span className="font-medium">Origin:</span> {product.origin}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Tasting Notes */}
              {product.tastingNotes && product.tastingNotes.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs text-coffee-600 font-medium mb-2 uppercase tracking-wider">
                    Tasting Notes
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.tastingNotes.map((note, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-amber-50 text-amber-900 text-xs rounded-full border border-amber-200"
                      >
                        {note}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-4xl font-light text-coffee-900">
                  ${product.price.toFixed(2)}
                </span>
                {product.inStock ? (
                  <span className="text-sm text-green-600 font-light">In Stock</span>
                ) : (
                  <span className="text-sm text-red-600 font-light">Out of Stock</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-auto space-y-3">
              {product.inStock && (
                <AddToCartButton productId={product.id} />
              )}
              <Link
                href={`/products/${product.id}`}
                className="block w-full text-center px-8 py-4 border-2 border-coffee-900 text-coffee-900 text-xs tracking-wider uppercase font-medium hover:bg-coffee-900 hover:text-white transition-all duration-300 rounded-full"
                onClick={onClose}
              >
                View Full Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
