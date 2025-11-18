import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Pool } from "@neondatabase/serverless";

// PATCH - Update testimonial (approve/feature)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { approved, featured } = body;

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (typeof approved === "boolean") {
      updates.push(`approved = $${paramIndex++}`);
      values.push(approved);
    }
    if (typeof featured === "boolean") {
      updates.push(`featured = $${paramIndex++}`);
      values.push(featured);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 });
    }

    values.push(params.id);

    const result = await pool.query(
      `UPDATE "Testimonial" SET ${updates.join(", ")}, "updatedAt" = NOW() WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Failed to update testimonial:", error);
    return NextResponse.json(
      { error: "Failed to update testimonial" },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}

// DELETE - Delete testimonial
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await pool.query(
      `DELETE FROM "Testimonial" WHERE id = $1`,
      [params.id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete testimonial:", error);
    return NextResponse.json(
      { error: "Failed to delete testimonial" },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}
