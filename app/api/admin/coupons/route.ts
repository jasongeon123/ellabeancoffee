import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Pool } from "@neondatabase/serverless";

// GET - Fetch all coupons
export async function GET(request: NextRequest) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await pool.query(
      `SELECT
        c.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', cu.id,
              'usedAt', cu."usedAt",
              'orderNumber', cu."orderNumber",
              'userId', cu."userId"
            )
          ) FILTER (WHERE cu.id IS NOT NULL),
          '[]'
        ) as usages
      FROM "Coupon" c
      LEFT JOIN "CouponUsage" cu ON cu."couponId" = c.id
      GROUP BY c.id
      ORDER BY c."createdAt" DESC`
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch coupons:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupons" },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}

// POST - Create new coupon
export async function POST(request: NextRequest) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      code,
      description,
      discountPercent,
      discountAmount,
      minPurchase,
      maxUses,
      expiresAt,
      active,
    } = await request.json();

    if (!code || (!discountPercent && !discountAmount)) {
      return NextResponse.json(
        { error: "Code and discount are required" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO "Coupon" (
        code, description, "discountPercent", "discountAmount",
        "minPurchase", "maxUses", active, "expiresAt", "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *`,
      [
        code.toUpperCase(),
        description,
        discountPercent,
        discountAmount,
        minPurchase,
        maxUses,
        active !== undefined ? active : true,
        expiresAt ? new Date(expiresAt) : null,
      ]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Coupon code already exists" },
        { status: 400 }
      );
    }
    console.error("Failed to create coupon:", error);
    return NextResponse.json(
      { error: "Failed to create coupon" },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}
