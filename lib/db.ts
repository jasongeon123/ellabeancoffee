// Database abstraction layer
// Uses direct SQL with @neondatabase/serverless for Vercel compatibility
import { Pool } from '@neondatabase/serverless';

// Create connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Helper to create a new pool connection
export function createPool() {
  return new Pool({ connectionString: process.env.DATABASE_URL });
}

export { pool };

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

    async update(where: { email: string; id?: string }, data: { password?: string; loyaltyPoints?: number }) {
      if (where.email) {
        if (data.password) {
          const result = await pool.query(
            'UPDATE "User" SET password = $1, "updatedAt" = NOW() WHERE email = $2 RETURNING *',
            [data.password, where.email]
          );
          return result.rows[0] || null;
        }
      }
      if (where.id && data.loyaltyPoints !== undefined) {
        const result = await pool.query(
          'UPDATE "User" SET "loyaltyPoints" = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING *',
          [data.loyaltyPoints, where.id]
        );
        return result.rows[0] || null;
      }
      return null;
    },

    async incrementLoyaltyPoints(userId: string, points: number) {
      const result = await pool.query(
        'UPDATE "User" SET "loyaltyPoints" = "loyaltyPoints" + $1, "updatedAt" = NOW() WHERE id = $2 RETURNING *',
        [points, userId]
      );
      return result.rows[0] || null;
    },

    async decrementLoyaltyPoints(userId: string, points: number) {
      const result = await pool.query(
        'UPDATE "User" SET "loyaltyPoints" = "loyaltyPoints" - $1, "updatedAt" = NOW() WHERE id = $2 RETURNING *',
        [points, userId]
      );
      return result.rows[0] || null;
    },

    async updateOAuth(data: { email: string; provider: string; providerId: string; image?: string | null; name: string }) {
      const result = await pool.query(
        'UPDATE "User" SET provider = $1, "providerId" = $2, image = $3, name = $4, "updatedAt" = NOW() WHERE email = $5 RETURNING *',
        [data.provider, data.providerId, data.image, data.name, data.email]
      );
      return result.rows[0] || null;
    },

    async count(where?: any) {
      let query = 'SELECT COUNT(*) as count FROM "User"';
      const params: any[] = [];

      if (where) {
        const conditions: string[] = [];
        let paramIndex = 1;

        if (where.role) {
          conditions.push(`role = $${paramIndex++}`);
          params.push(where.role);
        }

        if (conditions.length > 0) {
          query += ' WHERE ' + conditions.join(' AND ');
        }
      }

      const result = await pool.query(query, params);
      return parseInt(result.rows[0].count);
    },

    async groupBy(options: { by: string[]; _count?: boolean }) {
      if (options.by.includes('role')) {
        const result = await pool.query(
          'SELECT role, COUNT(*) as _count FROM "User" GROUP BY role'
        );
        return result.rows.map(row => ({ role: row.role, _count: parseInt(row._count) }));
      }
      return [];
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
  },

  // Product operations
  product: {
    async findMany(where?: any) {
      let query = 'SELECT * FROM "Product"';
      const params: any[] = [];

      if (where && where.id && where.id.in) {
        query += ` WHERE id = ANY($1::text[])`;
        params.push(where.id.in);
      } else if (where && where.inStock !== undefined) {
        query += ` WHERE "inStock" = $1`;
        params.push(where.inStock);
      }

      query += ' ORDER BY "createdAt" ASC';

      const result = await pool.query(query, params);
      return result.rows;
    },

    async findUnique(where: { id: string }) {
      const result = await pool.query('SELECT * FROM "Product" WHERE id = $1 LIMIT 1', [where.id]);
      return result.rows[0] || null;
    },

    async count(where?: any) {
      let query = 'SELECT COUNT(*) as count FROM "Product"';
      const params: any[] = [];

      if (where) {
        const conditions: string[] = [];
        let paramIndex = 1;

        if (where.inStock !== undefined) {
          conditions.push(`"inStock" = $${paramIndex++}`);
          params.push(where.inStock);
        }

        if (where.stockQuantity && where.stockQuantity.lte !== undefined) {
          conditions.push(`"stockQuantity" <= $${paramIndex++}`);
          params.push(where.stockQuantity.lte);
          if (where.stockQuantity.not !== undefined) {
            conditions.push(`"stockQuantity" IS NOT NULL`);
          }
        }

        if (conditions.length > 0) {
          query += ' WHERE ' + conditions.join(' AND ');
        }
      }

      const result = await pool.query(query, params);
      return parseInt(result.rows[0].count);
    },

    async create(data: any) {
      const fields = Object.keys(data);
      const values = Object.values(data);
      const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

      const result = await pool.query(
        `INSERT INTO "Product" (id, ${fields.map(f => `"${f}"`).join(', ')}, "createdAt", "updatedAt")
         VALUES (gen_random_uuid()::text, ${placeholders}, NOW(), NOW())
         RETURNING *`,
        values
      );
      return result.rows[0];
    },

    async update(where: { id: string }, data: any) {
      const fields = Object.keys(data);
      const values = Object.values(data);
      const setClause = fields.map((f, i) => `"${f}" = $${i + 1}`).join(', ');

      const result = await pool.query(
        `UPDATE "Product" SET ${setClause}, "updatedAt" = NOW() WHERE id = $${fields.length + 1} RETURNING *`,
        [...values, where.id]
      );
      return result.rows[0] || null;
    }
  },

  // Location operations
  location: {
    async findMany(where?: any, orderBy?: any) {
      let query = 'SELECT * FROM "Location"';
      const params: any[] = [];

      if (where && where.active !== undefined) {
        query += ' WHERE active = $1';
        params.push(where.active);
      }

      if (orderBy && orderBy.date) {
        query += ` ORDER BY date ${orderBy.date === 'asc' ? 'ASC' : 'DESC'}`;
      }

      const result = await pool.query(query, params);
      return result.rows;
    },

    async count(where?: any) {
      let query = 'SELECT COUNT(*) as count FROM "Location"';
      const params: any[] = [];

      if (where && where.active !== undefined) {
        query += ' WHERE active = $1';
        params.push(where.active);
      }

      const result = await pool.query(query, params);
      return parseInt(result.rows[0].count);
    }
  },

  // Contact submission operations
  contactSubmission: {
    async create(data: { name: string; email: string; subject: string; message: string }) {
      const result = await pool.query(
        `INSERT INTO "ContactSubmission" (id, name, email, subject, message, "createdAt")
         VALUES (gen_random_uuid()::text, $1, $2, $3, $4, NOW())
         RETURNING *`,
        [data.name, data.email, data.subject, data.message]
      );
      return result.rows[0];
    }
  },

  // Review operations
  review: {
    async count(where?: any) {
      let query = 'SELECT COUNT(*) as count FROM "Review"';
      const params: any[] = [];

      if (where) {
        const conditions: string[] = [];
        let paramIndex = 1;

        if (where.status) {
          conditions.push(`status = $${paramIndex++}`);
          params.push(where.status);
        }

        if (where.flagged !== undefined) {
          conditions.push(`flagged = $${paramIndex++}`);
          params.push(where.flagged);
        }

        if (conditions.length > 0) {
          query += ' WHERE ' + conditions.join(' AND ');
        }
      }

      const result = await pool.query(query, params);
      return parseInt(result.rows[0].count);
    }
  },

  // Analytics operations
  analytics: {
    async count() {
      const result = await pool.query('SELECT COUNT(*) as count FROM "Analytics"');
      return parseInt(result.rows[0].count);
    }
  }
};
