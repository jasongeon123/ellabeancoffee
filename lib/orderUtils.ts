import { prisma } from "@/lib/prisma";

/**
 * Generate a unique order number in format: EB-YYYY-NNNNNN
 * Example: EB-2024-000123
 */
export async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `EB-${year}-`;

  // Find the highest order number for this year
  const latestOrder = await prisma.order.findFirst({
    where: {
      orderNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      orderNumber: "desc",
    },
  });

  let nextNumber = 1;

  if (latestOrder) {
    // Extract the number part and increment
    const currentNumber = parseInt(latestOrder.orderNumber.split("-")[2]);
    nextNumber = currentNumber + 1;
  }

  // Pad with zeros to 6 digits
  const paddedNumber = nextNumber.toString().padStart(6, "0");

  return `${prefix}${paddedNumber}`;
}

/**
 * Check if user has purchased a specific product (for verified purchase badge)
 */
export async function hasUserPurchasedProduct(
  userId: string,
  productId: string
): Promise<boolean> {
  const order = await prisma.order.findFirst({
    where: {
      userId,
      status: {
        in: ["completed", "shipped", "delivered"],
      },
      items: {
        some: {
          productId,
        },
      },
    },
  });

  return !!order;
}

/**
 * Get tracking information for an order
 */
export async function getOrderTracking(orderNumber: string) {
  return await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      trackingUpdates: {
        orderBy: {
          timestamp: "desc",
        },
      },
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
}

/**
 * Add a tracking update to an order
 */
export async function addTrackingUpdate(
  orderId: string,
  status: string,
  message: string,
  location?: string
) {
  return await prisma.trackingUpdate.create({
    data: {
      orderId,
      status,
      message,
      location,
    },
  });
}

/**
 * Update order tracking information
 */
export async function updateOrderTracking(
  orderId: string,
  data: {
    status?: string;
    trackingStatus?: string;
    trackingCarrier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    notes?: string;
  }
) {
  return await prisma.order.update({
    where: { id: orderId },
    data,
  });
}
