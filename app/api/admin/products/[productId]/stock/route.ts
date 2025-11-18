import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Pool } from "@neondatabase/serverless";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { inStock } = await request.json();

    const result = await pool.query(
      `UPDATE "Product" SET "inStock" = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING *`,
      [inStock, params.productId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Failed to update stock:", error);
    return NextResponse.json(
      { error: "Failed to update stock" },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}
