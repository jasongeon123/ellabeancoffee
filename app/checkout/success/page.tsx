import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { redirect } from "next/navigation";
import TestimonialForm from "@/components/TestimonialForm";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ payment_intent?: string; cartId?: string; userId?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/signin");
  }

  const params = await searchParams;
  const { payment_intent, cartId, userId } = params;

  // Process the order if we have the necessary information
  if (payment_intent && cartId && userId) {
    try {
      // Verify payment succeeded
      const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent);

      if (paymentIntent.status === "succeeded") {
        // Check if order already exists (prevent duplicate orders)
        const existingOrder = await prisma.order.findFirst({
          where: {
            userId,
            // Check if an order was created in the last 5 minutes for this cart
            createdAt: {
              gte: new Date(Date.now() - 5 * 60 * 1000),
            },
          },
        });

        if (!existingOrder) {
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

          if (cart && cart.items.length > 0) {
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
        }
      }
    } catch (error) {
      console.error("Error processing order on success page:", error);
      // Continue to show success page even if there's an error
      // The webhook will handle it as a backup
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-coffee-50 to-white py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 border border-coffee-100">
          {/* Success Icon */}
          <div className="mb-6 inline-block p-6 bg-green-50 rounded-full">
            <svg
              className="w-16 h-16 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl sm:text-4xl font-light text-coffee-900 mb-4 tracking-tight">
            Order Successful!
          </h1>
          <p className="text-lg text-coffee-600 font-light mb-8">
            Thank you for your purchase. Your order has been confirmed and we'll send you an email with the details.
          </p>

          {/* Order Details */}
          <div className="bg-coffee-50 rounded-xl p-6 mb-8">
            <p className="text-sm text-coffee-700 font-light mb-2">
              We're preparing your coffee order with care
            </p>
            <p className="text-xs text-coffee-600 font-light">
              You'll receive a confirmation email shortly with your order details and pickup instructions.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/#products"
              className="inline-block bg-coffee-900 text-white px-8 py-4 rounded-full hover:bg-coffee-800 transition-all duration-300 uppercase text-xs tracking-widest font-medium shadow-lg hover:shadow-xl hover:scale-105"
            >
              Continue Shopping
            </Link>
            <Link
              href="/"
              className="inline-block bg-white text-coffee-900 px-8 py-4 rounded-full hover:bg-coffee-50 transition-all duration-300 uppercase text-xs tracking-widest font-medium shadow-lg hover:shadow-xl hover:scale-105 border border-coffee-300"
            >
              Return Home
            </Link>
          </div>
        </div>

        {/* Testimonial Form Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 border border-coffee-100 mt-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-light text-coffee-900 mb-3 tracking-tight">
              Share Your Experience
            </h2>
            <p className="text-coffee-600 font-light">
              We'd love to hear about your experience with Ella Bean Coffee. Your feedback helps us serve you better!
            </p>
          </div>
          <TestimonialForm />
        </div>
      </div>
    </div>
  );
}
