import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { couponId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { active } = await request.json();

    const coupon = await prisma.coupon.update({
      where: { id: params.couponId },
      data: { active },
    });

    return NextResponse.json(coupon);
  } catch (error) {
    console.error("Failed to toggle coupon:", error);
    return NextResponse.json(
      { error: "Failed to toggle coupon" },
      { status: 500 }
    );
  }
}
