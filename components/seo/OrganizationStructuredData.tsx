export default function OrganizationStructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ellabeancoffee.com';

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Ella Bean Coffee',
    url: baseUrl,
    logo: `${baseUrl}/logo.jpg`,
    description:
      'Premium artisan coffee and mobile café serving specialty coffee beans and beverages',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'US',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'info@ellabeancoffee.com',
    },
    sameAs: [
      // Add your social media URLs here
      // 'https://www.facebook.com/ellabeancoffee',
      // 'https://www.instagram.com/ellabeancoffee',
      // 'https://twitter.com/ellabeancoffee',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
