import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Pool } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

export async function GET() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "admin") {
      pool.end();
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the first (and should be only) settings record
    const result = await pool.query('SELECT * FROM "SubscriptionSettings" LIMIT 1');
    let settings = result.rows[0];

    // If no settings exist, create default ones
    if (!settings) {
      const createResult = await pool.query(
        `INSERT INTO "SubscriptionSettings" (id, "subscriptionsEnabled", "weeklyEnabled", "weeklyDiscount", "biweeklyEnabled", "biweeklyDiscount", "monthlyEnabled", "monthlyDiscount", "createdAt", "updatedAt")
         VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         RETURNING *`,
        [true, true, 10, true, 15, true, 20]
      );
      settings = createResult.rows[0];
    }

    pool.end();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching subscription settings:", error);
    pool.end();
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "admin") {
      pool.end();
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      subscriptionsEnabled,
      weeklyEnabled,
      weeklyDiscount,
      biweeklyEnabled,
      biweeklyDiscount,
      monthlyEnabled,
      monthlyDiscount,
    } = body;

    // Validate discounts are between 0-100
    if (
      weeklyDiscount < 0 ||
      weeklyDiscount > 100 ||
      biweeklyDiscount < 0 ||
      biweeklyDiscount > 100 ||
      monthlyDiscount < 0 ||
      monthlyDiscount > 100
    ) {
      pool.end();
      return NextResponse.json(
        { error: "Discounts must be between 0 and 100" },
        { status: 400 }
      );
    }

    // Get or create settings
    const existingResult = await pool.query('SELECT * FROM "SubscriptionSettings" LIMIT 1');
    let settings;

    if (existingResult.rows.length > 0) {
      // Update existing settings
      const updateResult = await pool.query(
        `UPDATE "SubscriptionSettings"
         SET "subscriptionsEnabled" = $1, "weeklyEnabled" = $2, "weeklyDiscount" = $3,
             "biweeklyEnabled" = $4, "biweeklyDiscount" = $5, "monthlyEnabled" = $6,
             "monthlyDiscount" = $7, "updatedAt" = NOW()
         WHERE id = $8
         RETURNING *`,
        [
          subscriptionsEnabled,
          weeklyEnabled,
          weeklyDiscount,
          biweeklyEnabled,
          biweeklyDiscount,
          monthlyEnabled,
          monthlyDiscount,
          existingResult.rows[0].id
        ]
      );
      settings = updateResult.rows[0];
    } else {
      // Create new settings
      const createResult = await pool.query(
        `INSERT INTO "SubscriptionSettings" (id, "subscriptionsEnabled", "weeklyEnabled", "weeklyDiscount", "biweeklyEnabled", "biweeklyDiscount", "monthlyEnabled", "monthlyDiscount", "createdAt", "updatedAt")
         VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         RETURNING *`,
        [
          subscriptionsEnabled,
          weeklyEnabled,
          weeklyDiscount,
          biweeklyEnabled,
          biweeklyDiscount,
          monthlyEnabled,
          monthlyDiscount
        ]
      );
      settings = createResult.rows[0];
    }

    pool.end();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating subscription settings:", error);
    pool.end();
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
