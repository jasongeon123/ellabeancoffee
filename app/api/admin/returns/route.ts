import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Pool } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

// Get all return requests for admin
export async function GET(request: NextRequest) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "admin") {
      pool.end();
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await pool.query(
      `SELECT
        r.*,
        json_build_object('name', u.name, 'email', u.email) as user
       FROM "Return" r
       LEFT JOIN "User" u ON r."userId" = u.id
       ORDER BY r."createdAt" DESC`
    );

    pool.end();
    return NextResponse.json({ returns: result.rows });
  } catch (error: any) {
    console.error("Failed to fetch return requests:", error);
    pool.end();
    return NextResponse.json(
      { error: "Failed to fetch return requests" },
      { status: 500 }
    );
  }
}
