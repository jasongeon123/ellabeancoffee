import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Pool } from '@neondatabase/serverless';
import bcrypt from "bcryptjs";
import { z } from "zod";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
});

export async function POST(request: NextRequest) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      await pool.end();
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = passwordSchema.safeParse(body);

    if (!validation.success) {
      await pool.end();
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword, confirmPassword } = validation.data;

    // Check if new passwords match
    if (newPassword !== confirmPassword) {
      await pool.end();
      return NextResponse.json(
        { error: "New passwords do not match" },
        { status: 400 }
      );
    }

    // Get user from database
    const result = await pool.query(
      `SELECT * FROM "User" WHERE email = $1`,
      [session.user.email]
    );

    if (result.rows.length === 0) {
      await pool.end();
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const user = result.rows[0];

    // Check if user has a password (OAuth users don't)
    if (!user.password) {
      await pool.end();
      return NextResponse.json(
        { error: "Cannot change password for OAuth accounts" },
        { status: 400 }
      );
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      await pool.end();
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      `UPDATE "User" SET password = $1, "updatedAt" = NOW() WHERE email = $2`,
      [hashedPassword, session.user.email]
    );

    await pool.end();
    return NextResponse.json(
      { message: "Password changed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Password change error:", error);
    await pool.end();
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
}
