import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

const createPrismaClient = (): PrismaClient => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // Always use Neon adapter when pooler URL is present
  if (connectionString.includes('-pooler')) {
    console.log('[Prisma] Creating client with Neon serverless adapter');
    try {
      const adapter = new PrismaNeon({ connectionString });
      const client = new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error', 'warn'],
      });
      console.log('[Prisma] Successfully created client with Neon adapter');
      return client;
    } catch (error) {
      console.error('[Prisma] Failed to create Neon adapter:', error);
      throw error;
    }
  }

  // Fallback for local development without pooler
  console.log('[Prisma] Creating standard Prisma Client');
  return new PrismaClient({
    log: ['query', 'error', 'warn'],
  });
};

const prisma = global.prismaGlobal ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prismaGlobal = prisma;
}

export { prisma };
