import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Pool } from "@neondatabase/serverless";

export async function POST(request: NextRequest) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, address, date, active } = await request.json();

    const locationResult = await pool.query(
      'INSERT INTO "Location" (title, description, address, date, active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, description, address, new Date(date), active]
    );

    return NextResponse.json(locationResult.rows[0]);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create location" },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}
