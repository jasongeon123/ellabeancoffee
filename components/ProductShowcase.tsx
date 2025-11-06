import { getProductsWithReviews } from "@/lib/queries";
import ProductCard from "./ProductCard";

export default async function ProductShowcase() {
  let productsWithRatings: any[] = [];

  try {
    // Skip database query if DATABASE_URL is not available (e.g., in CI)
    if (process.env.DATABASE_URL) {
      productsWithRatings = await getProductsWithReviews();
    }
  } catch (error) {
    console.warn('Failed to fetch products with reviews:', error);
  }

  if (productsWithRatings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-coffee-600 text-lg">
          No products available at the moment. Check back soon!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {productsWithRatings.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  );
}
