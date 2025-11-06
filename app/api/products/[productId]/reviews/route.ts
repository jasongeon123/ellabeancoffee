import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    // Only fetch approved reviews for public display
    const reviews = await prisma.review.findMany({
      where: {
        productId: params.productId,
        status: "approved", // Only show approved reviews
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        votes: userId
          ? {
              where: { userId },
              select: { helpful: true },
            }
          : false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format reviews with user vote
    const formattedReviews = reviews.map((review) => ({
      ...review,
      userVote: review.votes && review.votes.length > 0 ? review.votes[0] : null,
      votes: undefined, // Remove votes array from response
    }));

    // Calculate average rating
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;

    return NextResponse.json({
      reviews: formattedReviews,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalReviews: reviews.length,
    });
  } catch (error: any) {
    console.error("Fetch reviews error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
