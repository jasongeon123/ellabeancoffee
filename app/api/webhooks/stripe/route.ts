import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripeClient } from "@/lib/stripe";
import { Pool } from '@neondatabase/serverless';
import { sendOrderConfirmationEmail } from "@/lib/email";
import { generateOrderNumber, addTrackingUpdate } from "@/lib/orderUtils";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("stripe-signature");

  let event;

  try {
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

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    // Handle checkout.session.completed for Stripe Checkout
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const {
        guest, userId, cartId, items, couponCode, subtotal, discount, pointsUsed,
        shippingName, shippingAddress, shippingCity, shippingState, shippingZip,
        shippingCountry, shippingPhone, shippingCost, tax
      } = session.metadata as any;

      if (guest === "true") {
        // Guest checkout
        const parsedItems = JSON.parse(items);
        const customerEmail = session.customer_email || session.customer_details?.email;

        // Fetch product details
        const productIds = parsedItems.map((item: any) => item.productId);
        const productsResult = await pool.query(
          'SELECT * FROM "Product" WHERE id = ANY($1::text[])',
          [productIds]
        );
        const products = productsResult.rows;
        const productMap = new Map(products.map((p) => [p.id, p]));

        // Calculate total
        const total = parsedItems.reduce((sum: number, item: any) => {
          const product = productMap.get(item.productId);
          return sum + (product?.price || 0) * item.quantity;
        }, 0);

        // Check if guest email matches an existing user
        let user = null;
        if (customerEmail) {
          const userResult = await pool.query(
            'SELECT * FROM "User" WHERE email = $1 LIMIT 1',
            [customerEmail]
          );
          user = userResult.rows[0] || null;
        }

        // Generate order number
        const orderNumber = await generateOrderNumber();

        // Parse values
        const parsedDiscount = discount ? parseFloat(discount) : 0;
        const parsedSubtotal = subtotal ? parseFloat(subtotal) : total;
        const parsedPointsUsed = pointsUsed ? parseInt(pointsUsed) : 0;
        const parsedShippingCost = shippingCost ? parseFloat(shippingCost) : 0;
        const parsedTax = tax ? parseFloat(tax) : 0;

        // Calculate loyalty points
        const pointsDiscountAmount = parsedPointsUsed * 0.01;
        const finalAmount = parsedSubtotal - parsedDiscount - pointsDiscountAmount;
        const pointsEarned = user?.id ? Math.floor(finalAmount) : 0;

        // Create the order
        const orderResult = await pool.query(
          `INSERT INTO "Order" (
            id, "orderNumber", "userId", "guestEmail", subtotal, discount, "shippingCost", tax, total,
            "couponCode", "pointsUsed", "pointsEarned",
            "shippingName", "shippingAddress", "shippingCity", "shippingState", "shippingZip", "shippingCountry", "shippingPhone",
            status, "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW(), NOW()
          ) RETURNING *`,
          [
            orderNumber,
            user?.id || null,
            user ? null : customerEmail,
            parsedSubtotal,
            parsedDiscount,
            parsedShippingCost,
            parsedTax,
            parsedSubtotal - parsedDiscount - pointsDiscountAmount + parsedShippingCost + parsedTax,
            couponCode || null,
            parsedPointsUsed,
            pointsEarned,
            shippingName || null,
            shippingAddress || null,
            shippingCity || null,
            shippingState || null,
            shippingZip || null,
            shippingCountry || "US",
            shippingPhone || null,
            "pending"
          ]
        );
        const order = orderResult.rows[0];

        // Create order items
        for (const item of parsedItems) {
          const product = productMap.get(item.productId);
          await pool.query(
            `INSERT INTO "OrderItem" (id, "orderId", "productId", quantity, price, "createdAt")
             VALUES (gen_random_uuid()::text, $1, $2, $3, $4, NOW())`,
            [order.id, item.productId, item.quantity, product?.price || 0]
          );
        }

        // Record coupon usage if coupon was applied
        if (couponCode) {
          const couponResult = await pool.query(
            'SELECT * FROM "Coupon" WHERE code = $1 LIMIT 1',
            [couponCode]
          );
          const coupon = couponResult.rows[0];

          if (coupon) {
            await pool.query(
              `INSERT INTO "CouponUsage" (id, "couponId", "userId", "orderNumber", "usedAt")
               VALUES (gen_random_uuid()::text, $1, $2, $3, NOW())`,
              [coupon.id, user?.id || null, orderNumber]
            );

            await pool.query(
              'UPDATE "Coupon" SET "usedCount" = "usedCount" + 1 WHERE id = $1',
              [coupon.id]
            );
          }
        }

        // Deduct used points if applicable
        if (user?.id && parsedPointsUsed > 0) {
          await pool.query(
            'UPDATE "User" SET "loyaltyPoints" = "loyaltyPoints" - $1, "updatedAt" = NOW() WHERE id = $2',
            [parsedPointsUsed, user.id]
          );

          await pool.query(
            `INSERT INTO "PointsHistory" (id, "userId", points, type, description, "orderId", "createdAt")
             VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, NOW())`,
            [user.id, -parsedPointsUsed, "redeemed", `Redeemed for order ${orderNumber}`, order.id]
          );
        }

        // Award loyalty points if user exists
        if (user?.id && pointsEarned > 0) {
          await pool.query(
            'UPDATE "User" SET "loyaltyPoints" = "loyaltyPoints" + $1, "updatedAt" = NOW() WHERE id = $2',
            [pointsEarned, user.id]
          );

          await pool.query(
            `INSERT INTO "PointsHistory" (id, "userId", points, type, description, "orderId", "createdAt")
             VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, NOW())`,
            [user.id, pointsEarned, "earned", `Earned from order ${orderNumber}`, order.id]
          );
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
        const cartResult = await pool.query(
          `SELECT c.*,
           json_agg(json_build_object(
             'id', ci.id,
             'cartId', ci."cartId",
             'productId', ci."productId",
             'quantity', ci.quantity,
             'product', json_build_object('id', p.id, 'name', p.name, 'price', p.price)
           )) as items
           FROM "Cart" c
           LEFT JOIN "CartItem" ci ON c.id = ci."cartId"
           LEFT JOIN "Product" p ON ci."productId" = p.id
           WHERE c.id = $1
           GROUP BY c.id`,
          [cartId]
        );
        const cart = cartResult.rows[0];

        if (cart && cart.items && cart.items[0].id) {
          const cartTotal = cart.items.reduce(
            (sum: number, item: any) => sum + item.product.price * item.quantity,
            0
          );

          // Parse values
          const parsedDiscount = discount ? parseFloat(discount) : 0;
          const parsedSubtotal = subtotal ? parseFloat(subtotal) : cartTotal;
          const parsedPointsUsed = pointsUsed ? parseInt(pointsUsed) : 0;
          const parsedShippingCost = shippingCost ? parseFloat(shippingCost) : 0;
          const parsedTax = tax ? parseFloat(tax) : 0;

          // Calculate loyalty points
          const pointsDiscountAmount = parsedPointsUsed * 0.01;
          const finalAmount = parsedSubtotal - parsedDiscount - pointsDiscountAmount;
          const pointsEarned = Math.floor(finalAmount);

          // Generate order number
          const orderNumber = await generateOrderNumber();

          const orderResult = await pool.query(
            `INSERT INTO "Order" (
              id, "orderNumber", "userId", subtotal, discount, "shippingCost", tax, total,
              "couponCode", "pointsUsed", "pointsEarned",
              "shippingName", "shippingAddress", "shippingCity", "shippingState", "shippingZip", "shippingCountry", "shippingPhone",
              status, "createdAt", "updatedAt"
            ) VALUES (
              gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW(), NOW()
            ) RETURNING *`,
            [
              orderNumber,
              userId,
              parsedSubtotal,
              parsedDiscount,
              parsedShippingCost,
              parsedTax,
              parsedSubtotal - parsedDiscount - pointsDiscountAmount + parsedShippingCost + parsedTax,
              couponCode || null,
              parsedPointsUsed,
              pointsEarned,
              shippingName || null,
              shippingAddress || null,
              shippingCity || null,
              shippingState || null,
              shippingZip || null,
              shippingCountry || "US",
              shippingPhone || null,
              "pending"
            ]
          );
          const order = orderResult.rows[0];

          // Create order items
          for (const item of cart.items) {
            await pool.query(
              `INSERT INTO "OrderItem" (id, "orderId", "productId", quantity, price, "createdAt")
               VALUES (gen_random_uuid()::text, $1, $2, $3, $4, NOW())`,
              [order.id, item.productId, item.quantity, item.product.price]
            );
          }

          // Record coupon usage if coupon was applied
          if (couponCode) {
            const couponResult = await pool.query(
              'SELECT * FROM "Coupon" WHERE code = $1 LIMIT 1',
              [couponCode]
            );
            const coupon = couponResult.rows[0];

            if (coupon) {
              await pool.query(
                `INSERT INTO "CouponUsage" (id, "couponId", "userId", "orderNumber", "usedAt")
                 VALUES (gen_random_uuid()::text, $1, $2, $3, NOW())`,
                [coupon.id, userId, orderNumber]
              );

              await pool.query(
                'UPDATE "Coupon" SET "usedCount" = "usedCount" + 1 WHERE id = $1',
                [coupon.id]
              );
            }
          }

          // Deduct used points if applicable
          if (parsedPointsUsed > 0) {
            await pool.query(
              'UPDATE "User" SET "loyaltyPoints" = "loyaltyPoints" - $1, "updatedAt" = NOW() WHERE id = $2',
              [parsedPointsUsed, userId]
            );

            await pool.query(
              `INSERT INTO "PointsHistory" (id, "userId", points, type, description, "orderId", "createdAt")
               VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, NOW())`,
              [userId, -parsedPointsUsed, "redeemed", `Redeemed for order ${orderNumber}`, order.id]
            );
          }

          // Award loyalty points
          if (pointsEarned > 0) {
            await pool.query(
              'UPDATE "User" SET "loyaltyPoints" = "loyaltyPoints" + $1, "updatedAt" = NOW() WHERE id = $2',
              [pointsEarned, userId]
            );

            await pool.query(
              `INSERT INTO "PointsHistory" (id, "userId", points, type, description, "orderId", "createdAt")
               VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, NOW())`,
              [userId, pointsEarned, "earned", `Earned from order ${orderNumber}`, order.id]
            );
          }

          // Add initial tracking update
          await addTrackingUpdate(
            order.id,
            "pending",
            "Order received and is being processed"
          );

          const userResult = await pool.query(
            'SELECT email FROM "User" WHERE id = $1 LIMIT 1',
            [userId]
          );
          const user = userResult.rows[0];

          if (user) {
            await sendOrderConfirmationEmail(user.email, {
              orderId: order.id,
              orderNumber: order.orderNumber,
              items: cart.items.map((item: any) => ({
                name: item.product.name,
                quantity: item.quantity,
                price: item.product.price,
              })),
              total: order.total,
            });
          }

          await pool.query('DELETE FROM "CartItem" WHERE "cartId" = $1', [cartId]);
        }
      }
    }

    // Legacy support for payment_intent.succeeded
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const { userId, cartId } = paymentIntent.metadata as { userId: string; cartId: string };

      const cartResult = await pool.query(
        `SELECT c.*,
         json_agg(json_build_object(
           'id', ci.id,
           'cartId', ci."cartId",
           'productId', ci."productId",
           'quantity', ci.quantity,
           'product', json_build_object('id', p.id, 'name', p.name, 'price', p.price)
         )) as items
         FROM "Cart" c
         LEFT JOIN "CartItem" ci ON c.id = ci."cartId"
         LEFT JOIN "Product" p ON ci."productId" = p.id
         WHERE c.id = $1
         GROUP BY c.id`,
        [cartId]
      );
      const cart = cartResult.rows[0];

      if (cart && cart.items && cart.items[0].id) {
        // Calculate total
        const total = cart.items.reduce(
          (sum: number, item: any) => sum + item.product.price * item.quantity,
          0
        );

        // Generate order number
        const orderNumber = await generateOrderNumber();

        // Create order
        const orderResult = await pool.query(
          `INSERT INTO "Order" (
            id, "orderNumber", "userId", subtotal, total, status, "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid()::text, $1, $2, $3, $4, $5, NOW(), NOW()
          ) RETURNING *`,
          [orderNumber, userId, total, total * 1.08, "pending"]
        );
        const order = orderResult.rows[0];

        // Create order items
        for (const item of cart.items) {
          await pool.query(
            `INSERT INTO "OrderItem" (id, "orderId", "productId", quantity, price, "createdAt")
             VALUES (gen_random_uuid()::text, $1, $2, $3, $4, NOW())`,
            [order.id, item.productId, item.quantity, item.product.price]
          );
        }

        // Add initial tracking update
        await addTrackingUpdate(
          order.id,
          "pending",
          "Order received and is being processed"
        );

        // Get user email
        const userResult = await pool.query(
          'SELECT email FROM "User" WHERE id = $1 LIMIT 1',
          [userId]
        );
        const user = userResult.rows[0];

        // Send confirmation email
        if (user) {
          await sendOrderConfirmationEmail(user.email, {
            orderId: order.id,
            orderNumber: order.orderNumber,
            items: cart.items.map((item: any) => ({
              name: item.product.name,
              quantity: item.quantity,
              price: item.product.price,
            })),
            total: total * 1.08,
          });
        }

        // Clear cart
        await pool.query('DELETE FROM "CartItem" WHERE "cartId" = $1', [cartId]);
      }
    }

    pool.end();
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    pool.end();
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
