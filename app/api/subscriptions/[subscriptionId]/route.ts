import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Pool } from '@neondatabase/serverless';

// GET - Fetch a specific subscription
export async function GET(
  request: NextRequest,
  { params }: { params: { subscriptionId: string } }
) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      await pool.end();
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const result = await pool.query(
      `SELECT
        s.*,
        json_build_object(
          'id', p.id,
          'name', p.name,
          'description', p.description,
          'price', p.price,
          'category', p.category,
          'image', p.image,
          'inStock', p."inStock",
          'stock', p.stock,
          'roastLevel', p."roastLevel",
          'origin', p.origin,
          'tastingNotes', p."tastingNotes",
          'brewingMethods', p."brewingMethods",
          'createdAt', p."createdAt",
          'updatedAt', p."updatedAt"
        ) as product
      FROM "Subscription" s
      LEFT JOIN "Product" p ON s."productId" = p.id
      WHERE s.id = $1 AND s."userId" = $2`,
      [params.subscriptionId, userId]
    );

    if (result.rows.length === 0) {
      await pool.end();
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    const subscription = result.rows[0];
    await pool.end();
    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Failed to fetch subscription:", error);
    await pool.end();
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}

// PATCH - Update a subscription
export async function PATCH(
  request: NextRequest,
  { params }: { params: { subscriptionId: string } }
) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      await pool.end();
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { quantity, frequency, status, nextDeliveryDate } = body;

    // Verify subscription exists and belongs to user
    const existingResult = await pool.query(
      `SELECT * FROM "Subscription" WHERE id = $1 AND "userId" = $2`,
      [params.subscriptionId, userId]
    );

    if (existingResult.rows.length === 0) {
      await pool.end();
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    // Build update data
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (quantity !== undefined) {
      if (quantity < 1) {
        await pool.end();
        return NextResponse.json(
          { error: "Quantity must be at least 1" },
          { status: 400 }
        );
      }
      updates.push(`quantity = $${paramCount++}`);
      values.push(quantity);
    }

    if (frequency !== undefined) {
      if (!["weekly", "bi-weekly", "monthly"].includes(frequency)) {
        await pool.end();
        return NextResponse.json(
          { error: "Invalid frequency" },
          { status: 400 }
        );
      }
      updates.push(`frequency = $${paramCount++}`);
      values.push(frequency);

      // Update discount based on new frequency
      let discount = 0;
      if (frequency === "weekly") {
        discount = 15;
      } else if (frequency === "bi-weekly") {
        discount = 12;
      } else if (frequency === "monthly") {
        discount = 10;
      }
      updates.push(`discount = $${paramCount++}`);
      values.push(discount);

      // Recalculate next delivery if frequency changed and no explicit nextDeliveryDate
      if (!nextDeliveryDate) {
        const newNextDeliveryDate = new Date();
        if (frequency === "weekly") {
          newNextDeliveryDate.setDate(newNextDeliveryDate.getDate() + 7);
        } else if (frequency === "bi-weekly") {
          newNextDeliveryDate.setDate(newNextDeliveryDate.getDate() + 14);
        } else if (frequency === "monthly") {
          newNextDeliveryDate.setMonth(newNextDeliveryDate.getMonth() + 1);
        }
        updates.push(`"nextDeliveryDate" = $${paramCount++}`);
        values.push(newNextDeliveryDate);
      }
    }

    if (status !== undefined) {
      if (!["active", "paused", "cancelled"].includes(status)) {
        await pool.end();
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }

    if (nextDeliveryDate !== undefined) {
      updates.push(`"nextDeliveryDate" = $${paramCount++}`);
      values.push(new Date(nextDeliveryDate));
    }

    // Add updatedAt
    updates.push(`"updatedAt" = NOW()`);

    // Update subscription
    values.push(params.subscriptionId);
    await pool.query(
      `UPDATE "Subscription" SET ${updates.join(', ')} WHERE id = $${paramCount}`,
      values
    );

    // Fetch updated subscription with product
    const result = await pool.query(
      `SELECT
        s.*,
        json_build_object(
          'id', p.id,
          'name', p.name,
          'description', p.description,
          'price', p.price,
          'category', p.category,
          'image', p.image,
          'inStock', p."inStock",
          'stock', p.stock,
          'roastLevel', p."roastLevel",
          'origin', p.origin,
          'tastingNotes', p."tastingNotes",
          'brewingMethods', p."brewingMethods",
          'createdAt', p."createdAt",
          'updatedAt', p."updatedAt"
        ) as product
      FROM "Subscription" s
      LEFT JOIN "Product" p ON s."productId" = p.id
      WHERE s.id = $1`,
      [params.subscriptionId]
    );

    const subscription = result.rows[0];
    await pool.end();
    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Failed to update subscription:", error);
    await pool.end();
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}

// DELETE - Cancel a subscription
export async function DELETE(
  request: NextRequest,
  { params }: { params: { subscriptionId: string } }
) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      await pool.end();
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Verify subscription exists and belongs to user
    const existingResult = await pool.query(
      `SELECT * FROM "Subscription" WHERE id = $1 AND "userId" = $2`,
      [params.subscriptionId, userId]
    );

    if (existingResult.rows.length === 0) {
      await pool.end();
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    // Instead of deleting, mark as cancelled (soft delete)
    await pool.query(
      `UPDATE "Subscription" SET status = $1, "updatedAt" = NOW() WHERE id = $2`,
      ["cancelled", params.subscriptionId]
    );

    // Fetch updated subscription with product
    const result = await pool.query(
      `SELECT
        s.*,
        json_build_object(
          'id', p.id,
          'name', p.name,
          'description', p.description,
          'price', p.price,
          'category', p.category,
          'image', p.image,
          'inStock', p."inStock",
          'stock', p.stock,
          'roastLevel', p."roastLevel",
          'origin', p.origin,
          'tastingNotes', p."tastingNotes",
          'brewingMethods', p."brewingMethods",
          'createdAt', p."createdAt",
          'updatedAt', p."updatedAt"
        ) as product
      FROM "Subscription" s
      LEFT JOIN "Product" p ON s."productId" = p.id
      WHERE s.id = $1`,
      [params.subscriptionId]
    );

    const subscription = result.rows[0];
    await pool.end();
    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Failed to cancel subscription:", error);
    await pool.end();
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
