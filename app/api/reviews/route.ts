import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Pool } from '@neondatabase/serverless';
import { hasUserPurchasedProduct } from "@/lib/orderUtils";

// Create a review
export async function POST(req: Request) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      await pool.end();
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { productId, rating, comment } = await req.json();

    // Validate input
    if (!productId || !rating) {
      await pool.end();
      return NextResponse.json(
        { error: "Product ID and rating are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      await pool.end();
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check if user has purchased this product
    const hasPurchased = await hasUserPurchasedProduct(userId, productId);

    if (!hasPurchased) {
      await pool.end();
      return NextResponse.json(
        { error: "You must purchase this product before reviewing it" },
        { status: 403 }
      );
    }

    // Check if user has already reviewed this product
    const existingResult = await pool.query(
      `SELECT * FROM "Review" WHERE "productId" = $1 AND "userId" = $2`,
      [productId, userId]
    );

    if (existingResult.rows.length > 0) {
      // Update existing review (only if they've purchased)
      await pool.query(
        `UPDATE "Review" SET rating = $1, comment = $2, "updatedAt" = NOW() WHERE id = $3`,
        [rating, comment, existingResult.rows[0].id]
      );

      const result = await pool.query(
        `SELECT
          r.*,
          json_build_object(
            'name', u.name,
            'email', u.email
          ) as user
        FROM "Review" r
        LEFT JOIN "User" u ON r."userId" = u.id
        WHERE r.id = $1`,
        [existingResult.rows[0].id]
      );

      const updatedReview = result.rows[0];
      await pool.end();
      return NextResponse.json(updatedReview);
    }

    // Create new review with verified purchase badge
    const insertResult = await pool.query(
      `INSERT INTO "Review" (
        id, "productId", "userId", rating, comment, "verifiedPurchase",
        status, "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid()::text, $1, $2, $3, $4, $5, 'approved', NOW(), NOW()
      ) RETURNING id`,
      [productId, userId, rating, comment, true]
    );

    const reviewId = insertResult.rows[0].id;

    // Fetch the complete review with user
    const result = await pool.query(
      `SELECT
        r.*,
        json_build_object(
          'name', u.name,
          'email', u.email
        ) as user
      FROM "Review" r
      LEFT JOIN "User" u ON r."userId" = u.id
      WHERE r.id = $1`,
      [reviewId]
    );

    const review = result.rows[0];
    await pool.end();
    return NextResponse.json(review, { status: 201 });
  } catch (error: any) {
    console.error("Review creation error:", error);
    await pool.end();
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
