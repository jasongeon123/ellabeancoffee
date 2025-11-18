// Database abstraction layer
// Uses Prisma in development, direct SQL in production
import { Pool } from '@neondatabase/serverless';

// Create connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const db = {
  // User operations
  user: {
    async findUnique(where: { email?: string; id?: string }) {
      if (where.email) {
        const result = await pool.query('SELECT * FROM "User" WHERE email = $1 LIMIT 1', [where.email]);
        return result.rows[0] || null;
      }
      if (where.id) {
        const result = await pool.query('SELECT * FROM "User" WHERE id = $1 LIMIT 1', [where.id]);
        return result.rows[0] || null;
      }
      return null;
    },

    async create(data: { email: string; password?: string; name?: string; role?: string; provider?: string; providerId?: string; image?: string }) {
      const result = await pool.query(
        `INSERT INTO "User" (id, email, password, name, role, provider, "providerId", image, "createdAt", "updatedAt")
         VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         RETURNING *`,
        [
          data.email,
          data.password || null,
          data.name || null,
          data.role || 'user',
          data.provider || null,
          data.providerId || null,
          data.image || null
        ]
      );
      return result.rows[0];
    },

    async update(where: { email: string }, data: { password: string }) {
      const result = await pool.query(
        'UPDATE "User" SET password = $1, "updatedAt" = NOW() WHERE email = $2 RETURNING *',
        [data.password, where.email]
      );
      return result.rows[0] || null;
    },

    async updateOAuth(data: { email: string; provider: string; providerId: string; image?: string | null; name: string }) {
      const result = await pool.query(
        'UPDATE "User" SET provider = $1, "providerId" = $2, image = $3, name = $4, "updatedAt" = NOW() WHERE email = $5 RETURNING *',
        [data.provider, data.providerId, data.image, data.name, data.email]
      );
      return result.rows[0] || null;
    }
  },

  // Password reset operations
  passwordReset: {
    async create(data: { email: string; token: string; expiresAt: Date }) {
      const result = await pool.query(
        `INSERT INTO "PasswordReset" (id, email, token, "expiresAt", "createdAt")
         VALUES (gen_random_uuid()::text, $1, $2, $3, NOW())
         RETURNING *`,
        [data.email, data.token, data.expiresAt]
      );
      return result.rows[0];
    },

    async findUnique(where: { token: string }) {
      const result = await pool.query(
        'SELECT * FROM "PasswordReset" WHERE token = $1 AND used = false AND "expiresAt" > NOW() LIMIT 1',
        [where.token]
      );
      return result.rows[0] || null;
    },

    async update(where: { token: string }, data: { used: boolean }) {
      const result = await pool.query(
        'UPDATE "PasswordReset" SET used = $1 WHERE token = $2 RETURNING *',
        [data.used, where.token]
      );
      return result.rows[0] || null;
    }
  }
};
