import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("stripe-signature");

  let event;

  try {
    // For development, you can skip signature verification
    // In production, add STRIPE_WEBHOOK_SECRET to .env
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      event = stripe.webhooks.constructEvent(
        body,
        signature!,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } else {
      event = JSON.parse(body);
    }
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  // Handle the event
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const { userId, cartId } = paymentIntent.metadata as { userId: string; cartId: string };

    try {
      // Get cart items
      const cart = await prisma.cart.findUnique({
        where: { id: cartId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (cart) {
        // Calculate total
        const total = cart.items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );

        // Create order
        const order = await prisma.order.create({
          data: {
            userId,
            total: total * 1.08, // Including tax
            status: "completed",
            items: {
              create: cart.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.product.price,
              })),
            },
          },
        });

        // Get user email
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true },
        });

        // Send confirmation email
        if (user) {
          await sendOrderConfirmationEmail(user.email, {
            orderId: order.id,
            items: cart.items.map((item) => ({
              name: item.product.name,
              quantity: item.quantity,
              price: item.product.price,
            })),
            total: total * 1.08,
          });
        }

        // Clear cart
        await prisma.cartItem.deleteMany({
          where: { cartId },
        });
      }
    } catch (error) {
      console.error("Error processing order:", error);
      return NextResponse.json({ error: "Failed to process order" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
