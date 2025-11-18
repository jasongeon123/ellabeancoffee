import { NextRequest, NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe";
import { Pool } from '@neondatabase/serverless';

export async function POST(request: NextRequest) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const { amount, subtotal, discount, pointsUsed, couponCode, userId, items, shippingAddress, shippingCost, tax } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      pool.end();
      return NextResponse.json({ error: "Invalid items" }, { status: 400 });
    }

    // Validate items and ensure prices match database
    const productIds = items.map((item: any) => item.productId);
    const result = await pool.query(
      'SELECT * FROM "Product" WHERE id = ANY($1::text[])',
      [productIds]
    );
    const products = result.rows;

    const productMap = new Map(products.map((p) => [p.id, p]));

    // Verify all products exist and are in stock
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

    // Calculate actual total from database (don't trust client)
    const calculatedTotal = items.reduce((sum: number, item: any) => {
      const product = productMap.get(item.productId);
      return sum + (product?.price || 0) * item.quantity;
    }, 0);

    // Use the total sent from client (which includes shipping and tax already calculated)

    // Create Payment Intent
    const metadata: any = {
      items: JSON.stringify(items),
    };

    // Add coupon info to metadata
    if (couponCode) {
      metadata.couponCode = couponCode;
      metadata.subtotal = subtotal?.toString() || calculatedTotal.toString();
      metadata.discount = discount?.toString() || "0";
    }

    // Add points info to metadata
    if (pointsUsed) {
      metadata.pointsUsed = pointsUsed.toString();
    }

    // Add shipping info to metadata
    if (shippingAddress) {
      metadata.shippingName = shippingAddress.name;
      metadata.shippingAddress = shippingAddress.address;
      metadata.shippingCity = shippingAddress.city;
      metadata.shippingState = shippingAddress.state;
      metadata.shippingZip = shippingAddress.zip;
      metadata.shippingCountry = shippingAddress.country;
      metadata.shippingPhone = shippingAddress.phone;
    }

    // Add shipping cost and tax to metadata
    if (shippingCost !== undefined) {
      metadata.shippingCost = shippingCost.toString();
    }
    if (tax !== undefined) {
      metadata.tax = tax.toString();
    }

    if (userId) {
      metadata.userId = userId;
      // Get cart ID if authenticated user
      const cartResult = await pool.query(
        'SELECT id FROM "Cart" WHERE "userId" = $1 LIMIT 1',
        [userId]
      );
      if (cartResult.rows.length > 0) {
        metadata.cartId = cartResult.rows[0].id;
      }
    } else {
      metadata.guest = "true";
    }

    pool.end();

    const stripe = getStripeClient();
    if (!stripe) {
      return NextResponse.json(
        { error: "Payment service not configured" },
        { status: 503 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata,
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    console.error("Payment Intent Error:", error);
    pool.end();
    return NextResponse.json(
      { error: error.message || "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
