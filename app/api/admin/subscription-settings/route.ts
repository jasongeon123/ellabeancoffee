import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the first (and should be only) settings record
    let settings = await prisma.subscriptionSettings.findFirst();

    // If no settings exist, create default ones
    if (!settings) {
      settings = await prisma.subscriptionSettings.create({
        data: {
          subscriptionsEnabled: true,
          weeklyEnabled: true,
          weeklyDiscount: 10,
          biweeklyEnabled: true,
          biweeklyDiscount: 15,
          monthlyEnabled: true,
          monthlyDiscount: 20,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching subscription settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "admin") {
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
      return NextResponse.json(
        { error: "Discounts must be between 0 and 100" },
        { status: 400 }
      );
    }

    // Get or create settings
    let settings = await prisma.subscriptionSettings.findFirst();

    if (settings) {
      // Update existing settings
      settings = await prisma.subscriptionSettings.update({
        where: { id: settings.id },
        data: {
          subscriptionsEnabled,
          weeklyEnabled,
          weeklyDiscount,
          biweeklyEnabled,
          biweeklyDiscount,
          monthlyEnabled,
          monthlyDiscount,
        },
      });
    } else {
      // Create new settings
      settings = await prisma.subscriptionSettings.create({
        data: {
          subscriptionsEnabled,
          weeklyEnabled,
          weeklyDiscount,
          biweeklyEnabled,
          biweeklyDiscount,
          monthlyEnabled,
          monthlyDiscount,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating subscription settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
