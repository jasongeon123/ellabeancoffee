import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from '../route';
import { prismaMock, resetPrismaMock, mockReview } from '@/lib/test-utils/prisma-mock';
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

describe('/api/reviews/[reviewId]/flag', () => {
  beforeEach(() => {
    resetPrismaMock();
    vi.clearAllMocks();
  });

  describe('POST', () => {
    it('should return 401 when not authenticated', async () => {
      mockGetServerSession(null);

      const req = createMockRequest('http://localhost:3000/api/reviews/review-123/flag', {
        method: 'POST',
        body: { reason: 'Spam' },
      });

      const response = await POST(req, { params: { reviewId: 'review-123' } });
      const json = await getResponseJson(response);

      expect(getResponseStatus(response)).toBe(401);
      expect(json.error).toBe('Unauthorized');
    });

    it('should return 400 when reason is missing', async () => {
      const session = createMockSession('user-123');
      mockGetServerSession(session);

      const req = createMockRequest('http://localhost:3000/api/reviews/review-123/flag', {
        method: 'POST',
        body: {},
      });

      const response = await POST(req, { params: { reviewId: 'review-123' } });
      const json = await getResponseJson(response);

      expect(getResponseStatus(response)).toBe(400);
      expect(json.error).toBe('Flag reason is required');
    });

    it('should return 400 when reason is empty string', async () => {
      const session = createMockSession('user-123');
      mockGetServerSession(session);

      const req = createMockRequest('http://localhost:3000/api/reviews/review-123/flag', {
        method: 'POST',
        body: { reason: '   ' }, // whitespace only
      });

      const response = await POST(req, { params: { reviewId: 'review-123' } });
      const json = await getResponseJson(response);

      expect(getResponseStatus(response)).toBe(400);
      expect(json.error).toBe('Flag reason is required');
    });

    it('should return 404 when review not found', async () => {
      const session = createMockSession('user-123');
      mockGetServerSession(session);

      prismaMock.review.findUnique.mockResolvedValue(null);

      const req = createMockRequest('http://localhost:3000/api/reviews/nonexistent/flag', {
        method: 'POST',
        body: { reason: 'Inappropriate content' },
      });

      const response = await POST(req, { params: { reviewId: 'nonexistent' } });
      const json = await getResponseJson(response);

      expect(getResponseStatus(response)).toBe(404);
      expect(json.error).toBe('Review not found');
      expect(prismaMock.review.findUnique).toHaveBeenCalledWith({
        where: { id: 'nonexistent' },
      });
    });

    it('should return 400 when user tries to flag own review', async () => {
      const session = createMockSession('user-123');
      mockGetServerSession(session);

      const review = mockReview({
        id: 'review-123',
        userId: 'user-123', // Same as session user
      });

      prismaMock.review.findUnique.mockResolvedValue(review);

      const req = createMockRequest('http://localhost:3000/api/reviews/review-123/flag', {
        method: 'POST',
        body: { reason: 'This is spam' },
      });

      const response = await POST(req, { params: { reviewId: 'review-123' } });
      const json = await getResponseJson(response);

      expect(getResponseStatus(response)).toBe(400);
      expect(json.error).toBe('You cannot flag your own review');
    });

    it('should successfully flag a review', async () => {
      const session = createMockSession('user-123');
      mockGetServerSession(session);

      const existingReview = mockReview({
        id: 'review-456',
        userId: 'other-user',
        flagged: false,
      });

      const flaggedReview = {
        ...existingReview,
        flagged: true,
        flagReason: 'Inappropriate content',
      };

      prismaMock.review.findUnique.mockResolvedValue(existingReview);
      prismaMock.review.update.mockResolvedValue(flaggedReview);

      const req = createMockRequest('http://localhost:3000/api/reviews/review-456/flag', {
        method: 'POST',
        body: { reason: 'Inappropriate content' },
      });

      const response = await POST(req, { params: { reviewId: 'review-456' } });
      const json = await getResponseJson(response);

      expect(getResponseStatus(response)).toBe(200);
      expect(json.message).toBe('Review flagged successfully');
      expect(json.review.flagged).toBe(true);
      expect(json.review.flagReason).toBe('Inappropriate content');

      expect(prismaMock.review.update).toHaveBeenCalledWith({
        where: { id: 'review-456' },
        data: {
          flagged: true,
          flagReason: 'Inappropriate content',
        },
      });
    });

    it('should trim whitespace from reason', async () => {
      const session = createMockSession('user-123');
      mockGetServerSession(session);

      const existingReview = mockReview({
        id: 'review-456',
        userId: 'other-user',
      });

      prismaMock.review.findUnique.mockResolvedValue(existingReview);
      prismaMock.review.update.mockResolvedValue({
        ...existingReview,
        flagged: true,
        flagReason: 'Spam',
      });

      const req = createMockRequest('http://localhost:3000/api/reviews/review-456/flag', {
        method: 'POST',
        body: { reason: '   Spam   ' },
      });

      await POST(req, { params: { reviewId: 'review-456' } });

      expect(prismaMock.review.update).toHaveBeenCalledWith({
        where: { id: 'review-456' },
        data: {
          flagged: true,
          flagReason: 'Spam', // Should be trimmed
        },
      });
    });

    it('should handle database errors gracefully', async () => {
      const session = createMockSession('user-123');
      mockGetServerSession(session);

      const existingReview = mockReview({
        id: 'review-456',
        userId: 'other-user',
      });

      prismaMock.review.findUnique.mockResolvedValue(existingReview);
      prismaMock.review.update.mockRejectedValue(new Error('Database error'));

      const req = createMockRequest('http://localhost:3000/api/reviews/review-456/flag', {
        method: 'POST',
        body: { reason: 'Spam' },
      });

      const response = await POST(req, { params: { reviewId: 'review-456' } });
      const json = await getResponseJson(response);

      expect(getResponseStatus(response)).toBe(500);
      expect(json.error).toBe('Failed to flag review');
    });
  });
});
