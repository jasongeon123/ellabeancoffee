import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Pool } from '@neondatabase/serverless';

// PATCH /api/admin/reviews/[reviewId] - Update review status or add business response
export async function PATCH(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "admin") {
      await pool.end();
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reviewId } = params;
    const body = await request.json();
    const { status, businessResponse, unflag } = body;

    // Check if review exists
    const existingResult = await pool.query(
      `SELECT * FROM "Review" WHERE id = $1`,
      [reviewId]
    );

    if (existingResult.rows.length === 0) {
      await pool.end();
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Build update data
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (status && ["pending", "approved", "rejected"].includes(status)) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }

    if (businessResponse !== undefined) {
      updates.push(`"businessResponse" = $${paramCount++}`);
      values.push(businessResponse);
      updates.push(`"respondedAt" = $${paramCount++}`);
      values.push(businessResponse ? new Date() : null);
    }

    if (unflag === true) {
      updates.push(`flagged = false`);
      updates.push(`"flagReason" = NULL`);
    }

    updates.push(`"updatedAt" = NOW()`);

    // Update the review
    values.push(reviewId);
    await pool.query(
      `UPDATE "Review" SET ${updates.join(', ')} WHERE id = $${paramCount}`,
      values
    );

    // Fetch updated review with relations
    const result = await pool.query(
      `SELECT
        r.*,
        json_build_object(
          'id', u.id,
          'name', u.name,
          'email', u.email
        ) as user,
        json_build_object(
          'id', p.id,
          'name', p.name,
          'image', p.image
        ) as product
      FROM "Review" r
      LEFT JOIN "User" u ON r."userId" = u.id
      LEFT JOIN "Product" p ON r."productId" = p.id
      WHERE r.id = $1`,
      [reviewId]
    );

    const review = result.rows[0];
    await pool.end();
    return NextResponse.json({ review });
  } catch (error) {
    console.error("Error updating review:", error);
    await pool.end();
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/reviews/[reviewId] - Delete a review
export async function DELETE(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "admin") {
      await pool.end();
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reviewId } = params;

    await pool.query(
      `DELETE FROM "Review" WHERE id = $1`,
      [reviewId]
    );

    await pool.end();
    return NextResponse.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    await pool.end();
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    );
  }
}
