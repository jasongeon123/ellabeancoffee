import { getProductById, getProductReviews, getAllProducts } from "@/lib/queries";
import Image from "next/image";
import { notFound } from "next/navigation";
import ProductReviews from "@/components/ProductReviews";
import AddToCartButton from "@/components/AddToCartButton";
import RelatedProducts from "@/components/RelatedProducts";
import SubscribeOption from "@/components/SubscribeOption";
import StickyAddToCart from "@/components/StickyAddToCart";
import SocialProof from "@/components/SocialProof";
import Link from "next/link";
import type { Metadata } from "next";

// Generate static paths for all products at build time
export async function generateStaticParams() {
  try {
    // Skip static generation if DATABASE_URL is not available (e.g., in CI)
    if (!process.env.DATABASE_URL) {
      return [];
    }
    const products = await getAllProducts();
    return products.map((product) => ({
      id: product.id,
    }));
  } catch (error) {
    console.warn('Failed to generate static params for products:', error);
    return [];
  }
}

// Generate dynamic metadata for each product page
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const product = await getProductById(params.id);

    if (!product) {
      return {
        title: "Product Not Found - Ella Bean Coffee",
      };
    }

    const { reviews, averageRating } = await getProductReviews(params.id);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ellabeancoffee.com';
  const productUrl = `${baseUrl}/products/${product.id}`;

  return {
    title: `${product.name} - Premium Coffee | Ella Bean Coffee`,
    description: `${product.description} | ${product.category} coffee available for $${product.price.toFixed(2)}. ${reviews.length > 0 ? `Rated ${averageRating.toFixed(1)}/5 stars by ${reviews.length} customers.` : 'Shop now at Ella Bean Coffee.'}`,
    keywords: [
      product.name,
      product.category,
      'specialty coffee',
      'premium coffee',
      'artisan coffee',
      'coffee beans',
      'Ella Bean Coffee',
    ],
    authors: [{ name: 'Ella Bean Coffee' }],
    openGraph: {
      title: `${product.name} | Ella Bean Coffee`,
      description: product.description,
      url: productUrl,
      siteName: 'Ella Bean Coffee',
      images: [
        {
          url: product.image,
          width: 1200,
          height: 1200,
          alt: `${product.name} - ${product.category} coffee`,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | Ella Bean Coffee`,
      description: product.description,
      images: [product.image],
    },
    alternates: {
      canonical: productUrl,
    },
  };
  } catch (error) {
    console.warn('Failed to generate metadata for product:', error);
    return {
      title: "Product - Ella Bean Coffee",
    };
  }
}

// Enable ISR (Incremental Static Regeneration) - revalidate every hour
export const revalidate = 3600;

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id);

  if (!product) {
    notFound();
  }

  // Get review stats (cached)
  const { reviews, averageRating } = await getProductReviews(params.id);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ellabeancoffee.com';

  // JSON-LD structured data for Product
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.image,
    description: product.description,
    brand: {
      '@type': 'Brand',
      name: 'Ella Bean Coffee',
    },
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/products/${product.id}`,
      priceCurrency: 'USD',
      price: product.price.toFixed(2),
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Ella Bean Coffee',
      },
    },
    ...(reviews.length > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: averageRating.toFixed(1),
        reviewCount: reviews.length,
        bestRating: '5',
        worstRating: '1',
      },
    }),
  };

  // Breadcrumb JSON-LD
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Products',
        item: `${baseUrl}/#products`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: `${baseUrl}/products/${product.id}`,
      },
    ],
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-coffee-100 to-coffee-50 py-12 sm:py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-2 text-sm font-light">
            <li>
              <Link
                href="/"
                className="text-coffee-600 hover:text-coffee-900 transition-colors"
              >
                Home
              </Link>
            </li>
            <li className="text-coffee-400">/</li>
            <li>
              <Link
                href="/#products"
                className="text-coffee-600 hover:text-coffee-900 transition-colors"
              >
                Products
              </Link>
            </li>
            <li className="text-coffee-400">/</li>
            <li className="text-coffee-900 font-medium" aria-current="page">
              {product.name}
            </li>
          </ol>
        </nav>

        {/* Product Details */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Product Image */}
          <div className="relative aspect-square bg-gradient-to-br from-coffee-50 to-coffee-100 rounded-2xl overflow-hidden shadow-xl">
            <Image src={product.image} alt={product.name} fill className="object-cover" />
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-coffee-900 text-white text-xs uppercase tracking-wider font-medium rounded-full mb-4">
                {product.category}
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-light text-coffee-900 mb-4 tracking-tight">
                {product.name}
              </h1>

              {/* Rating Summary */}
              {reviews.length > 0 && (
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="text-xl">
                        {star <= Math.round(averageRating) ? (
                          <span className="text-amber-500">★</span>
                        ) : (
                          <span className="text-coffee-300">☆</span>
                        )}
                      </span>
                    ))}
                  </div>
                  <span className="text-coffee-600 font-light">
                    {averageRating.toFixed(1)} ({reviews.length} reviews)
                  </span>
                </div>
              )}

              <p className="text-xl sm:text-2xl text-coffee-600 font-light leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Coffee Details */}
              {(product.roastLevel || product.origin || (product.tastingNotes && product.tastingNotes.length > 0) || (product.brewingMethods && product.brewingMethods.length > 0)) && (
                <div className="bg-white rounded-xl border border-coffee-200 p-6 mb-6 shadow-sm">
                  <h3 className="text-lg font-medium text-coffee-900 mb-4">Coffee Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {product.roastLevel && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-coffee-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                          </svg>
                          <span className="text-sm font-medium text-coffee-900">Roast Level</span>
                        </div>
                        <p className="text-coffee-700 pl-7">{product.roastLevel}</p>
                      </div>
                    )}

                    {product.origin && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-coffee-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm font-medium text-coffee-900">Origin</span>
                        </div>
                        <p className="text-coffee-700 pl-7">{product.origin}</p>
                      </div>
                    )}

                    {product.tastingNotes && product.tastingNotes.length > 0 && (
                      <div className="sm:col-span-2">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-coffee-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                          </svg>
                          <span className="text-sm font-medium text-coffee-900">Tasting Notes</span>
                        </div>
                        <div className="flex flex-wrap gap-2 pl-7">
                          {product.tastingNotes.map((note: string, index: number) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-amber-50 text-amber-900 text-sm rounded-full border border-amber-200"
                            >
                              {note}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {product.brewingMethods && product.brewingMethods.length > 0 && (
                      <div className="sm:col-span-2">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-coffee-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg>
                          <span className="text-sm font-medium text-coffee-900">Recommended Brewing Methods</span>
                        </div>
                        <div className="flex flex-wrap gap-2 pl-7">
                          {product.brewingMethods.map((method: string, index: number) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-coffee-50 text-coffee-900 text-sm rounded-full border border-coffee-200"
                            >
                              {method}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-5xl font-light text-coffee-900">${product.price.toFixed(2)}</span>
                {product.inStock ? (
                  <span className="text-green-600 font-light">In Stock</span>
                ) : (
                  <span className="text-red-600 font-light">Out of Stock</span>
                )}
              </div>

              {/* Social Proof */}
              <SocialProof productId={product.id} productName={product.name} />
            </div>

            {/* Subscribe & Save */}
            {product.inStock && (
              <SubscribeOption productId={product.id} productPrice={product.price} />
            )}

            {/* Divider */}
            {product.inStock && (
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-coffee-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-coffee-50 px-4 text-coffee-600 font-light">or</span>
                </div>
              </div>
            )}

            {/* Add to Cart */}
            <div className="mt-auto">
              {product.inStock ? (
                <AddToCartButton productId={product.id} />
              ) : (
                <button
                  disabled
                  className="w-full bg-coffee-300 text-white py-4 rounded-full cursor-not-allowed uppercase text-sm tracking-widest font-medium"
                >
                  Out of Stock
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        <RelatedProducts productId={product.id} category={product.category} />

        {/* Reviews Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <ProductReviews productId={product.id} />
        </div>
      </div>
    </div>

    {/* Sticky Add to Cart for Mobile */}
    <StickyAddToCart
      productId={product.id}
      productName={product.name}
      productPrice={product.price}
      inStock={product.inStock}
    />
    </>
  );
}
