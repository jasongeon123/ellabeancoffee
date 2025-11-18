import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Pool } from '@neondatabase/serverless';

// Get a specific return request
export async function GET(
  request: NextRequest,
  { params }: { params: { returnId: string } }
) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "admin") {
      await pool.end();
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const returnResult = await pool.query(
      `SELECT
        r.*,
        json_build_object(
          'name', u.name,
          'email', u.email
        ) as user
      FROM "Return" r
      LEFT JOIN "User" u ON r."userId" = u.id
      WHERE r.id = $1`,
      [params.returnId]
    );

    if (returnResult.rows.length === 0) {
      await pool.end();
      return NextResponse.json(
        { error: "Return request not found" },
        { status: 404 }
      );
    }

    const returnRequest = returnResult.rows[0];

    // Get the order details
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
                'name', p.name,
                'image', p.image
              )
            )
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) as items
      FROM "Order" o
      LEFT JOIN "OrderItem" oi ON o.id = oi."orderId"
      LEFT JOIN "Product" p ON oi."productId" = p.id
      WHERE o."orderNumber" = $1
      GROUP BY o.id`,
      [returnRequest.orderNumber]
    );

    const order = orderResult.rows.length > 0 ? orderResult.rows[0] : null;

    await pool.end();
    return NextResponse.json({ return: returnRequest, order });
  } catch (error: any) {
    console.error("Failed to fetch return request:", error);
    await pool.end();
    return NextResponse.json(
      { error: "Failed to fetch return request" },
      { status: 500 }
    );
  }
}

// Update return request status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { returnId: string } }
) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "admin") {
      await pool.end();
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status, adminNotes, refundAmount } = await request.json();

    if (!status) {
      await pool.end();
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    const updates: string[] = ['status = $1', '"updatedAt" = NOW()'];
    const values: any[] = [status];
    let paramCount = 2;

    if (adminNotes !== undefined) {
      updates.push(`"adminNotes" = $${paramCount++}`);
      values.push(adminNotes);
    }

    if (refundAmount !== undefined) {
      updates.push(`"refundAmount" = $${paramCount++}`);
      values.push(refundAmount);
    }

    values.push(params.returnId);
    await pool.query(
      `UPDATE "Return" SET ${updates.join(', ')} WHERE id = $${paramCount}`,
      values
    );

    const result = await pool.query(
      `SELECT * FROM "Return" WHERE id = $1`,
      [params.returnId]
    );

    const returnRequest = result.rows[0];
    await pool.end();
    return NextResponse.json({ return: returnRequest });
  } catch (error: any) {
    console.error("Failed to update return request:", error);
    await pool.end();
    return NextResponse.json(
      { error: "Failed to update return request" },
      { status: 500 }
    );
  }
}
