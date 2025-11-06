interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
  slug?: string;
}

interface Review {
  rating: number;
  comment: string | null;
  createdAt: Date | string;
  user: {
    name: string | null;
  };
}

interface ProductStructuredDataProps {
  product: Product;
  reviews?: Review[];
  averageRating?: number;
  reviewCount?: number;
}

export default function ProductStructuredData({
  product,
  reviews = [],
  averageRating = 0,
  reviewCount = 0,
}: ProductStructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ellabeancoffee.com';
  const productUrl = `${baseUrl}/products/${product.slug || product.id}`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image.startsWith('http') ? product.image : `${baseUrl}${product.image}`,
    url: productUrl,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'Ella Bean Coffee',
    },
    offers: {
      '@type': 'Offer',
      price: product.price.toFixed(2),
      priceCurrency: 'USD',
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: productUrl,
      seller: {
        '@type': 'Organization',
        name: 'Ella Bean Coffee',
      },
    },
    ...(reviewCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: averageRating.toFixed(1),
        reviewCount: reviewCount,
        bestRating: '5',
        worstRating: '1',
      },
    }),
    ...(reviews.length > 0 && {
      review: reviews.slice(0, 10).map((review) => ({
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: review.rating,
          bestRating: '5',
          worstRating: '1',
        },
        author: {
          '@type': 'Person',
          name: review.user.name || 'Anonymous',
        },
        datePublished: new Date(review.createdAt).toISOString(),
        ...(review.comment && { reviewBody: review.comment }),
      })),
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
