import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Pool } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "admin") {
      pool.end();
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all products
    const result = await pool.query(
      'SELECT * FROM "Product" ORDER BY "createdAt" ASC'
    );
    const products = result.rows;

    // Create CSV header
    const headers = [
      "id",
      "name",
      "slug",
      "description",
      "price",
      "stock",
      "image",
      "category",
      "roastLevel",
      "origin",
      "inStock",
      "createdAt",
      "updatedAt",
    ];

    // Create CSV rows
    const csvRows = [
      headers.join(","), // Header row
      ...products.map((product) =>
        [
          product.id,
          `"${product.name.replace(/"/g, '""')}"`, // Escape quotes
          product.slug || "",
          `"${product.description.replace(/"/g, '""')}"`,
          product.price,
          product.stock,
          product.image,
          product.category || "",
          product.roastLevel || "",
          product.origin || "",
          product.inStock,
          product.createdAt.toISOString(),
          product.updatedAt.toISOString(),
        ].join(",")
      ),
    ];

    const csv = csvRows.join("\n");

    pool.end();

    // Return CSV with proper headers
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="products-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting products:", error);
    pool.end();
    return NextResponse.json(
      { error: "Failed to export products" },
      { status: 500 }
    );
  }
}
