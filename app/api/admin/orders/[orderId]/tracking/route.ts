import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Pool } from '@neondatabase/serverless';
import { addTrackingUpdate, updateOrderTracking } from "@/lib/orderUtils";
import { sendShippingNotificationEmail, sendOrderStatusUpdateEmail } from "@/lib/email";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "admin") {
      await pool.end();
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
      const orderResult = await pool.query(
        `SELECT
          o.*,
          json_build_object('email', u.email, 'name', u.name) as user,
          COALESCE(
            json_agg(
              json_build_object(
                'name', p.name,
                'quantity', oi.quantity
              )
            ) FILTER (WHERE oi.id IS NOT NULL),
            '[]'
          ) as items
        FROM "Order" o
        LEFT JOIN "User" u ON o."userId" = u.id
        LEFT JOIN "OrderItem" oi ON o.id = oi."orderId"
        LEFT JOIN "Product" p ON oi."productId" = p.id
        WHERE o.id = $1
        GROUP BY o.id, u.email, u.name`,
        [params.orderId]
      );

      if (orderResult.rows.length > 0) {
        const order = orderResult.rows[0];
        const customerEmail = order.user?.email || order.guestEmail;

        if (customerEmail) {
          const orderItems = order.items.map((item: any) => ({
            name: item.name,
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

    await pool.end();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating order tracking:", error);
    await pool.end();
    return NextResponse.json(
      { error: "Failed to update tracking" },
      { status: 500 }
    );
  }
}
