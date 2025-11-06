import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch a specific subscription
export async function GET(
  request: NextRequest,
  { params }: { params: { subscriptionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const subscription = await prisma.subscription.findFirst({
      where: {
        id: params.subscriptionId,
        userId,
      },
      include: {
        product: true,
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Failed to fetch subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}

// PATCH - Update a subscription
export async function PATCH(
  request: NextRequest,
  { params }: { params: { subscriptionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { quantity, frequency, status, nextDeliveryDate } = body;

    // Verify subscription exists and belongs to user
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        id: params.subscriptionId,
        userId,
      },
    });

    if (!existingSubscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: any = {};

    if (quantity !== undefined) {
      if (quantity < 1) {
        return NextResponse.json(
          { error: "Quantity must be at least 1" },
          { status: 400 }
        );
      }
      updateData.quantity = quantity;
    }

    if (frequency !== undefined) {
      if (!["weekly", "bi-weekly", "monthly"].includes(frequency)) {
        return NextResponse.json(
          { error: "Invalid frequency" },
          { status: 400 }
        );
      }
      updateData.frequency = frequency;

      // Update discount based on new frequency
      if (frequency === "weekly") {
        updateData.discount = 15;
      } else if (frequency === "bi-weekly") {
        updateData.discount = 12;
      } else if (frequency === "monthly") {
        updateData.discount = 10;
      }

      // Recalculate next delivery if frequency changed
      if (!nextDeliveryDate) {
        const newNextDeliveryDate = new Date();
        if (frequency === "weekly") {
          newNextDeliveryDate.setDate(newNextDeliveryDate.getDate() + 7);
        } else if (frequency === "bi-weekly") {
          newNextDeliveryDate.setDate(newNextDeliveryDate.getDate() + 14);
        } else if (frequency === "monthly") {
          newNextDeliveryDate.setMonth(newNextDeliveryDate.getMonth() + 1);
        }
        updateData.nextDeliveryDate = newNextDeliveryDate;
      }
    }

    if (status !== undefined) {
      if (!["active", "paused", "cancelled"].includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      updateData.status = status;
    }

    if (nextDeliveryDate !== undefined) {
      updateData.nextDeliveryDate = new Date(nextDeliveryDate);
    }

    // Update subscription
    const subscription = await prisma.subscription.update({
      where: { id: params.subscriptionId },
      data: updateData,
      include: {
        product: true,
      },
    });

    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Failed to update subscription:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}

// DELETE - Cancel a subscription
export async function DELETE(
  request: NextRequest,
  { params }: { params: { subscriptionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Verify subscription exists and belongs to user
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        id: params.subscriptionId,
        userId,
      },
    });

    if (!existingSubscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    // Instead of deleting, mark as cancelled (soft delete)
    const subscription = await prisma.subscription.update({
      where: { id: params.subscriptionId },
      data: {
        status: "cancelled",
      },
      include: {
        product: true,
      },
    });

    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Failed to cancel subscription:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
