import { NextRequest, NextResponse } from "next/server";
import { Pool } from "@neondatabase/serverless";

export async function POST(request: NextRequest) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const { path, userAgent, ip } = await request.json();

    await pool.query(
      'INSERT INTO "Analytics" (path, "userAgent", ip) VALUES ($1, $2, $3)',
      [path, userAgent, ip]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    // Silently fail - analytics shouldn't break the app
    return NextResponse.json({ success: false }, { status: 200 });
  } finally {
    await pool.end();
  }
}
