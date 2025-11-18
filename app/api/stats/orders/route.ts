import { NextRequest, NextResponse } from "next/server";
import { Pool } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const searchParams = req.nextUrl.searchParams;
    const productId = searchParams.get("productId");

    // Get timestamp for 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // Get total orders in last 24 hours
    const totalOrdersResult = await pool.query(
      'SELECT COUNT(*) as count FROM "Order" WHERE "createdAt" >= $1',
      [twentyFourHoursAgo]
    );
    const totalOrders = parseInt(totalOrdersResult.rows[0].count);

    let productOrders = 0;

    // If productId is provided, get orders for that specific product
    if (productId) {
      const productOrdersResult = await pool.query(
        `SELECT COUNT(DISTINCT oi."orderId") as count
         FROM "OrderItem" oi
         JOIN "Order" o ON oi."orderId" = o.id
         WHERE oi."productId" = $1 AND o."createdAt" >= $2`,
        [productId, twentyFourHoursAgo]
      );
      productOrders = parseInt(productOrdersResult.rows[0].count);
    }

    pool.end();

    return NextResponse.json({
      totalOrders,
      productOrders: productId ? productOrders : undefined,
    });
  } catch (error) {
    console.error("Error fetching order stats:", error);
    pool.end();
    return NextResponse.json(
      { totalOrders: 0, productOrders: 0 },
      { status: 500 }
    );
  }
}
