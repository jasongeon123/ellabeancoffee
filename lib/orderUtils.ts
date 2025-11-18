import { Pool } from "@neondatabase/serverless";

/**
 * Generate a unique order number in format: EB-YYYY-NNNNNN
 * Example: EB-2024-000123
 */
export async function generateOrderNumber(): Promise<string> {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const year = new Date().getFullYear();
    const prefix = `EB-${year}-`;

    // Find the highest order number for this year
    const result = await pool.query(
      `SELECT "orderNumber" FROM "Order"
       WHERE "orderNumber" LIKE $1
       ORDER BY "orderNumber" DESC
       LIMIT 1`,
      [`${prefix}%`]
    );

    let nextNumber = 1;

    if (result.rows.length > 0) {
      // Extract the number part and increment
      const currentNumber = parseInt(result.rows[0].orderNumber.split("-")[2]);
      nextNumber = currentNumber + 1;
    }

    // Pad with zeros to 6 digits
    const paddedNumber = nextNumber.toString().padStart(6, "0");

    return `${prefix}${paddedNumber}`;
  } finally {
    await pool.end();
  }
}

/**
 * Check if user has purchased a specific product (for verified purchase badge)
 */
export async function hasUserPurchasedProduct(
  userId: string,
  productId: string
): Promise<boolean> {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const result = await pool.query(
      `SELECT o.id FROM "Order" o
       INNER JOIN "OrderItem" oi ON oi."orderId" = o.id
       WHERE o."userId" = $1
         AND o.status IN ('completed', 'shipped', 'delivered')
         AND oi."productId" = $2
       LIMIT 1`,
      [userId, productId]
    );

    return result.rows.length > 0;
  } finally {
    await pool.end();
  }
}

/**
 * Get tracking information for an order
 */
export async function getOrderTracking(orderNumber: string) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const result = await pool.query(
      `SELECT
        o.*,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', oi.id,
              'quantity', oi.quantity,
              'price', oi.price,
              'product', jsonb_build_object(
                'id', p.id,
                'name', p.name,
                'price', p.price,
                'image', p.image
              )
            )
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) as items,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', tu.id,
              'status', tu.status,
              'message', tu.message,
              'location', tu.location,
              'timestamp', tu.timestamp
            ) ORDER BY tu.timestamp DESC
          ) FILTER (WHERE tu.id IS NOT NULL),
          '[]'
        ) as "trackingUpdates",
        json_build_object(
          'name', u.name,
          'email', u.email
        ) as user
      FROM "Order" o
      LEFT JOIN "OrderItem" oi ON oi."orderId" = o.id
      LEFT JOIN "Product" p ON p.id = oi."productId"
      LEFT JOIN "TrackingUpdate" tu ON tu."orderId" = o.id
      LEFT JOIN "User" u ON u.id = o."userId"
      WHERE o."orderNumber" = $1
      GROUP BY o.id, u.name, u.email`,
      [orderNumber]
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  } finally {
    await pool.end();
  }
}

/**
 * Add a tracking update to an order
 */
export async function addTrackingUpdate(
  orderId: string,
  status: string,
  message: string,
  location?: string
) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const result = await pool.query(
      `INSERT INTO "TrackingUpdate" ("orderId", status, message, location, timestamp)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [orderId, status, message, location || null]
    );

    return result.rows[0];
  } finally {
    await pool.end();
  }
}

/**
 * Update order tracking information
 */
export async function updateOrderTracking(
  orderId: string,
  data: {
    status?: string;
    trackingStatus?: string;
    trackingCarrier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    notes?: string;
  }
) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(data.status);
    }
    if (data.trackingStatus !== undefined) {
      updates.push(`"trackingStatus" = $${paramIndex++}`);
      values.push(data.trackingStatus);
    }
    if (data.trackingCarrier !== undefined) {
      updates.push(`"trackingCarrier" = $${paramIndex++}`);
      values.push(data.trackingCarrier);
    }
    if (data.trackingNumber !== undefined) {
      updates.push(`"trackingNumber" = $${paramIndex++}`);
      values.push(data.trackingNumber);
    }
    if (data.trackingUrl !== undefined) {
      updates.push(`"trackingUrl" = $${paramIndex++}`);
      values.push(data.trackingUrl);
    }
    if (data.notes !== undefined) {
      updates.push(`notes = $${paramIndex++}`);
      values.push(data.notes);
    }

    values.push(orderId);

    const result = await pool.query(
      `UPDATE "Order" SET ${updates.join(", ")}, "updatedAt" = NOW() WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return result.rows[0];
  } finally {
    await pool.end();
  }
}
