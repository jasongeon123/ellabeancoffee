import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Pool } from '@neondatabase/serverless';

// Get user's return requests
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
      `SELECT * FROM "Return" WHERE "userId" = $1 ORDER BY "createdAt" DESC`,
      [userId]
    );

    const returns = result.rows;
    await pool.end();
    return NextResponse.json({ returns });
  } catch (error: any) {
    console.error("Failed to fetch returns:", error);
    await pool.end();
    return NextResponse.json(
      { error: "Failed to fetch returns" },
      { status: 500 }
    );
  }
}

// Create a new return request
export async function POST(request: NextRequest) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      await pool.end();
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { orderNumber, reason, items } = await request.json();

    // Validate inputs
    if (!orderNumber || !reason || !items || items.length === 0) {
      await pool.end();
      return NextResponse.json(
        { error: "Order number, reason, and items are required" },
        { status: 400 }
      );
    }

    // Verify the order belongs to the user
    const orderResult = await pool.query(
      `SELECT
        o.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', oi.id,
              'quantity', oi.quantity,
              'price', oi.price,
              'product', json_build_object(
                'id', p.id,
                'name', p.name
              )
            )
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) as items
      FROM "Order" o
      LEFT JOIN "OrderItem" oi ON o.id = oi."orderId"
      LEFT JOIN "Product" p ON oi."productId" = p.id
      WHERE o."orderNumber" = $1 AND o."userId" = $2
      GROUP BY o.id`,
      [orderNumber, userId]
    );

    if (orderResult.rows.length === 0) {
      await pool.end();
      return NextResponse.json(
        { error: "Order not found or does not belong to you" },
        { status: 404 }
      );
    }

    const order = orderResult.rows[0];

    // Verify order is not already in a return process
    const existingReturnResult = await pool.query(
      `SELECT * FROM "Return" WHERE "orderNumber" = $1 AND status IN ('pending', 'approved')`,
      [orderNumber]
    );

    if (existingReturnResult.rows.length > 0) {
      await pool.end();
      return NextResponse.json(
        { error: "A return request already exists for this order" },
        { status: 400 }
      );
    }

    // Calculate refund amount for selected items
    const selectedItems = order.items.filter((item: any) =>
      items.includes(item.id)
    );
    const refundAmount = selectedItems.reduce(
      (sum: number, item: any) => sum + parseFloat(item.price) * item.quantity,
      0
    );

    // Create the return request
    const result = await pool.query(
      `INSERT INTO "Return" (
        id, "userId", "orderNumber", reason, items, "refundAmount", status, "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid()::text, $1, $2, $3, $4, $5, 'pending', NOW(), NOW()
      ) RETURNING *`,
      [userId, orderNumber, reason, items, refundAmount]
    );

    const returnRequest = result.rows[0];
    await pool.end();
    return NextResponse.json({ return: returnRequest });
  } catch (error: any) {
    console.error("Failed to create return request:", error);
    await pool.end();
    return NextResponse.json(
      { error: "Failed to create return request" },
      { status: 500 }
    );
  }
}
