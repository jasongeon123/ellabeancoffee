import Image from "next/image";
import Link from "next/link";
import { getRelatedProducts } from "@/lib/queries";

export default async function RelatedProducts({
  productId,
  category,
}: {
  productId: string;
  category: string;
}) {
  const relatedProducts = await getRelatedProducts(productId, category);

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="mt-16 border-t border-coffee-200 pt-16">
      <h2 className="text-3xl sm:text-4xl font-light text-coffee-900 mb-8 tracking-tight">
        You May Also Like
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-coffee-100"
          >
            <div className="relative aspect-square bg-gradient-to-br from-coffee-50 to-coffee-100">
              <Image
                src={product.image}
                alt={`${product.name} - ${product.category} coffee`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-4">
              <span className="inline-block px-2 py-1 bg-coffee-100 text-coffee-700 text-xs uppercase tracking-wider font-medium rounded-full mb-2">
                {product.category}
              </span>
              <h3 className="text-lg font-light text-coffee-900 mb-2 group-hover:text-coffee-700 transition-colors">
                {product.name}
              </h3>
              <p className="text-coffee-600 text-sm font-light line-clamp-2 mb-3">
                {product.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-light text-coffee-900">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-xs text-green-600 font-light">In Stock</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
