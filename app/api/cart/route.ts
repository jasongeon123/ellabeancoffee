import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Pool } from "@neondatabase/serverless";

export async function GET() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Get cart with items and products
    const cartResult = await pool.query(
      'SELECT * FROM "Cart" WHERE "userId" = $1',
      [userId]
    );

    if (cartResult.rows.length === 0) {
      return NextResponse.json({ items: [] });
    }

    const cart = cartResult.rows[0];

    // Get cart items with products
    const itemsResult = await pool.query(
      `SELECT ci.*, p.*
       FROM "CartItem" ci
       JOIN "Product" p ON ci."productId" = p.id
       WHERE ci."cartId" = $1`,
      [cart.id]
    );

    const items = itemsResult.rows.map(row => ({
      id: row.id,
      quantity: row.quantity,
      cartId: row.cartId,
      productId: row.productId,
      product: {
        id: row.productId,
        name: row.name,
        description: row.description,
        price: row.price,
        image: row.image,
        category: row.category,
        inStock: row.inStock,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }
    }));

    return NextResponse.json({ ...cart, items });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  } finally {
    await pool.end();
  }
}

export async function POST(request: NextRequest) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { productId } = await request.json();

    // Get or create cart
    let cartResult = await pool.query(
      'SELECT * FROM "Cart" WHERE "userId" = $1',
      [userId]
    );

    let cart;
    if (cartResult.rows.length === 0) {
      const newCartResult = await pool.query(
        'INSERT INTO "Cart" ("userId") VALUES ($1) RETURNING *',
        [userId]
      );
      cart = newCartResult.rows[0];
    } else {
      cart = cartResult.rows[0];
    }

    // Check if item already in cart
    const existingItemResult = await pool.query(
      'SELECT * FROM "CartItem" WHERE "cartId" = $1 AND "productId" = $2',
      [cart.id, productId]
    );

    if (existingItemResult.rows.length > 0) {
      // Update quantity
      const existingItem = existingItemResult.rows[0];
      await pool.query(
        'UPDATE "CartItem" SET quantity = $1 WHERE id = $2',
        [existingItem.quantity + 1, existingItem.id]
      );
    } else {
      // Add new item
      await pool.query(
        'INSERT INTO "CartItem" ("cartId", "productId", quantity) VALUES ($1, $2, $3)',
        [cart.id, productId, 1]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 });
  } finally {
    await pool.end();
  }
}
