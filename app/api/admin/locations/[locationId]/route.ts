import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Pool } from "@neondatabase/serverless";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { locationId: string } }
) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const locationId = params.locationId;

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (body.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(body.title);
    }
    if (body.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(body.description);
    }
    if (body.address !== undefined) {
      updates.push(`address = $${paramIndex++}`);
      values.push(body.address);
    }
    if (body.date !== undefined) {
      updates.push(`date = $${paramIndex++}`);
      values.push(new Date(body.date));
    }
    if (body.active !== undefined) {
      updates.push(`active = $${paramIndex++}`);
      values.push(body.active);
    }

    values.push(locationId);

    const locationResult = await pool.query(
      `UPDATE "Location" SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return NextResponse.json(locationResult.rows[0]);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update location" },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { locationId: string } }
) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const locationId = params.locationId;

    await pool.query(
      'DELETE FROM "Location" WHERE id = $1',
      [locationId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete location" },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}
