import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Pool } from "@neondatabase/serverless";

export async function DELETE(request: NextRequest) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    // Get the authenticated user's session
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;

    // Verify user exists
    const userResult = await pool.query(
      `SELECT id FROM "User" WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Delete user (cascade will handle related records: Cart, Orders, Reviews, Subscriptions)
    await pool.query(
      `DELETE FROM "User" WHERE id = $1`,
      [userId]
    );

    return NextResponse.json({
      message: "Account deleted successfully"
    });
  } catch (error) {
    console.error("Account deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}
