import { getProductsWithReviews } from "@/lib/queries";
import ProductCard from "./ProductCard";

export default async function ProductShowcase() {
  const productsWithRatings = await getProductsWithReviews();

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {productsWithRatings.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  );
}
