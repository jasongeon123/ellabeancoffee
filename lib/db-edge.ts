// Edge-compatible database client using Neon adapter
// This file should ONLY be imported from Edge Runtime routes
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool } from '@neondatabase/serverless';

export const runtime = 'edge';

let prismaEdge: PrismaClient;

export function getPrismaEdge() {
  if (!prismaEdge) {
    const connectionString = process.env.DATABASE_URL!;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaNeon(pool);

    prismaEdge = new PrismaClient({ adapter });
  }

  return prismaEdge;
}
