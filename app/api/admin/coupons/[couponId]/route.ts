import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH - Update coupon
export async function PATCH(
  request: NextRequest,
  { params }: { params: { couponId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      code,
      description,
      discountPercent,
      discountAmount,
      minPurchase,
      maxUses,
      expiresAt,
      active,
    } = body;

    const updateData: any = {};

    if (code !== undefined) updateData.code = code.toUpperCase();
    if (description !== undefined) updateData.description = description;
    if (discountPercent !== undefined) updateData.discountPercent = discountPercent;
    if (discountAmount !== undefined) updateData.discountAmount = discountAmount;
    if (minPurchase !== undefined) updateData.minPurchase = minPurchase;
    if (maxUses !== undefined) updateData.maxUses = maxUses;
    if (active !== undefined) updateData.active = active;
    if (expiresAt !== undefined) {
      updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;
    }

    const coupon = await prisma.coupon.update({
      where: { id: params.couponId },
      data: updateData,
    });

    return NextResponse.json(coupon);
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Coupon code already exists" },
        { status: 400 }
      );
    }
    console.error("Failed to update coupon:", error);
    return NextResponse.json(
      { error: "Failed to update coupon" },
      { status: 500 }
    );
  }
}

// DELETE - Delete coupon
export async function DELETE(
  request: NextRequest,
  { params }: { params: { couponId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.coupon.delete({
      where: { id: params.couponId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete coupon:", error);
    return NextResponse.json(
      { error: "Failed to delete coupon" },
      { status: 500 }
    );
  }
}
