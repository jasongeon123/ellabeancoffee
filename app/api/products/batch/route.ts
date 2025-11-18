import { NextRequest, NextResponse } from "next/server";
import { Pool } from "@neondatabase/serverless";

export async function POST(request: NextRequest) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const { productIds } = await request.json();

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: "Invalid product IDs" }, { status: 400 });
    }

    const placeholders = productIds.map((_, i) => `$${i + 1}`).join(", ");

    const result = await pool.query(
      `SELECT id, name, price, image, description, "inStock"
       FROM "Product"
       WHERE id IN (${placeholders})`,
      productIds
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}
