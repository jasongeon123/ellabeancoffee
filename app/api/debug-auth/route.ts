import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    console.log("=== DEBUG AUTH REQUEST ===");
    console.log("Email:", email);
    console.log("Password received:", password ? "YES" : "NO");
    console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
    console.log("NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET ? "SET" : "NOT SET");
    console.log("DATABASE_URL:", process.env.DATABASE_URL ? "SET" : "NOT SET");

    // Try to find user
    const user = await db.user.findUnique({ email });

    console.log("User found:", user ? "YES" : "NO");
    if (user) {
      console.log("User email:", user.email);
      console.log("User role:", user.role);
      console.log("User has password:", user.password ? "YES" : "NO");

      if (user.password && password) {
        const isValid = await bcrypt.compare(password, user.password);
        console.log("Password valid:", isValid ? "YES" : "NO");

        return NextResponse.json({
          success: true,
          userFound: true,
          hasPassword: true,
          passwordValid: isValid,
          env: {
            nextauthUrl: process.env.NEXTAUTH_URL,
            nextauthSecretSet: !!process.env.NEXTAUTH_SECRET,
            databaseUrlSet: !!process.env.DATABASE_URL,
          }
        });
      }
    }

    return NextResponse.json({
      success: false,
      userFound: !!user,
      hasPassword: user?.password ? true : false,
      env: {
        nextauthUrl: process.env.NEXTAUTH_URL,
        nextauthSecretSet: !!process.env.NEXTAUTH_SECRET,
        databaseUrlSet: !!process.env.DATABASE_URL,
      }
    });

  } catch (error: any) {
    console.error("Debug auth error:", error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
