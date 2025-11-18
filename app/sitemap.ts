import { MetadataRoute } from 'next';
import { Pool } from '@neondatabase/serverless';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ellabeancoffee.com';

  let products: { id: string; slug: string | null; updatedAt: Date }[] = [];
  let locations: { id: string; updatedAt: Date }[] = [];

  try {
    // Skip database queries if DATABASE_URL is not available (e.g., in CI)
    if (process.env.DATABASE_URL) {
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });

      // Fetch all products
      const productsResult = await pool.query(
        'SELECT id, slug, "updatedAt" FROM "Product"'
      );
      products = productsResult.rows;

      // Fetch all locations
      const locationsResult = await pool.query(
        'SELECT id, "updatedAt" FROM "Location"'
      );
      locations = locationsResult.rows;

      await pool.end();
    }
  } catch (error) {
    console.warn('Failed to fetch data for sitemap:', error);
  }

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/cart`,
      lastModified: new Date(),
      changeFrequency: 'always' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/checkout`,
      lastModified: new Date(),
      changeFrequency: 'always' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/locations`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/subscriptions`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/auth/signin`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/auth/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/track-order`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ];

  // Dynamic product pages (using slug for SEO-friendly URLs)
  const productPages = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug || product.id}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // Dynamic location pages (if you add individual location pages in the future)
  // const locationPages = locations.map((location) => ({
  //   url: `${baseUrl}/locations/${location.id}`,
  //   lastModified: location.updatedAt,
  //   changeFrequency: 'monthly' as const,
  //   priority: 0.6,
  // }));

  return [...staticPages, ...productPages];
}
