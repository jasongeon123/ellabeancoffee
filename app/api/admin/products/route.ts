import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Pool } from '@neondatabase/serverless';

export async function POST(request: NextRequest) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "admin") {
      await pool.end();
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      name,
      description,
      price,
      category,
      image,
      inStock,
      stockQuantity,
      lowStockAlert,
      roastLevel,
      origin,
      tastingNotes,
      brewingMethods,
    } = await request.json();

    const result = await pool.query(
      `INSERT INTO "Product" (
        id, name, description, price, category, image, "inStock",
        stock, "stockQuantity", "lowStockAlert", "roastLevel", origin,
        "tastingNotes", "brewingMethods", "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW()
      ) RETURNING *`,
      [
        name,
        description,
        price,
        category,
        image,
        inStock,
        stockQuantity || 0,
        stockQuantity,
        lowStockAlert,
        roastLevel,
        origin,
        tastingNotes || [],
        brewingMethods || []
      ]
    );

    const product = result.rows[0];
    await pool.end();
    return NextResponse.json(product);
  } catch (error) {
    await pool.end();
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
