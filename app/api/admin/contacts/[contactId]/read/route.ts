import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { contactId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { read } = await request.json();

    const contact = await prisma.contactSubmission.update({
      where: { id: params.contactId },
      data: { read },
    });

    return NextResponse.json(contact);
  } catch (error) {
    console.error("Failed to update read status:", error);
    return NextResponse.json(
      { error: "Failed to update read status" },
      { status: 500 }
    );
  }
}
