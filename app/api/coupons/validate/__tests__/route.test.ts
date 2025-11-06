import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from '../route';
import { prismaMock, resetPrismaMock } from '@/lib/test-utils/prisma-mock';
import { createMockRequest, getResponseJson, getResponseStatus } from '@/lib/test-utils/api-test-helpers';

// Mock next-auth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

describe('/api/coupons/validate', () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  describe('POST', () => {
    it('should return error when code is missing', async () => {
      const req = createMockRequest('http://localhost:3000/api/coupons/validate', {
        method: 'POST',
        body: { cartTotal: 100 },
      });

      const response = await POST(req);
      const json = await getResponseJson(response);

      expect(getResponseStatus(response)).toBe(400);
      expect(json.error).toBe('Coupon code is required');
    });

    it('should return error for invalid coupon code', async () => {
      prismaMock.coupon.findUnique.mockResolvedValue(null);

      const req = createMockRequest('http://localhost:3000/api/coupons/validate', {
        method: 'POST',
        body: { code: 'INVALID', cartTotal: 100 },
      });

      const response = await POST(req);
      const json = await getResponseJson(response);

      expect(getResponseStatus(response)).toBe(404);
      expect(json.error).toBe('Invalid coupon code');
      expect(prismaMock.coupon.findUnique).toHaveBeenCalledWith({
        where: { code: 'INVALID' },
      });
    });

    it('should return error for inactive coupon', async () => {
      const inactiveCoupon = {
        id: 'coupon-123',
        code: 'INACTIVE20',
        description: 'Inactive coupon',
        discountPercent: 20,
        discountAmount: null,
        minPurchase: null,
        maxUses: null,
        usedCount: 0,
        active: false,
        expiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.coupon.findUnique.mockResolvedValue(inactiveCoupon);

      const req = createMockRequest('http://localhost:3000/api/coupons/validate', {
        method: 'POST',
        body: { code: 'INACTIVE20', cartTotal: 100 },
      });

      const response = await POST(req);
      const json = await getResponseJson(response);

      expect(getResponseStatus(response)).toBe(400);
      expect(json.error).toBe('This coupon is no longer active');
    });

    it('should return error for expired coupon', async () => {
      const expiredCoupon = {
        id: 'coupon-123',
        code: 'EXPIRED20',
        description: 'Expired coupon',
        discountPercent: 20,
        discountAmount: null,
        minPurchase: null,
        maxUses: null,
        usedCount: 0,
        active: true,
        expiresAt: new Date('2020-01-01'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.coupon.findUnique.mockResolvedValue(expiredCoupon);

      const req = createMockRequest('http://localhost:3000/api/coupons/validate', {
        method: 'POST',
        body: { code: 'EXPIRED20', cartTotal: 100 },
      });

      const response = await POST(req);
      const json = await getResponseJson(response);

      expect(getResponseStatus(response)).toBe(400);
      expect(json.error).toBe('This coupon has expired');
    });

    it('should return error when max uses reached', async () => {
      const maxedCoupon = {
        id: 'coupon-123',
        code: 'MAXED20',
        description: 'Maxed out coupon',
        discountPercent: 20,
        discountAmount: null,
        minPurchase: null,
        maxUses: 100,
        usedCount: 100,
        active: true,
        expiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.coupon.findUnique.mockResolvedValue(maxedCoupon);

      const req = createMockRequest('http://localhost:3000/api/coupons/validate', {
        method: 'POST',
        body: { code: 'MAXED20', cartTotal: 100 },
      });

      const response = await POST(req);
      const json = await getResponseJson(response);

      expect(getResponseStatus(response)).toBe(400);
      expect(json.error).toBe('This coupon has reached its maximum usage limit');
    });

    it('should return error when minimum purchase not met', async () => {
      const minPurchaseCoupon = {
        id: 'coupon-123',
        code: 'SAVE20',
        description: 'Save 20% with min purchase',
        discountPercent: 20,
        discountAmount: null,
        minPurchase: 50,
        maxUses: null,
        usedCount: 0,
        active: true,
        expiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.coupon.findUnique.mockResolvedValue(minPurchaseCoupon);

      const req = createMockRequest('http://localhost:3000/api/coupons/validate', {
        method: 'POST',
        body: { code: 'SAVE20', cartTotal: 30 },
      });

      const response = await POST(req);
      const json = await getResponseJson(response);

      expect(getResponseStatus(response)).toBe(400);
      expect(json.error).toBe('Minimum purchase of $50.00 required');
    });

    it('should validate and calculate percentage discount correctly', async () => {
      const percentCoupon = {
        id: 'coupon-123',
        code: 'SAVE20',
        description: 'Save 20%',
        discountPercent: 20,
        discountAmount: null,
        minPurchase: null,
        maxUses: null,
        usedCount: 0,
        active: true,
        expiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.coupon.findUnique.mockResolvedValue(percentCoupon);

      const req = createMockRequest('http://localhost:3000/api/coupons/validate', {
        method: 'POST',
        body: { code: 'SAVE20', cartTotal: 100 },
      });

      const response = await POST(req);
      const json = await getResponseJson(response);

      expect(getResponseStatus(response)).toBe(200);
      expect(json).toEqual({
        valid: true,
        code: 'SAVE20',
        discountAmount: 20, // 20% of 100
        discountPercent: 20,
        discountType: 'percentage',
        description: 'Save 20%',
      });
    });

    it('should validate and calculate fixed discount correctly', async () => {
      const fixedCoupon = {
        id: 'coupon-123',
        code: 'SAVE10',
        description: 'Save $10',
        discountPercent: null,
        discountAmount: 10,
        minPurchase: null,
        maxUses: null,
        usedCount: 0,
        active: true,
        expiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.coupon.findUnique.mockResolvedValue(fixedCoupon);

      const req = createMockRequest('http://localhost:3000/api/coupons/validate', {
        method: 'POST',
        body: { code: 'SAVE10', cartTotal: 100 },
      });

      const response = await POST(req);
      const json = await getResponseJson(response);

      expect(getResponseStatus(response)).toBe(200);
      expect(json).toEqual({
        valid: true,
        code: 'SAVE10',
        discountAmount: 10,
        discountPercent: null,
        discountType: 'fixed',
        description: 'Save $10',
      });
    });

    it('should cap discount at cart total', async () => {
      const largeCoupon = {
        id: 'coupon-123',
        code: 'HUGE50',
        description: 'Save $50',
        discountPercent: null,
        discountAmount: 50,
        minPurchase: null,
        maxUses: null,
        usedCount: 0,
        active: true,
        expiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.coupon.findUnique.mockResolvedValue(largeCoupon);

      const req = createMockRequest('http://localhost:3000/api/coupons/validate', {
        method: 'POST',
        body: { code: 'HUGE50', cartTotal: 30 },
      });

      const response = await POST(req);
      const json = await getResponseJson(response);

      expect(getResponseStatus(response)).toBe(200);
      expect(json.discountAmount).toBe(30); // Capped at cart total
    });

    it('should convert code to uppercase when searching', async () => {
      const coupon = {
        id: 'coupon-123',
        code: 'SAVE20',
        description: 'Save 20%',
        discountPercent: 20,
        discountAmount: null,
        minPurchase: null,
        maxUses: null,
        usedCount: 0,
        active: true,
        expiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.coupon.findUnique.mockResolvedValue(coupon);

      const req = createMockRequest('http://localhost:3000/api/coupons/validate', {
        method: 'POST',
        body: { code: 'save20', cartTotal: 100 }, // lowercase
      });

      const response = await POST(req);

      expect(prismaMock.coupon.findUnique).toHaveBeenCalledWith({
        where: { code: 'SAVE20' }, // Should be uppercased
      });
      expect(getResponseStatus(response)).toBe(200);
    });
  });
});
