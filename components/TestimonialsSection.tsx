import { Pool } from '@neondatabase/serverless';
import TestimonialsCarousel from "@/components/TestimonialsCarousel";

export default async function TestimonialsSection() {
  let testimonials: any[] = [];

  try {
    // Skip database query if DATABASE_URL is not available (e.g., in CI)
    if (process.env.DATABASE_URL) {
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      const result = await pool.query(
        'SELECT * FROM "Testimonial" WHERE approved = true ORDER BY featured DESC, "createdAt" DESC'
      );
      testimonials = result.rows;
      pool.end();
    }
  } catch (error) {
    console.warn('Failed to fetch testimonials:', error);
  }

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
