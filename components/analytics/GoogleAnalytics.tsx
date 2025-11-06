"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;

    const url = pathname + searchParams.toString();

    // Send pageview with a custom path
    window.gtag?.("config", GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }, [pathname, searchParams]);

  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
}

// Helper function to track custom events
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  if (!GA_MEASUREMENT_ID) return;

  window.gtag?.("event", eventName, eventParams);
};

// E-commerce event helpers
export const trackPurchase = (
  transactionId: string,
  value: number,
  items: any[]
) => {
  trackEvent("purchase", {
    transaction_id: transactionId,
    value,
    currency: "USD",
    items,
  });
};

export const trackAddToCart = (item: {
  id: string;
  name: string;
  price: number;
  quantity: number;
}) => {
  trackEvent("add_to_cart", {
    currency: "USD",
    value: item.price * item.quantity,
    items: [
      {
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
      },
    ],
  });
};

export const trackBeginCheckout = (value: number, items: any[]) => {
  trackEvent("begin_checkout", {
    currency: "USD",
    value,
    items,
  });
};

export const trackViewItem = (item: {
  id: string;
  name: string;
  price: number;
  category?: string;
}) => {
  trackEvent("view_item", {
    currency: "USD",
    value: item.price,
    items: [
      {
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        item_category: item.category,
      },
    ],
  });
};

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, any>
    ) => void;
  }
}
