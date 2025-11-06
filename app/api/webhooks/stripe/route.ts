import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripeClient } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { generateOrderNumber, addTrackingUpdate } from "@/lib/orderUtils";

// Note: Analytics tracking is client-side only, so we'll log purchase data
// for manual tracking or use server-side Google Analytics Measurement Protocol
// For now, we'll add comments where tracking would happen

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("stripe-signature");

  let event;

  try {
    // For development, you can skip signature verification
    // In production, add STRIPE_WEBHOOK_SECRET to .env
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      const stripe = getStripeClient();
      if (!stripe) {
        console.error("Stripe client not initialized");
        return NextResponse.json(
          { error: "Payment service not configured" },
          { status: 503 }
        );
      }
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

  // Handle checkout.session.completed for Stripe Checkout
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const {
      guest, userId, cartId, items, couponCode, subtotal, discount, pointsUsed,
      shippingName, shippingAddress, shippingCity, shippingState, shippingZip,
      shippingCountry, shippingPhone, shippingCost, tax
    } = session.metadata as any;

    try {
      if (guest === "true") {
        // Guest checkout
        const parsedItems = JSON.parse(items);
        const customerEmail = session.customer_email || session.customer_details?.email;

        // Fetch product details
        const productIds = parsedItems.map((item: any) => item.productId);
        const products = await prisma.product.findMany({
          where: { id: { in: productIds } },
        });

        const productMap = new Map(products.map((p) => [p.id, p]));

        // Calculate total
        const total = parsedItems.reduce((sum: number, item: any) => {
          const product = productMap.get(item.productId);
          return sum + (product?.price || 0) * item.quantity;
        }, 0);

        // Check if guest email matches an existing user
        let user = customerEmail ? await prisma.user.findUnique({
          where: { email: customerEmail },
        }) : null;

        // Generate order number
        const orderNumber = await generateOrderNumber();

        // Parse discount and points if provided
        const parsedDiscount = discount ? parseFloat(discount) : 0;
        const parsedSubtotal = subtotal ? parseFloat(subtotal) : total;
        const parsedPointsUsed = pointsUsed ? parseInt(pointsUsed) : 0;
        const parsedShippingCost = shippingCost ? parseFloat(shippingCost) : 0;
        const parsedTax = tax ? parseFloat(tax) : 0;

        // Calculate loyalty points (1 point per dollar spent, after all discounts)
        const pointsDiscountAmount = parsedPointsUsed * 0.01;
        const finalAmount = parsedSubtotal - parsedDiscount - pointsDiscountAmount;
        const pointsEarned = user?.id ? Math.floor(finalAmount) : 0;

        // Create the order (with userId if user exists, or guestEmail if not)
        const order = await prisma.order.create({
          data: {
            orderNumber,
            userId: user?.id,
            guestEmail: user ? null : customerEmail, // Only set guestEmail if no user account
            subtotal: parsedSubtotal,
            discount: parsedDiscount,
            shippingCost: parsedShippingCost,
            tax: parsedTax,
            total: parsedSubtotal - parsedDiscount - pointsDiscountAmount + parsedShippingCost + parsedTax,
            couponCode: couponCode || null,
            pointsUsed: parsedPointsUsed,
            pointsEarned,
            // Shipping Address
            shippingName: shippingName || null,
            shippingAddress: shippingAddress || null,
            shippingCity: shippingCity || null,
            shippingState: shippingState || null,
            shippingZip: shippingZip || null,
            shippingCountry: shippingCountry || "US",
            shippingPhone: shippingPhone || null,
            status: "pending",
            items: {
              create: parsedItems.map((item: any) => {
                const product = productMap.get(item.productId);
                return {
                  productId: item.productId,
                  quantity: item.quantity,
                  price: product?.price || 0,
                };
              }),
            },
          },
        });

        // Record coupon usage if coupon was applied
        if (couponCode) {
          const coupon = await prisma.coupon.findUnique({
            where: { code: couponCode },
          });

          if (coupon) {
            await prisma.couponUsage.create({
              data: {
                couponId: coupon.id,
                userId: user?.id,
                orderNumber,
              },
            });

            await prisma.coupon.update({
              where: { id: coupon.id },
              data: { usedCount: { increment: 1 } },
            });
          }
        }

        // Deduct used points if applicable
        if (user?.id && parsedPointsUsed > 0) {
          await prisma.user.update({
            where: { id: user.id },
            data: { loyaltyPoints: { decrement: parsedPointsUsed } },
          });

          await prisma.pointsHistory.create({
            data: {
              userId: user.id,
              points: -parsedPointsUsed,
              type: "redeemed",
              description: `Redeemed for order ${orderNumber}`,
              orderId: order.id,
            },
          });
        }

        // Award loyalty points if user exists
        if (user?.id && pointsEarned > 0) {
          await prisma.user.update({
            where: { id: user.id },
            data: { loyaltyPoints: { increment: pointsEarned } },
          });

          await prisma.pointsHistory.create({
            data: {
              userId: user.id,
              points: pointsEarned,
              type: "earned",
              description: `Earned from order ${orderNumber}`,
              orderId: order.id,
            },
          });
        }

        // Add initial tracking update
        await addTrackingUpdate(
          order.id,
          "pending",
          "Order received and is being processed"
        );

        // Send confirmation email to guest
        if (customerEmail) {
          await sendOrderConfirmationEmail(customerEmail, {
            orderId: order.id,
            orderNumber: order.orderNumber,
            items: parsedItems.map((item: any) => {
              const product = productMap.get(item.productId);
              return {
                name: product?.name || "Unknown",
                quantity: item.quantity,
                price: product?.price || 0,
              };
            }),
            total: total * 1.08,
          });
        }
      } else {
        // Authenticated user checkout
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
          const cartTotal = cart.items.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
          );

          // Parse discount and points if provided
          const parsedDiscount = discount ? parseFloat(discount) : 0;
          const parsedSubtotal = subtotal ? parseFloat(subtotal) : cartTotal;
          const parsedPointsUsed = pointsUsed ? parseInt(pointsUsed) : 0;
          const parsedShippingCost = shippingCost ? parseFloat(shippingCost) : 0;
          const parsedTax = tax ? parseFloat(tax) : 0;

          // Calculate loyalty points (1 point per dollar spent, after all discounts)
          const pointsDiscountAmount = parsedPointsUsed * 0.01;
          const finalAmount = parsedSubtotal - parsedDiscount - pointsDiscountAmount;
          const pointsEarned = Math.floor(finalAmount);

          // Generate order number
          const orderNumber = await generateOrderNumber();

          const order = await prisma.order.create({
            data: {
              orderNumber,
              userId,
              subtotal: parsedSubtotal,
              discount: parsedDiscount,
              shippingCost: parsedShippingCost,
              tax: parsedTax,
              total: parsedSubtotal - parsedDiscount - pointsDiscountAmount + parsedShippingCost + parsedTax,
              couponCode: couponCode || null,
              pointsUsed: parsedPointsUsed,
              pointsEarned,
              // Shipping Address
              shippingName: shippingName || null,
              shippingAddress: shippingAddress || null,
              shippingCity: shippingCity || null,
              shippingState: shippingState || null,
              shippingZip: shippingZip || null,
              shippingCountry: shippingCountry || "US",
              shippingPhone: shippingPhone || null,
              status: "pending",
              items: {
                create: cart.items.map((item) => ({
                  productId: item.productId,
                  quantity: item.quantity,
                  price: item.product.price,
                })),
              },
            },
          });

          // Record coupon usage if coupon was applied
          if (couponCode) {
            const coupon = await prisma.coupon.findUnique({
              where: { code: couponCode },
            });

            if (coupon) {
              await prisma.couponUsage.create({
                data: {
                  couponId: coupon.id,
                  userId,
                  orderNumber,
                },
              });

              await prisma.coupon.update({
                where: { id: coupon.id },
                data: { usedCount: { increment: 1 } },
              });
            }
          }

          // Deduct used points if applicable
          if (parsedPointsUsed > 0) {
            await prisma.user.update({
              where: { id: userId },
              data: { loyaltyPoints: { decrement: parsedPointsUsed } },
            });

            await prisma.pointsHistory.create({
              data: {
                userId,
                points: -parsedPointsUsed,
                type: "redeemed",
                description: `Redeemed for order ${orderNumber}`,
                orderId: order.id,
              },
            });
          }

          // Award loyalty points
          if (pointsEarned > 0) {
            await prisma.user.update({
              where: { id: userId },
              data: { loyaltyPoints: { increment: pointsEarned } },
            });

            await prisma.pointsHistory.create({
              data: {
                userId,
                points: pointsEarned,
                type: "earned",
                description: `Earned from order ${orderNumber}`,
                orderId: order.id,
              },
            });
          }

          // Add initial tracking update
          await addTrackingUpdate(
            order.id,
            "pending",
            "Order received and is being processed"
          );

          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true },
          });

          if (user) {
            await sendOrderConfirmationEmail(user.email, {
              orderId: order.id,
              orderNumber: order.orderNumber,
              items: cart.items.map((item) => ({
                name: item.product.name,
                quantity: item.quantity,
                price: item.product.price,
              })),
              total: order.total,
            });
          }

          await prisma.cartItem.deleteMany({
            where: { cartId },
          });
        }
      }
    } catch (error) {
      console.error("Error processing checkout session:", error);
      return NextResponse.json(
        { error: "Failed to process checkout" },
        { status: 500 }
      );
    }
  }

  // Legacy support for payment_intent.succeeded
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

        // Generate order number
        const orderNumber = await generateOrderNumber();

        // Create order
        const order = await prisma.order.create({
          data: {
            orderNumber,
            userId,
            subtotal: total,
            total: total * 1.08, // Including tax
            status: "pending",
            items: {
              create: cart.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.product.price,
              })),
            },
          },
        });

        // Add initial tracking update
        await addTrackingUpdate(
          order.id,
          "pending",
          "Order received and is being processed"
        );

        // Get user email
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true },
        });

        // Send confirmation email
        if (user) {
          await sendOrderConfirmationEmail(user.email, {
            orderId: order.id,
            orderNumber: order.orderNumber,
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
