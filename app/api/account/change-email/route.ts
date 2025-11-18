import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Pool } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { randomBytes } from "crypto";
import {
  sendEmailChangeVerification,
  sendEmailChangeNotification,
} from "@/lib/email";

const emailChangeSchema = z.object({
  newEmail: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: NextRequest) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = emailChangeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { newEmail, password } = validation.data;

    // Get user from database
    const userResult = await pool.query(
      `SELECT * FROM "User" WHERE email = $1`,
      [session.user.email]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = userResult.rows[0];

    // 🔒 SECURITY: Prevent OAuth users from changing email
    // OAuth users don't have passwords and their email is tied to the provider
    if (user.provider === "google" || !user.password) {
      return NextResponse.json(
        {
          error:
            "Cannot change email for OAuth accounts. Please contact support.",
        },
        { status: 403 }
      );
    }

    // 🔒 SECURITY: Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    // Check if new email is same as current
    if (newEmail.toLowerCase() === user.email.toLowerCase()) {
      return NextResponse.json(
        { error: "New email is the same as current email" },
        { status: 400 }
      );
    }

    // Check if new email is already in use
    const existingResult = await pool.query(
      `SELECT id FROM "User" WHERE email = $1`,
      [newEmail]
    );

    if (existingResult.rows.length > 0) {
      return NextResponse.json(
        { error: "Email address already in use" },
        { status: 409 }
      );
    }

    // 🔒 SECURITY: Check for pending requests (prevent spam)
    const recentResult = await pool.query(
      `SELECT id FROM "EmailChangeRequest"
       WHERE "userId" = $1 AND "createdAt" >= $2`,
      [user.id, new Date(Date.now() - 5 * 60 * 1000)]
    );

    if (recentResult.rows.length > 0) {
      return NextResponse.json(
        {
          error:
            "Please wait a few minutes before requesting another email change",
        },
        { status: 429 }
      );
    }

    // 🔒 SECURITY: Generate secure random token (32 bytes = 256 bits)
    const token = randomBytes(32).toString("hex");

    // 🔒 SECURITY: Token expires in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Delete any existing unused tokens for this user
    await pool.query(
      `DELETE FROM "EmailChangeRequest" WHERE "userId" = $1 AND used = false`,
      [user.id]
    );

    // Create new email change request
    await pool.query(
      `INSERT INTO "EmailChangeRequest" ("userId", "oldEmail", "newEmail", token, "expiresAt", "createdAt")
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [user.id, user.email, newEmail.toLowerCase(), token, expiresAt]
    );

    // 🔒 SECURITY: Send verification email to NEW email
    const verificationResult = await sendEmailChangeVerification(
      newEmail,
      token,
      user.name
    );

    // 🔒 SECURITY: Send notification to OLD email (security alert)
    const notificationResult = await sendEmailChangeNotification(
      user.email,
      newEmail,
      user.name
    );

    if (!verificationResult.success) {
      console.error("Failed to send verification email");
    }

    if (!notificationResult.success) {
      console.error("Failed to send notification email");
    }

    return NextResponse.json({
      message:
        "Verification email sent. Please check your new email inbox and click the verification link.",
    });
  } catch (error) {
    console.error("Email change initiation error:", error);
    return NextResponse.json(
      { error: "Failed to initiate email change" },
      { status: 500 }
    );
  }
}
