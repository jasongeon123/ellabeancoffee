import { createRequest, createResponse } from 'node-mocks-http';
import type { NextRequest } from 'next/server';

export interface MockRequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  cookies?: Record<string, string>;
  query?: Record<string, string>;
  params?: Record<string, string>;
}

/**
 * Create a mock NextRequest for testing API routes
 */
export function createMockRequest(
  url: string,
  options: MockRequestOptions = {}
): NextRequest {
  const {
    method = 'GET',
    headers = {},
    body,
    cookies = {},
    query = {},
  } = options;

  const queryString = new URLSearchParams(query).toString();
  const fullUrl = queryString ? `${url}?${queryString}` : url;

  const request = new Request(fullUrl, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  }) as unknown as NextRequest;

  // Mock cookies
  Object.defineProperty(request, 'cookies', {
    value: {
      get: (name: string) => cookies[name],
      getAll: () => Object.entries(cookies).map(([name, value]) => ({ name, value })),
      has: (name: string) => name in cookies,
    },
  });

  return request;
}

/**
 * Create mock session for authenticated requests
 */
export function createMockSession(userId: string, role: string = 'user') {
  return {
    user: {
      id: userId,
      email: `${userId}@test.com`,
      name: 'Test User',
      role,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

/**
 * Mock NextAuth getServerSession
 */
export function mockGetServerSession(session: any = null) {
  // Import and mock directly
  return vi.fn().mockResolvedValue(session);
}

/**
 * Extract JSON from NextResponse
 */
export async function getResponseJson(response: Response) {
  return await response.json();
}

/**
 * Extract status from NextResponse
 */
export function getResponseStatus(response: Response) {
  return response.status;
}
