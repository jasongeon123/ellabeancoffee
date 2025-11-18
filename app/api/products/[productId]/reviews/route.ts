import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Pool } from '@neondatabase/serverless';

export async function GET(
  req: Request,
  { params }: { params: { productId: string } }
) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    // Build the query for user votes if user is logged in
    let query = `
      SELECT
        r.*,
        json_build_object(
          'name', u.name,
          'email', u.email
        ) as user
      FROM "Review" r
      LEFT JOIN "User" u ON r."userId" = u.id
      WHERE r."productId" = $1 AND r.status = 'approved'
      ORDER BY r."createdAt" DESC
    `;

    const result = await pool.query(query, [params.productId]);
    let reviews = result.rows;

    // If user is logged in, fetch their votes
    if (userId) {
      const voteResult = await pool.query(
        `SELECT "reviewId", helpful FROM "ReviewVote" WHERE "userId" = $1`,
        [userId]
      );

      const votesMap = new Map(
        voteResult.rows.map((v: any) => [v.reviewId, { helpful: v.helpful }])
      );

      // Add userVote to each review
      reviews = reviews.map((review: any) => ({
        ...review,
        userVote: votesMap.get(review.id) || null,
      }));
    } else {
      reviews = reviews.map((review: any) => ({
        ...review,
        userVote: null,
      }));
    }

    // Calculate average rating
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length
        : 0;

    await pool.end();
    return NextResponse.json({
      reviews,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalReviews: reviews.length,
    });
  } catch (error: any) {
    console.error("Fetch reviews error:", error);
    await pool.end();
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
