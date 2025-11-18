import { NextRequest, NextResponse } from "next/server";
import { Pool } from '@neondatabase/serverless';
import { getStripeClient } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const { items } = await request.json();

    if (!Array.isArray(items) || items.length === 0) {
      pool.end();
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Fetch product details from database to ensure prices are accurate
    const productIds = items.map((item: any) => item.productId);
    const result = await pool.query(
      'SELECT * FROM "Product" WHERE id = ANY($1::text[])',
      [productIds]
    );
    const products = result.rows;

    // Validate all products exist and are in stock
    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        pool.end();
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 404 }
        );
      }
      if (!product.inStock) {
        pool.end();
        return NextResponse.json(
          { error: `${product.name} is out of stock` },
          { status: 400 }
        );
      }
    }

    pool.end();

    // Calculate total from database prices (security - don't trust client)
    const total = items.reduce((sum, item) => {
      const product = productMap.get(item.productId);
      return sum + (product?.price || 0) * item.quantity;
    }, 0);

    // Create line items for Stripe
    const lineItems = items.map((item) => {
      const product = productMap.get(item.productId)!;
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            description: product.description,
            images: [
              product.image.startsWith("http")
                ? product.image
                : `${process.env.NEXTAUTH_URL}${product.image}`,
            ],
          },
          unit_amount: Math.round(product.price * 100), // Stripe uses cents
        },
        quantity: item.quantity,
      };
    });

    // Create Stripe checkout session for guest
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
      customer_email: undefined, // Let Stripe collect email
      metadata: {
        guest: "true",
        items: JSON.stringify(
          items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          }))
        ),
      },
    });

    return NextResponse.json({
      sessionId: stripeSession.id,
      url: stripeSession.url,
    });
  } catch (error: any) {
    console.error("Guest checkout error:", error);
    pool.end();
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
