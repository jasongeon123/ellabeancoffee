import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const testimonialSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  rating: z.number().int().min(1, "Rating must be between 1 and 5").max(5, "Rating must be between 1 and 5"),
  comment: z.string().min(10, "Comment must be at least 10 characters").max(1000, "Comment is too long"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = testimonialSchema.parse(body);

    // Create testimonial (defaults to approved: false)
    const testimonial = await prisma.testimonial.create({
      data: {
        name: validatedData.name,
        email: validatedData.email || null,
        rating: validatedData.rating,
        comment: validatedData.comment,
      },
    });

    return NextResponse.json(
      {
        message: "Thank you for your testimonial! It will be reviewed and published soon.",
        id: testimonial.id,
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
  }
}

// Optional: GET endpoint for admin to fetch testimonials
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const approved = searchParams.get("approved");

    const where = approved === "true" ? { approved: true } : {};

    const testimonials = await prisma.testimonial.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(testimonials);
  } catch (error) {
    console.error("Failed to fetch testimonials:", error);
    return NextResponse.json(
      { error: "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}
