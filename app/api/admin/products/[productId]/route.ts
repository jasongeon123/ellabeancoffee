import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Pool } from '@neondatabase/serverless';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
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
      roastLevel,
      origin,
      tastingNotes,
      brewingMethods,
    } = await request.json();
    const productId = params.productId;

    await pool.query(
      `UPDATE "Product" SET
        name = $1,
        description = $2,
        price = $3,
        category = $4,
        image = $5,
        "inStock" = $6,
        "roastLevel" = $7,
        origin = $8,
        "tastingNotes" = $9,
        "brewingMethods" = $10,
        "updatedAt" = NOW()
      WHERE id = $11`,
      [
        name,
        description,
        price,
        category,
        image,
        inStock,
        roastLevel,
        origin,
        tastingNotes || [],
        brewingMethods || [],
        productId
      ]
    );

    const result = await pool.query(
      `SELECT * FROM "Product" WHERE id = $1`,
      [productId]
    );

    const product = result.rows[0];
    await pool.end();
    return NextResponse.json(product);
  } catch (error) {
    await pool.end();
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "admin") {
      await pool.end();
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const productId = params.productId;

    await pool.query(
      `DELETE FROM "Product" WHERE id = $1`,
      [productId]
    );

    await pool.end();
    return NextResponse.json({ success: true });
  } catch (error) {
    await pool.end();
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
