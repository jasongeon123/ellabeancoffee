import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Get a specific return request
export async function GET(
  request: NextRequest,
  { params }: { params: { returnId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const returnRequest = await prisma.return.findUnique({
      where: { id: params.returnId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!returnRequest) {
      return NextResponse.json(
        { error: "Return request not found" },
        { status: 404 }
      );
    }

    // Get the order details
    const order = await prisma.order.findFirst({
      where: { orderNumber: returnRequest.orderNumber },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json({ return: returnRequest, order });
  } catch (error: any) {
    console.error("Failed to fetch return request:", error);
    return NextResponse.json(
      { error: "Failed to fetch return request" },
      { status: 500 }
    );
  }
}

// Update return request status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { returnId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status, adminNotes, refundAmount } = await request.json();

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }

    if (refundAmount !== undefined) {
      updateData.refundAmount = refundAmount;
    }

    const returnRequest = await prisma.return.update({
      where: { id: params.returnId },
      data: updateData,
    });

    return NextResponse.json({ return: returnRequest });
  } catch (error: any) {
    console.error("Failed to update return request:", error);
    return NextResponse.json(
      { error: "Failed to update return request" },
      { status: 500 }
    );
  }
}
