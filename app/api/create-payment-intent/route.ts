import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { amount, subtotal, discount, pointsUsed, couponCode, userId, items, shippingAddress, shippingCost, tax } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Invalid items" }, { status: 400 });
    }

    // Validate items and ensure prices match database
    const productIds = items.map((item: any) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    // Verify all products exist and are in stock
    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 404 }
        );
      }
      if (!product.inStock) {
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
      const cart = await prisma.cart.findUnique({
        where: { userId },
        select: { id: true },
      });
      if (cart) {
        metadata.cartId = cart.id;
      }
    } else {
      metadata.guest = "true";
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
    return NextResponse.json(
      { error: error.message || "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
