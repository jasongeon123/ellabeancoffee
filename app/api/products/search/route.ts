import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json({ products: [] });
    }

    // Search products by name, description, category, origin, or tasting notes
    const products = await prisma.product.findMany({
      where: {
        AND: [
          { inStock: true },
          {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
              { category: { contains: query, mode: "insensitive" } },
              { origin: { contains: query, mode: "insensitive" } },
              { roastLevel: { contains: query, mode: "insensitive" } },
              // Search in tasting notes array (PostgreSQL specific)
              ...(query.length > 0 ? [{
                tastingNotes: {
                  hasSome: [query]
                }
              }] : [])
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        category: true,
        price: true,
        image: true,
        description: true,
      },
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ products: [] }, { status: 500 });
  }
}
