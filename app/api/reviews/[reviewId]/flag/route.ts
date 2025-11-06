import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/reviews/[reviewId]/flag - Flag a review as inappropriate
export async function POST(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reviewId } = params;
    const body = await request.json();
    const { reason } = body;

    if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
      return NextResponse.json(
        { error: "Flag reason is required" },
        { status: 400 }
      );
    }

    // Check if review exists
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Prevent users from flagging their own reviews
    if (existingReview.userId === (session.user as any).id) {
      return NextResponse.json(
        { error: "You cannot flag your own review" },
        { status: 400 }
      );
    }

    // Update review to mark it as flagged
    const review = await prisma.review.update({
      where: { id: reviewId },
      data: {
        flagged: true,
        flagReason: reason.trim(),
      },
    });

    return NextResponse.json({
      message: "Review flagged successfully",
      review,
    });
  } catch (error) {
    console.error("Error flagging review:", error);
    return NextResponse.json(
      { error: "Failed to flag review" },
      { status: 500 }
    );
  }
}
