import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const verifySchema = z.object({
  token: z.string().min(1, "Token is required"),
});

export async function POST(request: NextRequest) {
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
    const emailChangeRequest = await prisma.emailChangeRequest.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!emailChangeRequest) {
      return NextResponse.json(
        { error: "Invalid verification token" },
        { status: 404 }
      );
    }

    // 🔒 SECURITY: Check if token has already been used
    if (emailChangeRequest.used) {
      return NextResponse.json(
        { error: "This verification link has already been used" },
        { status: 400 }
      );
    }

    // 🔒 SECURITY: Check if token has expired
    if (new Date() > emailChangeRequest.expiresAt) {
      return NextResponse.json(
        { error: "Verification link has expired. Please request a new one." },
        { status: 410 }
      );
    }

    // 🔒 SECURITY: Double-check new email is not taken (race condition protection)
    const existingUser = await prisma.user.findUnique({
      where: { email: emailChangeRequest.newEmail },
    });

    if (existingUser && existingUser.id !== emailChangeRequest.userId) {
      return NextResponse.json(
        { error: "Email address is no longer available" },
        { status: 409 }
      );
    }

    // 🔒 SECURITY: Perform email update in a transaction for atomicity
    await prisma.$transaction([
      // Update user's email
      prisma.user.update({
        where: { id: emailChangeRequest.userId },
        data: { email: emailChangeRequest.newEmail },
      }),
      // Mark token as used (prevent reuse)
      prisma.emailChangeRequest.update({
        where: { id: emailChangeRequest.id },
        data: { used: true },
      }),
      // Delete any other pending requests for this user
      prisma.emailChangeRequest.deleteMany({
        where: {
          userId: emailChangeRequest.userId,
          used: false,
          id: { not: emailChangeRequest.id },
        },
      }),
    ]);

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
