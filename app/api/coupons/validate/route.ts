import { NextRequest, NextResponse } from "next/server";
import { Pool } from "@neondatabase/serverless";

export async function POST(req: NextRequest) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const { code, cartTotal } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    // Find the coupon
    const result = await pool.query(
      `SELECT * FROM "Coupon" WHERE code = $1`,
      [code.toUpperCase()]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });
    }

    const coupon = result.rows[0];

    // Check if coupon is active
    if (!coupon.active) {
      return NextResponse.json({ error: "This coupon is no longer active" }, { status: 400 });
    }

    // Check expiration
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
    }

    // Check max uses
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: "This coupon has reached its maximum usage limit" }, { status: 400 });
    }

    // Check minimum purchase
    if (coupon.minPurchase && cartTotal < coupon.minPurchase) {
      return NextResponse.json(
        { error: `Minimum purchase of $${parseFloat(coupon.minPurchase).toFixed(2)} required` },
        { status: 400 }
      );
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountPercent) {
      discountAmount = (cartTotal * coupon.discountPercent) / 100;
    } else if (coupon.discountAmount) {
      discountAmount = parseFloat(coupon.discountAmount);
    }

    // Don't let discount exceed cart total
    discountAmount = Math.min(discountAmount, cartTotal);

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discountAmount,
      discountPercent: coupon.discountPercent,
      discountType: coupon.discountPercent ? "percentage" : "fixed",
      description: coupon.description,
    });
  } catch (error) {
    console.error("Error validating coupon:", error);
    return NextResponse.json(
      { error: "Failed to validate coupon" },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}
