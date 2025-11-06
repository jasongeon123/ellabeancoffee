import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const productId = searchParams.get("productId");

    // Get timestamp for 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // Get total orders in last 24 hours
    const totalOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: twentyFourHoursAgo,
        },
      },
    });

    let productOrders = 0;

    // If productId is provided, get orders for that specific product
    if (productId) {
      const orders = await prisma.orderItem.findMany({
        where: {
          productId,
          order: {
            createdAt: {
              gte: twentyFourHoursAgo,
            },
          },
        },
        select: {
          orderId: true,
        },
      });

      // Count unique orders (not quantity)
      const uniqueOrderIds = new Set(orders.map((item) => item.orderId));
      productOrders = uniqueOrderIds.size;
    }

    return NextResponse.json({
      totalOrders,
      productOrders: productId ? productOrders : undefined,
    });
  } catch (error) {
    console.error("Error fetching order stats:", error);
    return NextResponse.json(
      { totalOrders: 0, productOrders: 0 },
      { status: 500 }
    );
  }
}
