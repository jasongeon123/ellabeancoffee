import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { CartProvider } from "@/contexts/CartContext";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import ProgressBar from "@/components/ProgressBar";
import Footer from "@/components/Footer";
import DownScrollSnap from "@/components/DownScrollSnap";
import { Analytics } from "@vercel/analytics/react";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import FacebookPixel from "@/components/analytics/FacebookPixel";

const inter = Inter({
  subsets: ["latin"],
  display: "swap", // Prevent font loading blocking render
  variable: "--font-inter", // Use CSS variable for flexibility
  preload: true, // Preload font for faster initial render
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ellabeancoffee.com';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Ella Bean Coffee - Premium Artisan Coffee & Mobile Café",
    template: "%s | Ella Bean Coffee",
  },
  description: "Discover premium artisan coffee at Ella Bean Coffee. Shop specialty coffee beans, visit our mobile café locations, and experience the finest coffee crafted with passion. Free shipping on orders over $50.",
  keywords: [
    "artisan coffee",
    "specialty coffee",
    "coffee beans",
    "mobile café",
    "premium coffee",
    "coffee shop",
    "Ella Bean Coffee",
    "espresso",
    "coffee subscription",
  ],
  authors: [{ name: "Ella Bean Coffee" }],
  creator: "Ella Bean Coffee",
  publisher: "Ella Bean Coffee",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "Ella Bean Coffee",
    title: "Ella Bean Coffee - Premium Artisan Coffee & Mobile Café",
    description: "Discover premium artisan coffee at Ella Bean Coffee. Shop specialty coffee beans and visit our mobile café locations.",
    images: [
      {
        url: `${baseUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Ella Bean Coffee - Premium Artisan Coffee",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ella Bean Coffee - Premium Artisan Coffee",
    description: "Discover premium artisan coffee at Ella Bean Coffee. Shop specialty coffee beans and visit our mobile café locations.",
    images: [`${baseUrl}/og-image.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <GoogleAnalytics />
        <FacebookPixel />
        <AuthProvider>
          <CartProvider>
            <DownScrollSnap />
            <ProgressBar />
            <Navbar />
            <PageTransition>{children}</PageTransition>
            <Footer />
          </CartProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
