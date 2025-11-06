"use client";

import { useEffect, useState } from "react";

interface SocialProofProps {
  productId?: string;
  productName?: string;
}

interface OrderStats {
  totalOrders: number;
  productOrders?: number;
}

export default function SocialProof({ productId, productName }: SocialProofProps) {
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const url = productId
          ? `/api/stats/orders?productId=${productId}`
          : `/api/stats/orders`;

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch order stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [productId]);

  return (
    <div className="space-y-3">
      {/* Recent Orders - Only show if there are actual orders */}
      {!loading && stats && stats.totalOrders > 0 && (
        <div className="flex items-center gap-2 text-sm text-coffee-700 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
          </svg>
          <span className="font-medium">
            <span className="text-green-900">{stats.totalOrders}</span> {stats.totalOrders === 1 ? 'order' : 'orders'} in the last 24 hours
          </span>
        </div>
      )}

      {/* Product-specific orders - Only show if this product has orders */}
      {!loading && stats && productId && (stats.productOrders ?? 0) > 0 && (
        <div className="flex items-center gap-2 text-sm text-coffee-700 bg-amber-50 px-4 py-2 rounded-lg border border-amber-200">
          <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="font-medium">
            <span className="text-amber-900">{stats.productOrders}</span> {stats.productOrders === 1 ? 'person' : 'people'} bought this recently
          </span>
        </div>
      )}

      {/* Free Shipping */}
      <div className="flex items-center gap-2 text-sm text-coffee-700 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
          />
        </svg>
        <span className="font-medium text-blue-900">Free shipping on orders over $50</span>
      </div>

      {/* Satisfaction Guarantee */}
      <div className="flex items-center gap-2 text-sm text-coffee-700 bg-purple-50 px-4 py-2 rounded-lg border border-purple-200">
        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="font-medium text-purple-900">100% Satisfaction Guaranteed</span>
      </div>
    </div>
  );
}
