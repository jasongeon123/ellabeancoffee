import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Pool } from "@neondatabase/serverless";

// PATCH - Update coupon
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

    const body = await request.json();
    const {
      code,
      description,
      discountPercent,
      discountAmount,
      minPurchase,
      maxUses,
      expiresAt,
      active,
    } = body;

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (code !== undefined) {
      updates.push(`code = $${paramIndex++}`);
      values.push(code.toUpperCase());
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(description);
    }
    if (discountPercent !== undefined) {
      updates.push(`"discountPercent" = $${paramIndex++}`);
      values.push(discountPercent);
    }
    if (discountAmount !== undefined) {
      updates.push(`"discountAmount" = $${paramIndex++}`);
      values.push(discountAmount);
    }
    if (minPurchase !== undefined) {
      updates.push(`"minPurchase" = $${paramIndex++}`);
      values.push(minPurchase);
    }
    if (maxUses !== undefined) {
      updates.push(`"maxUses" = $${paramIndex++}`);
      values.push(maxUses);
    }
    if (active !== undefined) {
      updates.push(`active = $${paramIndex++}`);
      values.push(active);
    }
    if (expiresAt !== undefined) {
      updates.push(`"expiresAt" = $${paramIndex++}`);
      values.push(expiresAt ? new Date(expiresAt) : null);
    }

    values.push(params.couponId);

    const result = await pool.query(
      `UPDATE "Coupon" SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Coupon code already exists" },
        { status: 400 }
      );
    }
    console.error("Failed to update coupon:", error);
    return NextResponse.json(
      { error: "Failed to update coupon" },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}

// DELETE - Delete coupon
export async function DELETE(
  request: NextRequest,
  { params }: { params: { couponId: string } }
) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await pool.query(
      `DELETE FROM "Coupon" WHERE id = $1`,
      [params.couponId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete coupon:", error);
    return NextResponse.json(
      { error: "Failed to delete coupon" },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}
