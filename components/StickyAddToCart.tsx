"use client";

import { useEffect, useState } from "react";
import AddToCartButton from "./AddToCartButton";

interface StickyAddToCartProps {
  productId: string;
  productName: string;
  productPrice: number;
  inStock: boolean;
}

export default function StickyAddToCart({
  productId,
  productName,
  productPrice,
  inStock,
}: StickyAddToCartProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky button when user scrolls past the main add to cart button
      // The main button is around 600-700px from the top on most screens
      const scrollThreshold = 700;
      setIsVisible(window.scrollY > scrollThreshold);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!inStock) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-coffee-200 shadow-2xl p-4 transition-transform duration-300 md:hidden ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="max-w-lg mx-auto flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-coffee-900 truncate">
            {productName}
          </h3>
          <p className="text-lg font-light text-coffee-900">
            ${productPrice.toFixed(2)}
          </p>
        </div>
        <div className="flex-shrink-0">
          <AddToCartButton productId={productId} />
        </div>
      </div>
    </div>
  );
}
