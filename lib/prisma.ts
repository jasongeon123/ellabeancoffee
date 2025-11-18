import { PrismaClient } from '@prisma/client';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

const prismaClientSingleton = () => {
  // In development, use standard Prisma Client
  if (process.env.NODE_ENV === 'development') {
    return new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
  }

  // In production (Vercel), use Neon serverless adapter
  // Configure WebSocket for Node.js environment
  neonConfig.webSocketConstructor = ws;

  const connectionString = `${process.env.DATABASE_URL}`;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaNeon(pool);

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
