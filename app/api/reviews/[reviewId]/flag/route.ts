import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Pool } from '@neondatabase/serverless';

// POST /api/reviews/[reviewId]/flag - Flag a review as inappropriate
export async function POST(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      await pool.end();
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reviewId } = params;
    const body = await request.json();
    const { reason } = body;

    if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
      await pool.end();
      return NextResponse.json(
        { error: "Flag reason is required" },
        { status: 400 }
      );
    }

    // Check if review exists
    const existingResult = await pool.query(
      `SELECT * FROM "Review" WHERE id = $1`,
      [reviewId]
    );

    if (existingResult.rows.length === 0) {
      await pool.end();
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const existingReview = existingResult.rows[0];

    // Prevent users from flagging their own reviews
    if (existingReview.userId === (session.user as any).id) {
      await pool.end();
      return NextResponse.json(
        { error: "You cannot flag your own review" },
        { status: 400 }
      );
    }

    // Update review to mark it as flagged
    await pool.query(
      `UPDATE "Review" SET flagged = true, "flagReason" = $1, "updatedAt" = NOW() WHERE id = $2`,
      [reason.trim(), reviewId]
    );

    const result = await pool.query(
      `SELECT * FROM "Review" WHERE id = $1`,
      [reviewId]
    );

    const review = result.rows[0];
    await pool.end();
    return NextResponse.json({
      message: "Review flagged successfully",
      review,
    });
  } catch (error) {
    console.error("Error flagging review:", error);
    await pool.end();
    return NextResponse.json(
      { error: "Failed to flag review" },
      { status: 500 }
    );
  }
}
