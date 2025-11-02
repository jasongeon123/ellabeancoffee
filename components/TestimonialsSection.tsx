import { prisma } from "@/lib/prisma";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";

export default async function TestimonialsSection() {
  // Get approved testimonials (at least 5 required)
  const testimonials = await prisma.testimonial.findMany({
    where: { approved: true },
    orderBy: [
      { featured: "desc" }, // Featured testimonials first
      { createdAt: "desc" },
    ],
  });

  // Don't render if less than 5 approved testimonials
  if (testimonials.length < 5) {
    return null;
  }

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-white to-coffee-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-light text-coffee-900 mb-4 tracking-tight">
            What Our Customers Say
          </h2>
          <p className="text-lg sm:text-xl text-coffee-600 font-light max-w-2xl mx-auto">
            Join thousands of happy coffee lovers who trust Ella Bean
          </p>
        </div>

        {/* Auto-rotating Carousel */}
        <TestimonialsCarousel testimonials={testimonials} />
      </div>
    </section>
  );
}
