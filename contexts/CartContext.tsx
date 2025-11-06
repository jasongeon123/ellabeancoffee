"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  getGuestCart,
  addToGuestCart,
  updateGuestCartItem,
  removeFromGuestCart,
  clearGuestCart,
} from "@/lib/guestCart";
import { trackAddToCart } from "@/components/analytics/GoogleAnalytics";
import { trackFBAddToCart } from "@/components/analytics/FacebookPixel";

interface CartItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    description: string;
  };
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addItem: (productId: string) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch cart data (for both guest and authenticated users)
  const refreshCart = async () => {
    setLoading(true);
    try {
      if (session?.user) {
        // Authenticated user - fetch from database
        const res = await fetch("/api/cart");
        if (res.ok) {
          const data = await res.json();
          setItems(data.items || []);
        }
      } else {
        // Guest user - get from localStorage and fetch product details
        const guestCart = getGuestCart();
        if (guestCart.items.length > 0) {
          // Fetch product details for all items in guest cart
          const productIds = guestCart.items.map((item) => item.productId);
          const res = await fetch("/api/products/batch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productIds }),
          });

          if (res.ok) {
            const products = await res.json();
            const cartItems: CartItem[] = guestCart.items.map((item) => {
              const product = products.find(
                (p: any) => p.id === item.productId
              );
              return {
                id: item.productId, // Use productId as id for guest items
                productId: item.productId,
                product: product || {
                  id: item.productId,
                  name: "Unknown Product",
                  price: 0,
                  image: "/placeholder.jpg",
                  description: "",
                },
                quantity: item.quantity,
              };
            });
            setItems(cartItems);
          } else {
            setItems([]);
          }
        } else {
          setItems([]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addItem = async (productId: string) => {
    try {
      if (session?.user) {
        // Authenticated user
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });

        if (res.ok) {
          // Fetch product details for tracking
          const productRes = await fetch(`/api/products/batch`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productIds: [productId] }),
          });

          if (productRes.ok) {
            const products = await productRes.json();
            const product = products[0];
            if (product) {
              // Track add to cart events
              trackAddToCart({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
              });
              trackFBAddToCart(product.name, product.id, product.price);
            }
          }

          await refreshCart();
        }
      } else {
        // Guest user
        addToGuestCart(productId, 1);

        // Fetch product details for tracking
        const productRes = await fetch(`/api/products/batch`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productIds: [productId] }),
        });

        if (productRes.ok) {
          const products = await productRes.json();
          const product = products[0];
          if (product) {
            // Track add to cart events
            trackAddToCart({
              id: product.id,
              name: product.name,
              price: product.price,
              quantity: 1,
            });
            trackFBAddToCart(product.name, product.id, product.price);
          }
        }

        await refreshCart();
      }
    } catch (error) {
      console.error("Failed to add item:", error);
    }
  };

  // Update item quantity
  const updateItem = async (productId: string, quantity: number) => {
    try {
      if (session?.user) {
        // Authenticated user
        const item = items.find((i) => i.productId === productId);
        if (item) {
          if (quantity <= 0) {
            await removeItem(productId);
          } else {
            const res = await fetch(`/api/cart/${item.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ quantity }),
            });

            if (res.ok) {
              await refreshCart();
            }
          }
        }
      } else {
        // Guest user
        if (quantity <= 0) {
          removeFromGuestCart(productId);
        } else {
          updateGuestCartItem(productId, quantity);
        }
        await refreshCart();
      }
    } catch (error) {
      console.error("Failed to update item:", error);
    }
  };

  // Remove item from cart
  const removeItem = async (productId: string) => {
    try {
      if (session?.user) {
        // Authenticated user
        const item = items.find((i) => i.productId === productId);
        if (item) {
          const res = await fetch(`/api/cart/${item.id}`, {
            method: "DELETE",
          });

          if (res.ok) {
            await refreshCart();
          }
        }
      } else {
        // Guest user
        removeFromGuestCart(productId);
        await refreshCart();
      }
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  // Get total items count
  const getTotalItems = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  // Get total price
  const getTotalPrice = () => {
    return items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  };

  // Load cart on mount and when session changes
  useEffect(() => {
    if (status !== "loading") {
      refreshCart();
    }
  }, [session, status]);

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        addItem,
        updateItem,
        removeItem,
        refreshCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
