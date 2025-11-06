"use client";

import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "./AddToCartButton";
import QuickViewModal from "./QuickViewModal";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  roastLevel?: string | null;
  origin?: string | null;
  inStock: boolean;
  tastingNotes?: string[];
  brewingMethods?: string[];
  averageRating?: number;
  reviewCount?: number;
}

export default function ProductCard({ product, index }: { product: Product; index: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, index * 100); // Staggered animation
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px",
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [index]);

  // Prefetch product page on hover for instant navigation
  const handleMouseEnter = () => {
    router.prefetch(`/products/${product.id}`);
  };

  return (
    <div
      ref={ref}
      onMouseEnter={handleMouseEnter}
      className={`bg-white rounded-2xl shadow-md hover:shadow-2xl overflow-hidden group transition-all duration-700 ease-out border border-coffee-100 ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-12"
      }`}
    >
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative h-48 sm:h-56 md:h-60 bg-gradient-to-br from-coffee-50 to-coffee-100 overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-2"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          {/* Quick View Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowQuickView(true);
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-100 scale-90 bg-white text-coffee-900 px-6 py-3 rounded-full text-xs uppercase tracking-wider font-medium shadow-lg hover:bg-coffee-900 hover:text-white z-10"
          >
            Quick View
          </button>
        </div>
      </Link>
      <div className="p-4 sm:p-5 md:p-6">
        <Link href={`/products/${product.id}`}>
          <h3 className="text-lg sm:text-xl font-light text-coffee-900 mb-1.5 sm:mb-2 transition-colors group-hover:text-coffee-700 tracking-tight cursor-pointer">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {product.reviewCount !== undefined && product.reviewCount > 0 && (
          <div className="flex items-center gap-2 mb-1.5">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className="text-sm">
                  {star <= Math.round(product.averageRating || 0) ? (
                    <span className="text-amber-500">★</span>
                  ) : (
                    <span className="text-coffee-300">☆</span>
                  )}
                </span>
              ))}
            </div>
            <span className="text-xs text-coffee-600 font-light">
              ({product.reviewCount})
            </span>
          </div>
        )}

        <p className="text-coffee-600 text-sm mb-3 sm:mb-4 line-clamp-2 leading-relaxed font-light">
          {product.description}
        </p>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pt-3 border-t border-coffee-100">
          <div>
            <div className="text-xs text-coffee-500 uppercase tracking-wider mb-1">Price</div>
            <span className="text-xl sm:text-2xl font-light text-coffee-900">
              ${product.price.toFixed(2)}
            </span>
          </div>
          <AddToCartButton productId={product.id} />
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={product}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
      />
    </div>
  );
}
