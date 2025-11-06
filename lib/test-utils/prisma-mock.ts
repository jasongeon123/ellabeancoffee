import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended';

// Create a deep mock of PrismaClient
export const prismaMock = mockDeep<PrismaClient>();

// Export type for better TypeScript support
export type PrismaMockClient = DeepMockProxy<PrismaClient>;

// Reset all mocks before each test
export function resetPrismaMock() {
  mockReset(prismaMock);
}

// Mock Prisma client module
vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}));

// Sample test data generators
export const mockUser = (overrides = {}) => ({
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  password: 'hashed-password',
  provider: 'credentials',
  providerId: null,
  image: null,
  role: 'user',
  loyaltyPoints: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const mockProduct = (overrides = {}) => ({
  id: 'product-123',
  name: 'Test Coffee',
  slug: 'test-coffee',
  description: 'A delicious test coffee',
  price: 19.99,
  image: '/images/test.jpg',
  category: 'coffee',
  inStock: true,
  stock: 100,
  stockQuantity: 100,
  lowStockAlert: 10,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const mockOrder = (overrides = {}) => ({
  id: 'order-123',
  orderNumber: 'EB-2024-000001',
  userId: 'user-123',
  guestEmail: null,
  subtotal: 19.99,
  discount: 0,
  total: 19.99,
  couponCode: null,
  pointsUsed: 0,
  pointsEarned: 20,
  status: 'pending',
  trackingStatus: null,
  trackingCarrier: null,
  trackingNumber: null,
  trackingUrl: null,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const mockReview = (overrides = {}) => ({
  id: 'review-123',
  productId: 'product-123',
  userId: 'user-123',
  rating: 5,
  comment: 'Great coffee!',
  images: [],
  verifiedPurchase: true,
  helpfulVotes: 0,
  notHelpfulVotes: 0,
  status: 'approved',
  flagged: false,
  flagReason: null,
  businessResponse: null,
  respondedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const mockCart = (overrides = {}) => ({
  id: 'cart-123',
  userId: 'user-123',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const mockCartItem = (overrides = {}) => ({
  id: 'cart-item-123',
  cartId: 'cart-123',
  productId: 'product-123',
  quantity: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});
