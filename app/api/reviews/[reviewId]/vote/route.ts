import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { helpful } = body;

    if (typeof helpful !== "boolean") {
      return NextResponse.json(
        { error: "Invalid vote type" },
        { status: 400 }
      );
    }

    // Check if user already voted
    const existingVote = await prisma.reviewVote.findUnique({
      where: {
        reviewId_userId: {
          reviewId: params.reviewId,
          userId,
        },
      },
    });

    if (existingVote) {
      // User already voted, update their vote if different
      if (existingVote.helpful === helpful) {
        // Same vote - remove it (toggle off)
        await prisma.$transaction([
          prisma.reviewVote.delete({
            where: { id: existingVote.id },
          }),
          prisma.review.update({
            where: { id: params.reviewId },
            data: {
              [helpful ? "helpfulVotes" : "notHelpfulVotes"]: {
                decrement: 1,
              },
            },
          }),
        ]);

        return NextResponse.json({ success: true, action: "removed" });
      } else {
        // Different vote - update it
        await prisma.$transaction([
          prisma.reviewVote.update({
            where: { id: existingVote.id },
            data: { helpful },
          }),
          prisma.review.update({
            where: { id: params.reviewId },
            data: {
              helpfulVotes: {
                [helpful ? "increment" : "decrement"]: 1,
              },
              notHelpfulVotes: {
                [helpful ? "decrement" : "increment"]: 1,
              },
            },
          }),
        ]);

        return NextResponse.json({ success: true, action: "updated" });
      }
    }

    // No existing vote - create new one
    await prisma.$transaction([
      prisma.reviewVote.create({
        data: {
          reviewId: params.reviewId,
          userId,
          helpful,
        },
      }),
      prisma.review.update({
        where: { id: params.reviewId },
        data: {
          [helpful ? "helpfulVotes" : "notHelpfulVotes"]: {
            increment: 1,
          },
        },
      }),
    ]);

    return NextResponse.json({ success: true, action: "created" });
  } catch (error) {
    console.error("Failed to vote on review:", error);
    return NextResponse.json(
      { error: "Failed to vote on review" },
      { status: 500 }
    );
  }
}
