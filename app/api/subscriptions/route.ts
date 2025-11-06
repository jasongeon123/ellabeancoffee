import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch user's subscriptions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
      include: {
        product: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error("Failed to fetch subscriptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}

// POST - Create a new subscription
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { productId, quantity, frequency } = body;

    // Validate input
    if (!productId || !quantity || !frequency) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["weekly", "bi-weekly", "monthly"].includes(frequency)) {
      return NextResponse.json(
        { error: "Invalid frequency" },
        { status: 400 }
      );
    }

    // Verify product exists and is in stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (!product.inStock) {
      return NextResponse.json(
        { error: "Product is out of stock" },
        { status: 400 }
      );
    }

    // Check if user already has an active subscription for this product
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        productId,
        status: { in: ["active", "paused"] },
      },
    });

    if (existingSubscription) {
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
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        productId,
        quantity,
        frequency,
        discount,
        nextDeliveryDate: nextDelivery,
        status: "active",
      },
      include: {
        product: true,
      },
    });

    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Failed to create subscription:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}
