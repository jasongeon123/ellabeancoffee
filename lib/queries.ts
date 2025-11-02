import { cache } from "react";
import { prisma } from "./prisma";

// Cache product list with reviews for the duration of the request
export const getProductsWithReviews = cache(async () => {
  const products = await prisma.product.findMany({
    where: { inStock: true },
    orderBy: { createdAt: "desc" },
    include: {
      reviews: {
        select: {
          rating: true,
        },
      },
    },
  });

  // Calculate average ratings
  return products.map((product) => {
    const reviewCount = product.reviews.length;
    const averageRating =
      reviewCount > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
        : 0;

    return {
      ...product,
      averageRating,
      reviewCount,
    };
  });
});

// Cache individual product lookup
export const getProductById = cache(async (id: string) => {
  return prisma.product.findUnique({
    where: { id },
  });
});

// Cache product reviews
export const getProductReviews = cache(async (productId: string) => {
  const reviews = await prisma.review.findMany({
    where: { productId },
  });

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  return {
    reviews,
    averageRating,
    count: reviews.length,
  };
});

// Cache all products (for admin)
export const getAllProducts = cache(async () => {
  return prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });
});

// Cache related products (same category, different product)
export const getRelatedProducts = cache(async (productId: string, category: string, limit: number = 4) => {
  return prisma.product.findMany({
    where: {
      AND: [
        { category },
        { id: { not: productId } },
        { inStock: true },
      ],
    },
    take: limit,
    orderBy: { createdAt: "desc" },
  });
});
