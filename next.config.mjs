/** @type {import('next').NextConfig} */
const nextConfig = {
  // Don't fail build on prerender errors - just skip static generation for those pages
  staticPageGenerationTimeout: 120,
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Exclude Prisma from webpack bundling (required for Vercel deployment)
  serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  images: {
    remotePatterns: [],
    // Limit image sizes to prevent memory exhaustion attacks
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Limit image formats
    formats: ['image/webp'],
    // Minimize image optimization to prevent CPU exhaustion
    minimumCacheTTL: 60,
  },
  // Enable React strict mode for better error detection
  reactStrictMode: true,
  // Disable x-powered-by header to hide Next.js usage
  poweredByHeader: false,
  // Compress responses
  compress: true,
  // Production source maps (disable in production for security)
  productionBrowserSourceMaps: false,
  // Experimental features for better security
  experimental: {
    // Enable server actions protection
    serverActions: {
      bodySizeLimit: '2mb', // Limit request body size
    },
    // Optimize package imports for better tree-shaking
    optimizePackageImports: [
      '@stripe/react-stripe-js',
      '@stripe/stripe-js',
      'next-auth',
      '@prisma/client',
      'react-icons',
    ],
    // Enable TypeScript plugin optimizations
    typedRoutes: false,
  },
  // Enable SWC minification for better performance
  swcMinify: true,
  // Webpack configuration for bundle optimization
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Enable aggressive tree shaking in production
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }

    // Externalize Prisma for server bundles (required for Vercel)
    if (isServer) {
      config.externals = [...(config.externals || []), '@prisma/client', 'prisma'];
    }

    return config;
  },
};

export default nextConfig;
