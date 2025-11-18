import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Pool } from "@neondatabase/serverless";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role } = await request.json();

    if (role !== "user" && role !== "admin") {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Prevent admin from demoting themselves
    if (params.userId === (session.user as any).id && role !== "admin") {
      return NextResponse.json(
        { error: "Cannot demote yourself" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `UPDATE "User" SET role = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING *`,
      [role, params.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Failed to update user role:", error);
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}
