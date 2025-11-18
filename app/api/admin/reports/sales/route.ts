import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Pool } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "admin") {
      pool.end();
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "30"; // days
    const groupBy = searchParams.get("groupBy") || "day"; // day, week, month

    const daysAgo = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Get all orders within the period with items and products
    const ordersResult = await pool.query(`
      SELECT
        o.id,
        o."createdAt",
        o.total,
        o.status,
        o."userId",
        json_agg(
          json_build_object(
            'id', oi.id,
            'productId', oi."productId",
            'quantity', oi.quantity,
            'price', oi.price,
            'product', json_build_object(
              'id', p.id,
              'name', p.name,
              'price', p.price
            )
          )
        ) as items
      FROM "Order" o
      LEFT JOIN "OrderItem" oi ON o.id = oi."orderId"
      LEFT JOIN "Product" p ON oi."productId" = p.id
      WHERE o."createdAt" >= $1
      GROUP BY o.id, o."createdAt", o.total, o.status, o."userId"
      ORDER BY o."createdAt" ASC
    `, [startDate]);

    const orders = ordersResult.rows;

    // Group orders by date
    const salesByDate: {
      [key: string]: {
        date: string;
        revenue: number;
        orders: number;
        items: number;
        avgOrderValue: number;
      };
    } = {};

    orders.forEach((order) => {
      let dateKey: string;
      const createdAt = new Date(order.createdAt);

      if (groupBy === "day") {
        dateKey = createdAt.toISOString().split("T")[0];
      } else if (groupBy === "week") {
        const weekStart = new Date(createdAt);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        dateKey = weekStart.toISOString().split("T")[0];
      } else {
        // month
        const year = createdAt.getFullYear();
        const month = createdAt.getMonth() + 1;
        dateKey = `${year}-${month.toString().padStart(2, "0")}`;
      }

      if (!salesByDate[dateKey]) {
        salesByDate[dateKey] = {
          date: dateKey,
          revenue: 0,
          orders: 0,
          items: 0,
          avgOrderValue: 0,
        };
      }

      salesByDate[dateKey].revenue += parseFloat(order.total);
      salesByDate[dateKey].orders += 1;
      salesByDate[dateKey].items += order.items.reduce(
        (sum: number, item: any) => sum + item.quantity,
        0
      );
    });

    // Calculate average order values
    Object.keys(salesByDate).forEach((key) => {
      salesByDate[key].avgOrderValue =
        salesByDate[key].revenue / salesByDate[key].orders;
    });

    const salesData = Object.values(salesByDate).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Top selling products
    const productSales: {
      [key: string]: {
        productId: string;
        name: string;
        quantity: number;
        revenue: number;
      };
    } = {};

    orders.forEach((order) => {
      order.items.forEach((item: any) => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            productId: item.productId,
            name: item.product.name,
            quantity: 0,
            revenue: 0,
          };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += parseFloat(item.price) * item.quantity;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Summary stats
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);
    const totalOrders = orders.length;
    const totalItems = orders.reduce(
      (sum, order) =>
        sum + order.items.reduce((s: number, item: any) => s + item.quantity, 0),
      0
    );
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Status breakdown
    const statusBreakdown = {
      pending: orders.filter((o) => o.status === "pending").length,
      processing: orders.filter((o) => o.status === "processing").length,
      shipped: orders.filter((o) => o.status === "shipped").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
    };

    // Customer Lifetime Value (All Time)
    const allOrdersResult = await pool.query(`
      SELECT
        o.id,
        o."createdAt",
        o.total,
        o."userId",
        json_build_object(
          'id', u.id,
          'email', u.email,
          'name', u.name
        ) as user
      FROM "Order" o
      LEFT JOIN "User" u ON o."userId" = u.id
      ORDER BY o."createdAt" ASC
    `);

    const allOrders = allOrdersResult.rows;

    const customerCLV: {
      [key: string]: {
        userId: string;
        email: string;
        name: string | null;
        totalSpent: number;
        orderCount: number;
        avgOrderValue: number;
        firstOrder: Date;
        lastOrder: Date;
      };
    } = {};

    allOrders.forEach((order) => {
      if (order.userId) {
        if (!customerCLV[order.userId]) {
          customerCLV[order.userId] = {
            userId: order.userId,
            email: order.user?.email || "Unknown",
            name: order.user?.name || null,
            totalSpent: 0,
            orderCount: 0,
            avgOrderValue: 0,
            firstOrder: new Date(order.createdAt),
            lastOrder: new Date(order.createdAt),
          };
        }
        customerCLV[order.userId].totalSpent += parseFloat(order.total);
        customerCLV[order.userId].orderCount += 1;
        const orderDate = new Date(order.createdAt);
        if (orderDate < customerCLV[order.userId].firstOrder) {
          customerCLV[order.userId].firstOrder = orderDate;
        }
        if (orderDate > customerCLV[order.userId].lastOrder) {
          customerCLV[order.userId].lastOrder = orderDate;
        }
      }
    });

    // Calculate average order values and sort by total spent
    const topCustomers = Object.values(customerCLV)
      .map((customer) => ({
        ...customer,
        avgOrderValue: customer.totalSpent / customer.orderCount,
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    pool.end();

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalOrders,
        totalItems,
        avgOrderValue,
        period: `${period} days`,
      },
      salesByDate: salesData,
      topProducts,
      statusBreakdown,
      topCustomers,
    });
  } catch (error) {
    console.error("Error fetching sales reports:", error);
    pool.end();
    return NextResponse.json(
      { error: "Failed to fetch sales reports" },
      { status: 500 }
    );
  }
}
