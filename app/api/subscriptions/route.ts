import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Pool } from '@neondatabase/serverless';

// GET - Fetch user's subscriptions
export async function GET(request: NextRequest) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      await pool.end();
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const result = await pool.query(
      `SELECT
        s.*,
        json_build_object(
          'id', p.id,
          'name', p.name,
          'description', p.description,
          'price', p.price,
          'category', p.category,
          'image', p.image,
          'inStock', p."inStock",
          'stock', p.stock,
          'roastLevel', p."roastLevel",
          'origin', p.origin,
          'tastingNotes', p."tastingNotes",
          'brewingMethods', p."brewingMethods",
          'createdAt', p."createdAt",
          'updatedAt', p."updatedAt"
        ) as product
      FROM "Subscription" s
      LEFT JOIN "Product" p ON s."productId" = p.id
      WHERE s."userId" = $1
      ORDER BY s."createdAt" DESC`,
      [userId]
    );

    const subscriptions = result.rows;
    await pool.end();
    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error("Failed to fetch subscriptions:", error);
    await pool.end();
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}

// POST - Create a new subscription
export async function POST(request: NextRequest) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      await pool.end();
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { productId, quantity, frequency } = body;

    // Validate input
    if (!productId || !quantity || !frequency) {
      await pool.end();
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["weekly", "bi-weekly", "monthly"].includes(frequency)) {
      await pool.end();
      return NextResponse.json(
        { error: "Invalid frequency" },
        { status: 400 }
      );
    }

    // Verify product exists and is in stock
    const productResult = await pool.query(
      `SELECT * FROM "Product" WHERE id = $1`,
      [productId]
    );

    if (productResult.rows.length === 0) {
      await pool.end();
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const product = productResult.rows[0];

    if (!product.inStock) {
      await pool.end();
      return NextResponse.json(
        { error: "Product is out of stock" },
        { status: 400 }
      );
    }

    // Check if user already has an active subscription for this product
    const existingSubResult = await pool.query(
      `SELECT * FROM "Subscription"
       WHERE "userId" = $1 AND "productId" = $2 AND status IN ('active', 'paused')`,
      [userId, productId]
    );

    if (existingSubResult.rows.length > 0) {
      await pool.end();
      return NextResponse.json(
        { error: "You already have an active subscription for this product" },
        { status: 400 }
      );
    }

    // Calculate next delivery date based on frequency
    const nextDelivery = new Date();
    if (frequency === "weekly") {
      nextDelivery.setDate(nextDelivery.getDate() + 7);
    } else if (frequency === "bi-weekly") {
      nextDelivery.setDate(nextDelivery.getDate() + 14);
    } else if (frequency === "monthly") {
      nextDelivery.setMonth(nextDelivery.getMonth() + 1);
    }

    // Determine discount based on frequency
    let discount = 0;
    if (frequency === "weekly") {
      discount = 15; // 15% discount for weekly
    } else if (frequency === "bi-weekly") {
      discount = 12; // 12% discount for bi-weekly
    } else if (frequency === "monthly") {
      discount = 10; // 10% discount for monthly
    }

    // Create subscription
    const result = await pool.query(
      `INSERT INTO "Subscription" (
        id, "userId", "productId", quantity, frequency, discount,
        "nextDeliveryDate", status, "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, NOW(), NOW()
      ) RETURNING *`,
      [userId, productId, quantity, frequency, discount, nextDelivery, "active"]
    );

    const subscriptionId = result.rows[0].id;

    // Fetch the complete subscription with product
    const subscriptionResult = await pool.query(
      `SELECT
        s.*,
        json_build_object(
          'id', p.id,
          'name', p.name,
          'description', p.description,
          'price', p.price,
          'category', p.category,
          'image', p.image,
          'inStock', p."inStock",
          'stock', p.stock,
          'roastLevel', p."roastLevel",
          'origin', p.origin,
          'tastingNotes', p."tastingNotes",
          'brewingMethods', p."brewingMethods",
          'createdAt', p."createdAt",
          'updatedAt', p."updatedAt"
        ) as product
      FROM "Subscription" s
      LEFT JOIN "Product" p ON s."productId" = p.id
      WHERE s.id = $1`,
      [subscriptionId]
    );

    const subscription = subscriptionResult.rows[0];
    await pool.end();
    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Failed to create subscription:", error);
    await pool.end();
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}
