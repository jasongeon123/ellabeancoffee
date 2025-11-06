import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "30"; // days
    const groupBy = searchParams.get("groupBy") || "day"; // day, week, month

    const daysAgo = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Get all orders within the period
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

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

      if (groupBy === "day") {
        dateKey = order.createdAt.toISOString().split("T")[0];
      } else if (groupBy === "week") {
        const weekStart = new Date(order.createdAt);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        dateKey = weekStart.toISOString().split("T")[0];
      } else {
        // month
        const year = order.createdAt.getFullYear();
        const month = order.createdAt.getMonth() + 1;
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

      salesByDate[dateKey].revenue += order.total;
      salesByDate[dateKey].orders += 1;
      salesByDate[dateKey].items += order.items.reduce(
        (sum, item) => sum + item.quantity,
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
      order.items.forEach((item) => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            productId: item.productId,
            name: item.product.name,
            quantity: 0,
            revenue: 0,
          };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.price * item.quantity;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Summary stats
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const totalItems = orders.reduce(
      (sum, order) =>
        sum + order.items.reduce((s, item) => s + item.quantity, 0),
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
    const allOrders = await prisma.order.findMany({
      include: {
        user: true,
      },
    });

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
            firstOrder: order.createdAt,
            lastOrder: order.createdAt,
          };
        }
        customerCLV[order.userId].totalSpent += order.total;
        customerCLV[order.userId].orderCount += 1;
        if (order.createdAt < customerCLV[order.userId].firstOrder) {
          customerCLV[order.userId].firstOrder = order.createdAt;
        }
        if (order.createdAt > customerCLV[order.userId].lastOrder) {
          customerCLV[order.userId].lastOrder = order.createdAt;
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
    return NextResponse.json(
      { error: "Failed to fetch sales reports" },
      { status: 500 }
    );
  }
}
