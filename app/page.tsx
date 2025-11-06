import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import BulletinBoard from "@/components/BulletinBoard";
import ProductShowcase from "@/components/ProductShowcase";
import ScrollReveal from "@/components/ScrollReveal";
import ParallaxSection from "@/components/ParallaxSection";
import ScrollDownButton from "@/components/ScrollDownButton";
import TestimonialsSection from "@/components/TestimonialsSection";
import OrganizationStructuredData from "@/components/seo/OrganizationStructuredData";
import { ProductCardSkeleton } from "@/components/SkeletonLoader";

// Enable ISR - revalidate home page every 30 minutes
export const revalidate = 1800;

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      <OrganizationStructuredData />
      {/* Hero Section */}
      <section className="relative min-h-[100vh] sm:min-h-[90vh] flex items-center justify-center bg-coffee-100">
        <div className="absolute inset-0 z-0">
          <Image
            src="/logo.jpg"
            alt="Ella Bean Coffee"
            fill
            className="object-cover opacity-25"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-coffee-900/20 backdrop-blur-[1px] z-[1]"></div>
        <div className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto py-12 sm:py-20">
          <div className="inline-block mb-4 sm:mb-6 animate-fade-in">
            <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-coffee-900 text-white text-[10px] sm:text-xs uppercase tracking-widest font-medium rounded-full">
              Premium Artisan Coffee
            </span>
          </div>
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-extralight text-coffee-900 mb-6 sm:mb-8 tracking-tighter leading-none animate-fade-in" style={{ animationDelay: "100ms" }}>
            Ella Bean<br />
            <span className="font-light">Coffee</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-coffee-600 mb-8 sm:mb-12 font-light max-w-3xl mx-auto leading-relaxed px-2 animate-slide-up" style={{ animationDelay: "200ms" }}>
            Discover exceptional coffee, crafted with passion and served with purpose
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center animate-slide-up px-4 sm:px-0" style={{ animationDelay: "300ms" }}>
            <Link
              href="#products"
              className="group relative overflow-hidden bg-coffee-900 text-white px-8 sm:px-10 py-4 sm:py-5 text-xs sm:text-sm tracking-wider uppercase font-medium shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-coffee-800 hover:scale-105 text-center"
            >
              <span className="relative z-10">Explore Collection</span>
              <div className="absolute inset-0 bg-gradient-to-r from-coffee-700 to-coffee-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <Link
              href="#about"
              className="px-8 sm:px-10 py-4 sm:py-5 border-2 border-coffee-900 text-coffee-900 text-xs sm:text-sm tracking-wider uppercase font-medium hover:bg-coffee-900 hover:text-white transition-all duration-300 text-center"
            >
              Our Story
            </Link>
          </div>
        </div>
        <ScrollDownButton />
      </section>

      {/* Bulletin Board Section */}
      <ScrollReveal>
        <section className="py-12 sm:py-16 md:py-24 bg-coffee-700 border-b border-coffee-900/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-white mb-3 sm:mb-4 tracking-tight">
                Find Us
              </h2>
              <p className="text-base sm:text-lg text-white/90 font-light">
                Check out our latest locations and events
              </p>
            </div>
            <BulletinBoard />
          </div>
        </section>
      </ScrollReveal>

      {/* Product Showcase */}
      <ScrollReveal delay={100}>
        <section id="products" className="py-8 sm:py-10 md:py-12 bg-coffee-100 min-h-screen flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
            <div className="text-center mb-6 sm:mb-8 md:mb-10">
              <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-coffee-900 text-white text-[10px] sm:text-xs uppercase tracking-widest font-medium mb-3 sm:mb-4">
                Our Menu
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-coffee-900 mb-3 sm:mb-4 tracking-tight">
                Coffee Collection
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-coffee-600 font-light max-w-2xl mx-auto px-4">
                Each blend carefully selected and roasted to perfection
              </p>
            </div>
            <Suspense
              fallback={
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
      </ScrollReveal>

      {/* Testimonials Section - Only shows when 5+ approved testimonials exist */}
      <ScrollReveal delay={150}>
        <TestimonialsSection />
      </ScrollReveal>

      {/* About Section */}
      <ScrollReveal delay={200}>
        <section id="about" className="py-16 sm:py-20 md:py-28 lg:py-32 bg-coffee-900 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-2 gap-10 sm:gap-12 md:gap-16 items-center">
              <div>
                <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 text-white text-[10px] sm:text-xs uppercase tracking-widest font-medium mb-4 sm:mb-6">
                  Our Story
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light mb-6 sm:mb-8 tracking-tight">
                  Roasted in Our<br />Backyard
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-coffee-100 leading-relaxed font-light mb-4 sm:mb-6">
                  At Ella Bean Coffee, every bean is personally roasted in our backyard with care and dedication.
                  We believe in the art of small-batch roasting—every cup is a journey, every sip a story.
                </p>
                <p className="text-sm sm:text-base md:text-lg text-coffee-200 leading-relaxed font-light">
                  Join us at our mobile locations to experience coffee the way it was meant to be—
                  freshly roasted, beautifully crafted, and served with heart.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                <div className="bg-white/10 backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-lg">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-light mb-1 sm:mb-2">100%</div>
                  <div className="text-coffee-200 text-[10px] sm:text-xs md:text-sm uppercase tracking-wider">Organic Beans</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-lg">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-light mb-1 sm:mb-2">Fresh</div>
                  <div className="text-coffee-200 text-[10px] sm:text-xs md:text-sm uppercase tracking-wider">Backyard Roasted</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-lg">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-light mb-1 sm:mb-2">Local</div>
                  <div className="text-coffee-200 text-[10px] sm:text-xs md:text-sm uppercase tracking-wider">Sourced</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-lg">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-light mb-1 sm:mb-2">Made</div>
                  <div className="text-coffee-200 text-[10px] sm:text-xs md:text-sm uppercase tracking-wider">With Love</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </main>
  );
}
