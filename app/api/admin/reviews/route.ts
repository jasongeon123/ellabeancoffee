import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Pool } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

// GET /api/admin/reviews - Get all reviews with filtering
export async function GET(request: NextRequest) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "admin") {
      pool.end();
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all"; // all, pending, flagged, approved, rejected

    let whereClause = '';
    const params: any[] = [];

    if (filter === "pending") {
      whereClause = 'WHERE r.status = $1';
      params.push('pending');
    } else if (filter === "flagged") {
      whereClause = 'WHERE r.flagged = $1';
      params.push(true);
    } else if (filter === "approved") {
      whereClause = 'WHERE r.status = $1 AND r.flagged = $2';
      params.push('approved', false);
    } else if (filter === "rejected") {
      whereClause = 'WHERE r.status = $1';
      params.push('rejected');
    }

    const result = await pool.query(
      `SELECT
        r.*,
        json_build_object('id', u.id, 'name', u.name, 'email', u.email) as user,
        json_build_object('id', p.id, 'name', p.name, 'image', p.image) as product
       FROM "Review" r
       LEFT JOIN "User" u ON r."userId" = u.id
       LEFT JOIN "Product" p ON r."productId" = p.id
       ${whereClause}
       ORDER BY r."createdAt" DESC`,
      params
    );

    pool.end();
    return NextResponse.json({ reviews: result.rows });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    pool.end();
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
