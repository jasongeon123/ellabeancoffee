"use client";

import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "./AddToCartButton";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  averageRating?: number;
  reviewCount?: number;
}

export default function ProductCard({ product, index }: { product: Product; index: number }) {
  const [isVisible, setIsVisible] = useState(false);
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
        <div className="relative h-64 sm:h-72 md:h-80 bg-gradient-to-br from-coffee-50 to-coffee-100 overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-2"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
      </Link>
      <div className="p-5 sm:p-6 md:p-8">
        <Link href={`/products/${product.id}`}>
          <h3 className="text-xl sm:text-2xl font-light text-coffee-900 mb-2 sm:mb-3 transition-colors group-hover:text-coffee-700 tracking-tight cursor-pointer">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {product.reviewCount !== undefined && product.reviewCount > 0 && (
          <div className="flex items-center gap-2 mb-2">
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

        <p className="text-coffee-600 text-sm sm:text-base mb-4 sm:mb-6 line-clamp-2 leading-relaxed font-light">
          {product.description}
        </p>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-4 border-t border-coffee-100">
          <div>
            <div className="text-xs text-coffee-500 uppercase tracking-wider mb-1">Price</div>
            <span className="text-2xl sm:text-3xl font-light text-coffee-900">
              ${product.price.toFixed(2)}
            </span>
          </div>
          <AddToCartButton productId={product.id} />
        </div>
      </div>
    </div>
  );
}
