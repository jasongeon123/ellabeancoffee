import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Pool } from '@neondatabase/serverless';
import { getStripeClient } from "@/lib/stripe";

export async function POST(req: Request) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      pool.end();
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Get user's cart with items and products
    const cartResult = await pool.query(
      `SELECT c.id as cart_id,
        json_agg(
          json_build_object(
            'id', ci.id,
            'quantity', ci.quantity,
            'product', json_build_object(
              'id', p.id,
              'name', p.name,
              'description', p.description,
              'price', p.price,
              'image', p.image
            )
          )
        ) as items
       FROM "Cart" c
       LEFT JOIN "CartItem" ci ON c.id = ci."cartId"
       LEFT JOIN "Product" p ON ci."productId" = p.id
       WHERE c."userId" = $1
       GROUP BY c.id`,
      [userId]
    );

    if (cartResult.rows.length === 0 || !cartResult.rows[0].items || cartResult.rows[0].items[0].id === null) {
      pool.end();
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const cart = {
      id: cartResult.rows[0].cart_id,
      items: cartResult.rows[0].items
    };

    // Calculate total
    const total = cart.items.reduce(
      (sum: number, item: any) => sum + item.product.price * item.quantity,
      0
    );

    // Create line items for Stripe
    const lineItems = cart.items.map((item: any) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.product.name,
          description: item.product.description,
          images: [item.product.image.startsWith("http") ? item.product.image : `${process.env.NEXTAUTH_URL}${item.product.image}`],
        },
        unit_amount: Math.round(item.product.price * 100), // Stripe uses cents
      },
      quantity: item.quantity,
    }));

    pool.end();

    // Create Stripe checkout session
    const stripe = getStripeClient();
    if (!stripe) {
      return NextResponse.json(
        { error: "Payment service not configured" },
        { status: 503 }
      );
    }

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/cart`,
      metadata: {
        userId,
        cartId: cart.id,
      },
    });

    return NextResponse.json({ sessionId: stripeSession.id, url: stripeSession.url });
  } catch (error: any) {
    console.error("Checkout error:", error);
    pool.end();
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
