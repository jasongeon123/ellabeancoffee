import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const prismaClientSingleton = () => {
  const connectionString = `${process.env.DATABASE_URL}`;

  // Use Neon adapter if connection string has pooler
  // This works both locally and on Vercel
  if (connectionString && connectionString.includes('-pooler')) {
    try {
      console.log('[Prisma] Using Neon serverless adapter');
      const adapter = new PrismaNeon({ connectionString });

      return new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });
    } catch (error) {
      console.error('[Prisma] Failed to initialize with Neon adapter:', error);
      throw error;
    }
  }

  // Fallback to standard Prisma Client (for local dev without pooler)
  console.log('[Prisma] Using standard Prisma Client');
  return new PrismaClient({
    log: ['query', 'error', 'warn'],
  });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
