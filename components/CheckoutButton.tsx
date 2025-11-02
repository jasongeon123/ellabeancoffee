"use client";

import { useRouter } from "next/navigation";

export default function CheckoutButton() {
  const router = useRouter();

  const handleCheckout = () => {
    router.push("/checkout");
  };

  return (
    <button
      onClick={handleCheckout}
      className="w-full bg-coffee-900 text-white py-5 rounded-full hover:bg-coffee-800 transition-all duration-300 uppercase text-xs tracking-widest font-medium shadow-xl hover:shadow-2xl hover:scale-105 mb-4"
    >
      Proceed to Checkout
    </button>
  );
}
