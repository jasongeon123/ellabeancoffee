import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getGuestCart,
  saveGuestCart,
  addToGuestCart,
  updateGuestCartItem,
  removeFromGuestCart,
  clearGuestCart,
  getGuestCartCount,
  type GuestCart,
} from '../guestCart';

describe('guestCart', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('getGuestCart', () => {
    it('should return empty cart when localStorage is empty', () => {
      localStorage.getItem = vi.fn(() => null);
      const cart = getGuestCart();
      expect(cart).toEqual({ items: [] });
    });

    it('should return parsed cart from localStorage', () => {
      const mockCart = { items: [{ productId: '123', quantity: 2 }] };
      localStorage.getItem = vi.fn(() => JSON.stringify(mockCart));
      const cart = getGuestCart();
      expect(cart).toEqual(mockCart);
    });

    it('should return empty cart when JSON parsing fails', () => {
      localStorage.getItem = vi.fn(() => 'invalid json');
      const cart = getGuestCart();
      expect(cart).toEqual({ items: [] });
    });

    it('should return empty cart in server-side environment', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;
      const cart = getGuestCart();
      expect(cart).toEqual({ items: [] });
      global.window = originalWindow;
    });
  });

  describe('saveGuestCart', () => {
    it('should save cart to localStorage', () => {
      const cart: GuestCart = {
        items: [{ productId: '123', quantity: 2 }],
      };
      localStorage.setItem = vi.fn();
      saveGuestCart(cart);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'ellabean_guest_cart',
        JSON.stringify(cart)
      );
    });

    it('should not throw when localStorage is unavailable', () => {
      const cart: GuestCart = { items: [] };
      localStorage.setItem = vi.fn(() => {
        throw new Error('localStorage unavailable');
      });
      expect(() => saveGuestCart(cart)).not.toThrow();
    });
  });

  describe('addToGuestCart', () => {
    it('should add new item to empty cart', () => {
      localStorage.getItem = vi.fn(() => null);
      localStorage.setItem = vi.fn();

      addToGuestCart('product-1', 1);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'ellabean_guest_cart',
        JSON.stringify({
          items: [{ productId: 'product-1', quantity: 1 }],
        })
      );
    });

    it('should increment quantity for existing item', () => {
      const existingCart = {
        items: [{ productId: 'product-1', quantity: 2 }],
      };
      localStorage.getItem = vi.fn(() => JSON.stringify(existingCart));
      localStorage.setItem = vi.fn();

      addToGuestCart('product-1', 3);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'ellabean_guest_cart',
        JSON.stringify({
          items: [{ productId: 'product-1', quantity: 5 }],
        })
      );
    });

    it('should add new item when other items exist', () => {
      const existingCart = {
        items: [{ productId: 'product-1', quantity: 2 }],
      };
      localStorage.getItem = vi.fn(() => JSON.stringify(existingCart));
      localStorage.setItem = vi.fn();

      addToGuestCart('product-2', 1);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'ellabean_guest_cart',
        JSON.stringify({
          items: [
            { productId: 'product-1', quantity: 2 },
            { productId: 'product-2', quantity: 1 },
          ],
        })
      );
    });

    it('should use default quantity of 1 when not specified', () => {
      localStorage.getItem = vi.fn(() => null);
      localStorage.setItem = vi.fn();

      addToGuestCart('product-1');

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'ellabean_guest_cart',
        JSON.stringify({
          items: [{ productId: 'product-1', quantity: 1 }],
        })
      );
    });
  });

  describe('updateGuestCartItem', () => {
    it('should update item quantity', () => {
      const existingCart = {
        items: [{ productId: 'product-1', quantity: 2 }],
      };
      localStorage.getItem = vi.fn(() => JSON.stringify(existingCart));
      localStorage.setItem = vi.fn();

      updateGuestCartItem('product-1', 5);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'ellabean_guest_cart',
        JSON.stringify({
          items: [{ productId: 'product-1', quantity: 5 }],
        })
      );
    });

    it('should remove item when quantity is 0', () => {
      const existingCart = {
        items: [
          { productId: 'product-1', quantity: 2 },
          { productId: 'product-2', quantity: 3 },
        ],
      };
      localStorage.getItem = vi.fn(() => JSON.stringify(existingCart));
      localStorage.setItem = vi.fn();

      updateGuestCartItem('product-1', 0);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'ellabean_guest_cart',
        JSON.stringify({
          items: [{ productId: 'product-2', quantity: 3 }],
        })
      );
    });

    it('should remove item when quantity is negative', () => {
      const existingCart = {
        items: [{ productId: 'product-1', quantity: 2 }],
      };
      localStorage.getItem = vi.fn(() => JSON.stringify(existingCart));
      localStorage.setItem = vi.fn();

      updateGuestCartItem('product-1', -1);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'ellabean_guest_cart',
        JSON.stringify({
          items: [],
        })
      );
    });

    it('should do nothing when item does not exist', () => {
      const existingCart = {
        items: [{ productId: 'product-1', quantity: 2 }],
      };
      localStorage.getItem = vi.fn(() => JSON.stringify(existingCart));
      localStorage.setItem = vi.fn();

      updateGuestCartItem('nonexistent', 5);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'ellabean_guest_cart',
        JSON.stringify(existingCart)
      );
    });
  });

  describe('removeFromGuestCart', () => {
    it('should remove item from cart', () => {
      const existingCart = {
        items: [
          { productId: 'product-1', quantity: 2 },
          { productId: 'product-2', quantity: 3 },
        ],
      };
      localStorage.getItem = vi.fn(() => JSON.stringify(existingCart));
      localStorage.setItem = vi.fn();

      removeFromGuestCart('product-1');

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'ellabean_guest_cart',
        JSON.stringify({
          items: [{ productId: 'product-2', quantity: 3 }],
        })
      );
    });

    it('should handle removing nonexistent item gracefully', () => {
      const existingCart = {
        items: [{ productId: 'product-1', quantity: 2 }],
      };
      localStorage.getItem = vi.fn(() => JSON.stringify(existingCart));
      localStorage.setItem = vi.fn();

      removeFromGuestCart('nonexistent');

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'ellabean_guest_cart',
        JSON.stringify(existingCart)
      );
    });
  });

  describe('clearGuestCart', () => {
    it('should remove cart from localStorage', () => {
      localStorage.removeItem = vi.fn();
      clearGuestCart();
      expect(localStorage.removeItem).toHaveBeenCalledWith('ellabean_guest_cart');
    });

    it('should not throw in server-side environment', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;
      expect(() => clearGuestCart()).not.toThrow();
      global.window = originalWindow;
    });
  });

  describe('getGuestCartCount', () => {
    it('should return 0 for empty cart', () => {
      localStorage.getItem = vi.fn(() => null);
      expect(getGuestCartCount()).toBe(0);
    });

    it('should return total quantity of all items', () => {
      const cart = {
        items: [
          { productId: 'product-1', quantity: 2 },
          { productId: 'product-2', quantity: 3 },
          { productId: 'product-3', quantity: 1 },
        ],
      };
      localStorage.getItem = vi.fn(() => JSON.stringify(cart));
      expect(getGuestCartCount()).toBe(6);
    });

    it('should return correct count for single item', () => {
      const cart = {
        items: [{ productId: 'product-1', quantity: 5 }],
      };
      localStorage.getItem = vi.fn(() => JSON.stringify(cart));
      expect(getGuestCartCount()).toBe(5);
    });
  });
});
