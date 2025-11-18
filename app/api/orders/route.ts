import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Pool } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      pool.end();
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const searchParams = request.nextUrl.searchParams;
    const orderNumber = searchParams.get("orderNumber");

    if (orderNumber) {
      // Fetch specific order by order number with items and products
      const orderResult = await pool.query(
        `SELECT o.*,
          json_agg(
            json_build_object(
              'id', oi.id,
              'quantity', oi.quantity,
              'price', oi.price,
              'product', json_build_object(
                'id', p.id,
                'name', p.name,
                'image', p.image,
                'price', p.price,
                'description', p.description
              )
            )
          ) as items
         FROM "Order" o
         LEFT JOIN "OrderItem" oi ON o.id = oi."orderId"
         LEFT JOIN "Product" p ON oi."productId" = p.id
         WHERE o."orderNumber" = $1 AND o."userId" = $2
         GROUP BY o.id`,
        [orderNumber, userId]
      );

      if (orderResult.rows.length === 0) {
        pool.end();
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }

      pool.end();
      return NextResponse.json({ order: orderResult.rows[0] });
    }

    // Fetch all orders for user with items and products
    const ordersResult = await pool.query(
      `SELECT o.*,
        json_agg(
          json_build_object(
            'id', oi.id,
            'quantity', oi.quantity,
            'price', oi.price,
            'product', json_build_object(
              'id', p.id,
              'name', p.name,
              'image', p.image,
              'price', p.price,
              'description', p.description
            )
          )
        ) as items
       FROM "Order" o
       LEFT JOIN "OrderItem" oi ON o.id = oi."orderId"
       LEFT JOIN "Product" p ON oi."productId" = p.id
       WHERE o."userId" = $1
       GROUP BY o.id
       ORDER BY o."createdAt" DESC`,
      [userId]
    );

    pool.end();
    return NextResponse.json({ orders: ordersResult.rows });
  } catch (error: any) {
    console.error("Failed to fetch orders:", error);
    pool.end();
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
