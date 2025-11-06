import { Suspense } from "react";
import ProductShowcase from "@/components/ProductShowcase";
import { ProductCardSkeleton } from "@/components/SkeletonLoader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Coffee Collection | Ella Bean Coffee",
  description: "Browse our selection of premium artisan coffee. Each blend carefully selected and roasted to perfection.",
  keywords: ["coffee", "premium coffee", "artisan coffee", "coffee beans", "specialty coffee"],
};

// Enable ISR - revalidate products page every 30 minutes
export const revalidate = 1800;

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-coffee-100 to-coffee-50">
      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 md:py-24 bg-coffee-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/coffee-pattern.svg')] bg-repeat opacity-20"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-block mb-4 sm:mb-6">
            <span className="px-4 py-2 bg-coffee-700 text-white text-xs uppercase tracking-widest font-medium rounded-full">
              Premium Selection
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-white mb-6 tracking-tight">
            Coffee Collection
          </h1>
          <p className="text-lg sm:text-xl text-coffee-100 font-light max-w-3xl mx-auto leading-relaxed">
            Discover our carefully curated selection of premium coffee beans, roasted to perfection and sourced from the finest farms around the world
          </p>
        </div>
      </section>

      {/* Filters Section - Future Enhancement */}
      <section className="py-6 border-b border-coffee-200 bg-white/50 backdrop-blur-sm sticky top-20 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <p className="text-coffee-700 font-light">
              Browse our collection
            </p>
            {/* Future: Add filter/sort options here */}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Suspense
            fallback={
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <ProductCardSkeleton />
                <ProductCardSkeleton />
                <ProductCardSkeleton />
                <ProductCardSkeleton />
                <ProductCardSkeleton />
                <ProductCardSkeleton />
                <ProductCardSkeleton />
                <ProductCardSkeleton />
                <ProductCardSkeleton />
              </div>
            }
          >
            <ProductShowcase />
          </Suspense>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-white/80 backdrop-blur-sm border-t border-coffee-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-light text-coffee-900 text-center mb-12">
            Why Choose Ella Bean Coffee
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-block p-4 bg-coffee-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-coffee-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-coffee-900 mb-2">Premium Quality</h3>
              <p className="text-coffee-600 font-light">
                Only the finest beans, carefully selected and expertly roasted
              </p>
            </div>

            <div className="text-center">
              <div className="inline-block p-4 bg-coffee-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-coffee-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-coffee-900 mb-2">Global Sourcing</h3>
              <p className="text-coffee-600 font-light">
                Ethically sourced from the best coffee-growing regions worldwide
              </p>
            </div>

            <div className="text-center">
              <div className="inline-block p-4 bg-coffee-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-coffee-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-coffee-900 mb-2">Made with Love</h3>
              <p className="text-coffee-600 font-light">
                Every batch roasted with passion and attention to detail
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
