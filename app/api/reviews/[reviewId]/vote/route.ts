import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Pool } from '@neondatabase/serverless';

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

    const userId = (session.user as any).id;
    const body = await request.json();
    const { helpful } = body;

    if (typeof helpful !== "boolean") {
      await pool.end();
      return NextResponse.json(
        { error: "Invalid vote type" },
        { status: 400 }
      );
    }

    // Check if user already voted
    const existingVoteResult = await pool.query(
      `SELECT * FROM "ReviewVote" WHERE "reviewId" = $1 AND "userId" = $2`,
      [params.reviewId, userId]
    );

    if (existingVoteResult.rows.length > 0) {
      const existingVote = existingVoteResult.rows[0];

      // User already voted, update their vote if different
      if (existingVote.helpful === helpful) {
        // Same vote - remove it (toggle off)
        await pool.query(
          `DELETE FROM "ReviewVote" WHERE id = $1`,
          [existingVote.id]
        );

        await pool.query(
          `UPDATE "Review" SET
            ${helpful ? '"helpfulVotes"' : '"notHelpfulVotes"'} = ${helpful ? '"helpfulVotes"' : '"notHelpfulVotes"'} - 1,
            "updatedAt" = NOW()
          WHERE id = $1`,
          [params.reviewId]
        );

        await pool.end();
        return NextResponse.json({ success: true, action: "removed" });
      } else {
        // Different vote - update it
        await pool.query(
          `UPDATE "ReviewVote" SET helpful = $1 WHERE id = $2`,
          [helpful, existingVote.id]
        );

        await pool.query(
          `UPDATE "Review" SET
            "helpfulVotes" = "helpfulVotes" ${helpful ? '+ 1' : '- 1'},
            "notHelpfulVotes" = "notHelpfulVotes" ${helpful ? '- 1' : '+ 1'},
            "updatedAt" = NOW()
          WHERE id = $1`,
          [params.reviewId]
        );

        await pool.end();
        return NextResponse.json({ success: true, action: "updated" });
      }
    }

    // No existing vote - create new one
    await pool.query(
      `INSERT INTO "ReviewVote" (id, "reviewId", "userId", helpful, "createdAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, NOW())`,
      [params.reviewId, userId, helpful]
    );

    await pool.query(
      `UPDATE "Review" SET
        ${helpful ? '"helpfulVotes"' : '"notHelpfulVotes"'} = ${helpful ? '"helpfulVotes"' : '"notHelpfulVotes"'} + 1,
        "updatedAt" = NOW()
      WHERE id = $1`,
      [params.reviewId]
    );

    await pool.end();
    return NextResponse.json({ success: true, action: "created" });
  } catch (error) {
    console.error("Failed to vote on review:", error);
    await pool.end();
    return NextResponse.json(
      { error: "Failed to vote on review" },
      { status: 500 }
    );
  }
}
