import { cache } from "react";
import { Pool } from '@neondatabase/serverless';

// Cache product list with reviews for the duration of the request
export const getProductsWithReviews = cache(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const result = await pool.query(`
      SELECT
        p.*,
        COALESCE(
          json_agg(
            json_build_object('rating', r.rating)
          ) FILTER (WHERE r.id IS NOT NULL),
          '[]'
        ) as reviews
      FROM "Product" p
      LEFT JOIN "Review" r ON p.id = r."productId"
      WHERE p."inStock" = true
      GROUP BY p.id
      ORDER BY p."createdAt" DESC
    `);

    // Calculate average ratings
    return result.rows.map((product) => {
      const reviews = product.reviews || [];
      const reviewCount = reviews.length;
      const averageRating =
        reviewCount > 0
          ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviewCount
          : 0;

      return {
        ...product,
        reviews,
        averageRating,
        reviewCount,
      };
    });
  } finally {
    await pool.end();
  }
});

// Cache individual product lookup
export const getProductById = cache(async (id: string) => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const result = await pool.query('SELECT * FROM "Product" WHERE id = $1 LIMIT 1', [id]);
    return result.rows[0] || null;
  } finally {
    await pool.end();
  }
});

// Cache product reviews
export const getProductReviews = cache(async (productId: string) => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const result = await pool.query('SELECT * FROM "Review" WHERE "productId" = $1', [productId]);
    const reviews = result.rows;

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;

    return {
      reviews,
      averageRating,
      count: reviews.length,
    };
  } finally {
    await pool.end();
  }
});

// Cache all products (for admin)
export const getAllProducts = cache(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const result = await pool.query('SELECT * FROM "Product" ORDER BY "createdAt" DESC');
    return result.rows;
  } finally {
    await pool.end();
  }
});

// Cache related products (same category, different product)
export const getRelatedProducts = cache(async (productId: string, category: string, limit: number = 4) => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const result = await pool.query(
      `SELECT * FROM "Product"
       WHERE category = $1 AND id != $2 AND "inStock" = true
       ORDER BY "createdAt" DESC
       LIMIT $3`,
      [category, productId, limit]
    );
    return result.rows;
  } finally {
    await pool.end();
  }
});
