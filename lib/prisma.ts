import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const prismaClientSingleton = () => {
  // In development, use standard Prisma Client
  if (process.env.NODE_ENV === 'development') {
    return new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
  }

  // In production (Vercel), use Neon serverless adapter
  try {
    const connectionString = `${process.env.DATABASE_URL}`;
    if (!connectionString || connectionString === 'undefined') {
      console.error('[Prisma] DATABASE_URL is not set!');
      throw new Error('DATABASE_URL environment variable is required');
    }

    console.log('[Prisma] Initializing Neon adapter for production');
    const adapter = new PrismaNeon({ connectionString });

    return new PrismaClient({
      adapter,
      log: ['error', 'warn'],
    });
  } catch (error) {
    console.error('[Prisma] Failed to initialize with Neon adapter:', error);
    throw error;
  }
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
