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
  const connectionString = `${process.env.DATABASE_URL}`;
  const adapter = new PrismaNeon({ connectionString });

  return new PrismaClient({
    adapter,
    log: ['error'],
  });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
