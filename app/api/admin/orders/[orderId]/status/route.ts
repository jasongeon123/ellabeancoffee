import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Pool } from '@neondatabase/serverless';
import { getResendClient } from "@/lib/email";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "admin") {
      pool.end();
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await request.json();

    if (!["pending", "completed", "cancelled"].includes(status)) {
      pool.end();
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Update order status
    await pool.query(
      'UPDATE "Order" SET status = $1, "updatedAt" = NOW() WHERE id = $2',
      [status, params.orderId]
    );

    // Fetch updated order with all details
    const orderResult = await pool.query(
      `SELECT o.*,
        json_build_object('name', u.name, 'email', u.email) as user,
        json_agg(
          json_build_object(
            'id', oi.id,
            'quantity', oi.quantity,
            'price', oi.price,
            'product', json_build_object(
              'id', p.id,
              'name', p.name,
              'image', p.image,
              'price', p.price
            )
          )
        ) as items
       FROM "Order" o
       LEFT JOIN "User" u ON o."userId" = u.id
       LEFT JOIN "OrderItem" oi ON o.id = oi."orderId"
       LEFT JOIN "Product" p ON oi."productId" = p.id
       WHERE o.id = $1
       GROUP BY o.id, u.name, u.email`,
      [params.orderId]
    );

    if (orderResult.rows.length === 0) {
      pool.end();
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = orderResult.rows[0];

    pool.end();

    // Send email notification if order is completed
    if (status === "completed" && process.env.RESEND_API_KEY) {
      const itemsList = order.items
        .map(
          (item: any) =>
            `<li>${item.quantity}× ${item.product.name} - $${(
              item.price * item.quantity
            ).toFixed(2)}</li>`
        )
        .join("");

      const recipientEmail = order.user?.email || order.guestEmail;
      const recipientName = order.user?.name || "there";

      if (recipientEmail) {
        try {
          const resend = getResendClient();
          if (resend) {
            await resend.emails.send({
            from: "Ella Bean Coffee <orders@ellabeancoffee.com>",
            to: recipientEmail,
            subject: "Your Ella Bean Coffee Order is Complete!",
            html: `
              <!DOCTYPE html>
              <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: #4A2C2A; color: white; padding: 20px; text-align: center;">
                      <h1>Order Complete!</h1>
                    </div>
                    <div style="padding: 20px; background: #f9f9f9;">
                      <p>Hello ${recipientName},</p>
                    <p>Great news! Your order has been completed and is ready for pickup at our next location.</p>

                    <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
                      <h3>Order Details</h3>
                      <ul>${itemsList}</ul>
                      <hr>
                      <p style="font-size: 20px; font-weight: bold; color: #4A2C2A;">Total: $${order.total.toFixed(
                        2
                      )}</p>
                    </div>

                    <p>Check our location bulletin board for where to pick up your order!</p>
                    <p style="text-align: center; margin-top: 30px;">
                      <a href="https://ellabeancoffee.com/locations" style="background: #4A2C2A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">View Locations</a>
                    </p>
                  </div>
                  <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
                    <p>&copy; ${new Date().getFullYear()} Ella Bean Coffee. All rights reserved.</p>
                  </div>
                </div>
              </body>
            </html>
          `,
          });
          }
        } catch (emailError) {
          console.error("Failed to send email:", emailError);
          // Don't fail the request if email fails
        }
      }
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Failed to update order status:", error);
    pool.end();
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}
