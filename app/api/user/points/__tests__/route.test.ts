import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from '../route';
import { prismaMock, resetPrismaMock, mockUser } from '@/lib/test-utils/prisma-mock';
import {
  createMockRequest,
  createMockSession,
  mockGetServerSession,
  getResponseJson,
  getResponseStatus,
} from '@/lib/test-utils/api-test-helpers';

// Mock next-auth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

describe('/api/user/points', () => {
  beforeEach(() => {
    resetPrismaMock();
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('should return 401 when not authenticated', async () => {
      mockGetServerSession(null);

      const req = createMockRequest('http://localhost:3000/api/user/points', {
        method: 'GET',
      });

      const response = await GET(req);
      const json = await getResponseJson(response);

      expect(getResponseStatus(response)).toBe(401);
      expect(json.error).toBe('Unauthorized');
    });

    it('should return 404 when user not found', async () => {
      const session = createMockSession('user-123');
      mockGetServerSession(session);

      prismaMock.user.findUnique.mockResolvedValue(null);

      const req = createMockRequest('http://localhost:3000/api/user/points', {
        method: 'GET',
      });

      const response = await GET(req);
      const json = await getResponseJson(response);

      expect(getResponseStatus(response)).toBe(404);
      expect(json.error).toBe('User not found');
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        select: { loyaltyPoints: true },
      });
    });

    it('should return user points when authenticated', async () => {
      const session = createMockSession('user-123');
      mockGetServerSession(session);

      const user = mockUser({ id: 'user-123', loyaltyPoints: 500 });
      prismaMock.user.findUnique.mockResolvedValue(user);

      const req = createMockRequest('http://localhost:3000/api/user/points', {
        method: 'GET',
      });

      const response = await GET(req);
      const json = await getResponseJson(response);

      expect(getResponseStatus(response)).toBe(200);
      expect(json).toEqual({ points: 500 });
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        select: { loyaltyPoints: true },
      });
    });

    it('should return 0 points for new user', async () => {
      const session = createMockSession('new-user');
      mockGetServerSession(session);

      const user = mockUser({ id: 'new-user', loyaltyPoints: 0 });
      prismaMock.user.findUnique.mockResolvedValue(user);

      const req = createMockRequest('http://localhost:3000/api/user/points', {
        method: 'GET',
      });

      const response = await GET(req);
      const json = await getResponseJson(response);

      expect(getResponseStatus(response)).toBe(200);
      expect(json).toEqual({ points: 0 });
    });

    it('should handle database errors gracefully', async () => {
      const session = createMockSession('user-123');
      mockGetServerSession(session);

      prismaMock.user.findUnique.mockRejectedValue(new Error('Database error'));

      const req = createMockRequest('http://localhost:3000/api/user/points', {
        method: 'GET',
      });

      const response = await GET(req);
      const json = await getResponseJson(response);

      expect(getResponseStatus(response)).toBe(500);
      expect(json.error).toBe('Failed to fetch user points');
    });
  });
});
