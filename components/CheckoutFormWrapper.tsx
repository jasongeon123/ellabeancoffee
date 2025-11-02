"use client";

import dynamic from "next/dynamic";

// Dynamically import CheckoutForm to prevent Stripe from loading on initial page load
const CheckoutForm = dynamic(() => import("./CheckoutForm"), {
  loading: () => (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-900"></div>
    </div>
  ),
  ssr: false, // Don't render on server since Stripe needs window object
});

export default function CheckoutFormWrapper({
  amount,
  cartId,
  userId,
}: {
  amount: number;
  cartId: string;
  userId: string;
}) {
  return <CheckoutForm amount={amount} cartId={cartId} userId={userId} />;
}
