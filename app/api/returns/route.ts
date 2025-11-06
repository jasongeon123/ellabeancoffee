import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Get user's return requests
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const returns = await prisma.return.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ returns });
  } catch (error: any) {
    console.error("Failed to fetch returns:", error);
    return NextResponse.json(
      { error: "Failed to fetch returns" },
      { status: 500 }
    );
  }
}

// Create a new return request
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { orderNumber, reason, items } = await request.json();

    // Validate inputs
    if (!orderNumber || !reason || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Order number, reason, and items are required" },
        { status: 400 }
      );
    }

    // Verify the order belongs to the user
    const order = await prisma.order.findFirst({
      where: {
        orderNumber,
        userId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found or does not belong to you" },
        { status: 404 }
      );
    }

    // Verify order is not already in a return process
    const existingReturn = await prisma.return.findFirst({
      where: {
        orderNumber,
        status: { in: ["pending", "approved"] },
      },
    });

    if (existingReturn) {
      return NextResponse.json(
        { error: "A return request already exists for this order" },
        { status: 400 }
      );
    }

    // Calculate refund amount for selected items
    const selectedItems = order.items.filter((item) =>
      items.includes(item.id)
    );
    const refundAmount = selectedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Create the return request
    const returnRequest = await prisma.return.create({
      data: {
        userId,
        orderNumber,
        reason,
        items,
        refundAmount,
        status: "pending",
      },
    });

    return NextResponse.json({ return: returnRequest });
  } catch (error: any) {
    console.error("Failed to create return request:", error);
    return NextResponse.json(
      { error: "Failed to create return request" },
      { status: 500 }
    );
  }
}
