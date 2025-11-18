import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Pool } from "@neondatabase/serverless";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { couponId: string } }
) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { active } = await request.json();

    const result = await pool.query(
      `UPDATE "Coupon" SET active = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING *`,
      [active, params.couponId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Failed to toggle coupon:", error);
    return NextResponse.json(
      { error: "Failed to toggle coupon" },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}
