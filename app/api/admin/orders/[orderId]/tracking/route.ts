import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addTrackingUpdate, updateOrderTracking } from "@/lib/orderUtils";
import { sendShippingNotificationEmail, sendOrderStatusUpdateEmail } from "@/lib/email";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      status,
      trackingCarrier,
      trackingNumber,
      trackingUrl,
      notes,
      updateMessage,
      updateLocation,
    } = body;

    // Update order tracking details
    await updateOrderTracking(params.orderId, {
      status,
      trackingCarrier: trackingCarrier || null,
      trackingNumber: trackingNumber || null,
      trackingUrl: trackingUrl || null,
      notes: notes || null,
    });

    // Add tracking update if message provided
    if (updateMessage) {
      await addTrackingUpdate(
        params.orderId,
        status,
        updateMessage,
        updateLocation || undefined
      );
    }

    // Send email notification based on status change
    try {
      const order = await prisma.order.findUnique({
        where: { id: params.orderId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      });

      if (order) {
        const customerEmail = order.user?.email || order.guestEmail;

        if (customerEmail) {
          const orderItems = order.items.map(item => ({
            name: item.product.name,
            quantity: item.quantity,
          }));

          // Send shipping notification if status is shipped and tracking info provided
          if (status === "shipped" && trackingNumber) {
            await sendShippingNotificationEmail(customerEmail, {
              orderNumber: order.orderNumber,
              trackingNumber: trackingNumber || undefined,
              carrier: trackingCarrier || undefined,
              estimatedDelivery: undefined,
              items: orderItems,
            });
          } else if (status && order.status !== status) {
            // Send general status update for other status changes
            await sendOrderStatusUpdateEmail(customerEmail, {
              orderNumber: order.orderNumber,
              status,
              statusMessage: updateMessage || `Your order status has been updated to ${status}.`,
              items: orderItems,
            });
          }
        }
      }
    } catch (emailError) {
      // Log email error but don't fail the request
      console.error("Failed to send email notification:", emailError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating order tracking:", error);
    return NextResponse.json(
      { error: "Failed to update tracking" },
      { status: 500 }
    );
  }
}
