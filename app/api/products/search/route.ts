import { NextRequest, NextResponse } from "next/server";
import { Pool } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      pool.end();
      return NextResponse.json({ products: [] });
    }

    // Search products by name, description, category, origin, or roast level
    // Using ILIKE for case-insensitive search in PostgreSQL
    const result = await pool.query(
      `SELECT id, name, category, price, image, description
       FROM "Product"
       WHERE "inStock" = true
       AND (
         name ILIKE $1
         OR description ILIKE $1
         OR category ILIKE $1
         OR origin ILIKE $1
         OR "roastLevel" ILIKE $1
       )
       ORDER BY "createdAt" DESC
       LIMIT 10`,
      [`%${query}%`]
    );

    pool.end();
    return NextResponse.json({ products: result.rows });
  } catch (error) {
    console.error("Search error:", error);
    pool.end();
    return NextResponse.json({ products: [] }, { status: 500 });
  }
}
