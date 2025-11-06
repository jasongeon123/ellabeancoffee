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

interface ShippingAddress {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
}

export default function CheckoutFormWrapper({
  amount,
  subtotal,
  discount,
  pointsUsed,
  couponCode,
  userId,
  items,
  shippingAddress,
  shippingCost,
  tax,
}: {
  amount: number;
  subtotal: number;
  discount: number;
  pointsUsed?: number;
  couponCode?: string;
  userId: string | null;
  items: { productId: string; quantity: number }[];
  shippingAddress: ShippingAddress;
  shippingCost: number;
  tax: number;
}) {
  return (
    <CheckoutForm
      amount={amount}
      subtotal={subtotal}
      discount={discount}
      pointsUsed={pointsUsed}
      couponCode={couponCode}
      userId={userId}
      items={items}
      shippingAddress={shippingAddress}
      shippingCost={shippingCost}
      tax={tax}
    />
  );
}
