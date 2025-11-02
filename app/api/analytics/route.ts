import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { path, userAgent, ip } = await request.json();

    await prisma.analytics.create({
      data: {
        path,
        userAgent,
        ip,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // Silently fail - analytics shouldn't break the app
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
