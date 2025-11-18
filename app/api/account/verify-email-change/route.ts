import { NextRequest, NextResponse } from "next/server";
import { Pool } from "@neondatabase/serverless";
import { z } from "zod";

const verifySchema = z.object({
  token: z.string().min(1, "Token is required"),
});

export async function POST(request: NextRequest) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const body = await request.json();
    const validation = verifySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { token } = validation.data;

    // 🔒 SECURITY: Find the email change request
    const reqResult = await pool.query(
      `SELECT ecr.*, u.email as "userEmail", u.name as "userName"
       FROM "EmailChangeRequest" ecr
       JOIN "User" u ON u.id = ecr."userId"
       WHERE ecr.token = $1`,
      [token]
    );

    if (reqResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Invalid verification token" },
        { status: 404 }
      );
    }

    const emailChangeRequest = reqResult.rows[0];

    // 🔒 SECURITY: Check if token has already been used
    if (emailChangeRequest.used) {
      return NextResponse.json(
        { error: "This verification link has already been used" },
        { status: 400 }
      );
    }

    // 🔒 SECURITY: Check if token has expired
    if (new Date() > new Date(emailChangeRequest.expiresAt)) {
      return NextResponse.json(
        { error: "Verification link has expired. Please request a new one." },
        { status: 410 }
      );
    }

    // 🔒 SECURITY: Double-check new email is not taken (race condition protection)
    const existingResult = await pool.query(
      `SELECT id FROM "User" WHERE email = $1`,
      [emailChangeRequest.newEmail]
    );

    if (existingResult.rows.length > 0 && existingResult.rows[0].id !== emailChangeRequest.userId) {
      return NextResponse.json(
        { error: "Email address is no longer available" },
        { status: 409 }
      );
    }

    // 🔒 SECURITY: Perform email update in a transaction for atomicity
    await pool.query('BEGIN');

    try {
      // Update user's email
      await pool.query(
        `UPDATE "User" SET email = $1, "updatedAt" = NOW() WHERE id = $2`,
        [emailChangeRequest.newEmail, emailChangeRequest.userId]
      );

      // Mark token as used (prevent reuse)
      await pool.query(
        `UPDATE "EmailChangeRequest" SET used = true WHERE id = $1`,
        [emailChangeRequest.id]
      );

      // Delete any other pending requests for this user
      await pool.query(
        `DELETE FROM "EmailChangeRequest"
         WHERE "userId" = $1 AND used = false AND id != $2`,
        [emailChangeRequest.userId, emailChangeRequest.id]
      );

      await pool.query('COMMIT');
    } catch (err) {
      await pool.query('ROLLBACK');
      throw err;
    }

    return NextResponse.json({
      message:
        "Email changed successfully! Please sign in with your new email address.",
      newEmail: emailChangeRequest.newEmail,
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify email change" },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}

// Also support GET for when users click the link directly
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  // Forward to POST handler
  return POST(
    new NextRequest(request.url, {
      method: "POST",
      headers: request.headers,
      body: JSON.stringify({ token }),
    })
  );
}
