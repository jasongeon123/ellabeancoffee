// Guest cart management using localStorage

export interface GuestCartItem {
  productId: string;
  quantity: number;
}

export interface GuestCart {
  items: GuestCartItem[];
}

const GUEST_CART_KEY = "ellabean_guest_cart";

// Get guest cart from localStorage
export function getGuestCart(): GuestCart {
  if (typeof window === "undefined") {
    return { items: [] };
  }

  try {
    const cart = localStorage.getItem(GUEST_CART_KEY);
    if (!cart) {
      return { items: [] };
    }
    return JSON.parse(cart);
  } catch (error) {
    console.error("Failed to parse guest cart:", error);
    return { items: [] };
  }
}

// Save guest cart to localStorage
export function saveGuestCart(cart: GuestCart): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error("Failed to save guest cart:", error);
  }
}

// Add item to guest cart
export function addToGuestCart(productId: string, quantity: number = 1): void {
  const cart = getGuestCart();

  const existingItem = cart.items.find((item) => item.productId === productId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ productId, quantity });
  }

  saveGuestCart(cart);
}

// Update item quantity in guest cart
export function updateGuestCartItem(productId: string, quantity: number): void {
  const cart = getGuestCart();

  const item = cart.items.find((item) => item.productId === productId);

  if (item) {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      cart.items = cart.items.filter((item) => item.productId !== productId);
    } else {
      item.quantity = quantity;
    }
  }

  saveGuestCart(cart);
}

// Remove item from guest cart
export function removeFromGuestCart(productId: string): void {
  const cart = getGuestCart();
  cart.items = cart.items.filter((item) => item.productId !== productId);
  saveGuestCart(cart);
}

// Clear guest cart
export function clearGuestCart(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(GUEST_CART_KEY);
}

// Get guest cart item count
export function getGuestCartCount(): number {
  const cart = getGuestCart();
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}
