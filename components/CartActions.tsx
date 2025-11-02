"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CartActions({
  itemId,
  quantity,
}: {
  itemId: string;
  quantity: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const updateQuantity = async (newQuantity: number) => {
    console.log("updateQuantity called with:", newQuantity, "itemId:", itemId);
    if (newQuantity < 1) {
      console.log("newQuantity < 1, returning early");
      return;
    }
    setLoading(true);

    try {
      console.log("Making PATCH request to /api/cart/" + itemId);
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      console.log("Response status:", response.status, "ok:", response.ok);
      if (response.ok) {
        router.refresh();
      } else {
        const errorData = await response.json();
        console.error("Update failed:", errorData);
      }
    } catch (error) {
      console.error("Failed to update quantity:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async () => {
    console.log("removeItem called for itemId:", itemId);
    setLoading(true);

    try {
      console.log("Making DELETE request to /api/cart/" + itemId);
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
      });

      console.log("Response status:", response.status, "ok:", response.ok);
      if (response.ok) {
        router.refresh();
      } else {
        const errorData = await response.json();
        console.error("Remove failed:", errorData);
      }
    } catch (error) {
      console.error("Failed to remove item:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center border border-coffee-300">
        <button
          onClick={() => updateQuantity(quantity - 1)}
          disabled={loading || quantity <= 1}
          className="px-3 py-1 hover:bg-coffee-100 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          -
        </button>
        <span className="px-4 py-1 border-x border-coffee-300 min-w-[3rem] text-center">
          {quantity}
        </span>
        <button
          onClick={() => updateQuantity(quantity + 1)}
          disabled={loading}
          className="px-3 py-1 hover:bg-coffee-100 disabled:opacity-50"
        >
          +
        </button>
      </div>
      <button
        onClick={removeItem}
        disabled={loading}
        className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
      >
        Remove
      </button>
    </div>
  );
}
