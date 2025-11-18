import { NextRequest, NextResponse } from "next/server";
import { Pool } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

// Input validation functions
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

function isValidPassword(password: string): boolean {
  // Minimum 8 characters, at least one letter and one number
  return (
    password.length >= 8 &&
    password.length <= 128 &&
    /[a-zA-Z]/.test(password) &&
    /[0-9]/.test(password)
  );
}

function sanitizeString(str: string): string {
  return str.trim().slice(0, 255);
}

export async function POST(request: NextRequest) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const body = await request.json();

    // Validate request body exists
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { name, email, password } = body;

    // Validate all fields are present
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Validate and sanitize email
    const sanitizedEmail = sanitizeString(email).toLowerCase();
    if (!isValidEmail(sanitizedEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (!isValidPassword(password)) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long and contain both letters and numbers" },
        { status: 400 }
      );
    }

    // Sanitize name
    const sanitizedName = sanitizeString(name);
    if (sanitizedName.length < 1 || sanitizedName.length > 100) {
      return NextResponse.json(
        { error: "Name must be between 1 and 100 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUserResult = await pool.query(
      'SELECT * FROM "User" WHERE email = $1',
      [sanitizedEmail]
    );

    if (existingUserResult.rows.length > 0) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Hash password with higher cost factor for better security
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const userResult = await pool.query(
      'INSERT INTO "User" (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name',
      [sanitizedName, sanitizedEmail, hashedPassword, "user"]
    );

    const user = userResult.rows[0];

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}
