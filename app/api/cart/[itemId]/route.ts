import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Pool } from "@neondatabase/serverless";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { quantity } = await request.json();
    const { itemId } = await params;

    await pool.query(
      'UPDATE "CartItem" SET quantity = $1 WHERE id = $2',
      [quantity, itemId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemId } = await params;

    await pool.query(
      'DELETE FROM "CartItem" WHERE id = $1',
      [itemId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}
