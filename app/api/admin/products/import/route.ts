import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface ProductRow {
  id?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  category?: string;
  roastLevel?: string;
  origin?: string;
  inStock: boolean;
}

function parseCSV(csvText: string): ProductRow[] {
  const lines = csvText.split("\n").filter((line) => line.trim());
  if (lines.length < 2) {
    throw new Error("CSV file is empty or has no data rows");
  }

  const headers = lines[0].split(",").map((h) => h.trim());
  const products: ProductRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    // Parse CSV with quoted fields
    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j];
      if (char === '"') {
        if (inQuotes && lines[i][j + 1] === '"') {
          current += '"';
          j++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim()); // Push last value

    if (values.length !== headers.length) {
      throw new Error(`Row ${i + 1} has ${values.length} columns, expected ${headers.length}`);
    }

    const product: any = {};
    headers.forEach((header, index) => {
      const value = values[index];

      // Handle each field type
      if (header === "id" && value) {
        product.id = value;
      } else if (header === "price" || header === "stock") {
        product[header] = parseFloat(value);
      } else if (header === "inStock") {
        product[header] = value === "true" || value === "1";
      } else if (header === "createdAt" || header === "updatedAt") {
        // Skip timestamp fields on import
      } else {
        product[header] = value;
      }
    });

    // Validate required fields
    if (!product.name || !product.slug || !product.description || !product.image) {
      throw new Error(`Row ${i + 1} is missing required fields`);
    }

    products.push(product);
  }

  return products;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const csvText = await file.text();
    const products = parseCSV(csvText);

    const results = {
      created: 0,
      updated: 0,
      errors: [] as string[],
    };

    // Process each product
    for (const productData of products) {
      try {
        const { id, ...dataRaw } = productData;

        // Remove undefined optional fields
        const data: any = {};
        Object.keys(dataRaw).forEach(key => {
          if (dataRaw[key as keyof typeof dataRaw] !== undefined) {
            data[key] = dataRaw[key as keyof typeof dataRaw];
          }
        });

        if (id) {
          // Update existing product
          await prisma.product.update({
            where: { id },
            data,
          });
          results.updated++;
        } else {
          // Create new product
          await prisma.product.create({
            data,
          });
          results.created++;
        }
      } catch (error: any) {
        results.errors.push(`${productData.name}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Imported ${results.created + results.updated} products`,
      results,
    });
  } catch (error: any) {
    console.error("Error importing products:", error);
    return NextResponse.json(
      { error: error.message || "Failed to import products" },
      { status: 500 }
    );
  }
}
