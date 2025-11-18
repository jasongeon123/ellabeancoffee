import { NextResponse } from "next/server";
import { Pool } from "@neondatabase/serverless";
import { z } from "zod";

const testimonialSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  rating: z.number().int().min(1, "Rating must be between 1 and 5").max(5, "Rating must be between 1 and 5"),
  comment: z.string().min(10, "Comment must be at least 10 characters").max(1000, "Comment is too long"),
});

export async function POST(request: Request) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const body = await request.json();
    const validatedData = testimonialSchema.parse(body);

    // Create testimonial (defaults to approved: false)
    const result = await pool.query(
      `INSERT INTO "Testimonial" (name, email, rating, comment, approved, featured, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, false, false, NOW(), NOW())
       RETURNING *`,
      [
        validatedData.name,
        validatedData.email || null,
        validatedData.rating,
        validatedData.comment,
      ]
    );

    return NextResponse.json(
      {
        message: "Thank you for your testimonial! It will be reviewed and published soon.",
        id: result.rows[0].id,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Testimonial submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit testimonial" },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}

// Optional: GET endpoint for admin to fetch testimonials
export async function GET(request: Request) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const { searchParams } = new URL(request.url);
    const approved = searchParams.get("approved");

    let query = `SELECT * FROM "Testimonial"`;
    const values: any[] = [];

    if (approved === "true") {
      query += ` WHERE approved = $1`;
      values.push(true);
    }

    query += ` ORDER BY "createdAt" DESC`;

    const result = await pool.query(query, values);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch testimonials:", error);
    return NextResponse.json(
      { error: "Failed to fetch testimonials" },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}
